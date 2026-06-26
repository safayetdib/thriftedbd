# thriftedBD — API & Data-Access Conventions

Read this before writing or editing any API route handler.

## 1. Route structure
- Route handlers live under `src/app/api/.../route.ts`, REST-style: `/api/products`, `/api/products/[slug]`, `/api/orders`, `/api/orders/[orderNumber]`, `/api/cart`, `/api/customers`.
- Admin-only mutations get their own namespace: `/api/admin/products`, `/api/admin/orders`, etc. — never reuse a public route for admin actions with a role check buried inside; separate routes make the auth boundary visible at a glance.

## 2. Validation
- Every route handler validates its input with **Zod** before touching the database — schemas live in `src/lib/validations/` and mirror the Mongoose models (e.g. `product.schema.ts`).
- Never trust client-supplied `price`, `stock`, or `status`. Order totals are recalculated server-side from the current product price at confirmation time, never taken from the client payload.

## 3. Service layer (where DB calls live)
- Route handlers stay thin. Actual Mongoose calls live in `src/lib/services/{collection}.service.ts` (e.g. `product.service.ts` exporting `getActiveProducts()`, `createProduct()`).
- This matters specifically because of invariants like "stock only changes on order confirmation" — centralizing writes in one service function makes that rule enforceable in one place instead of hopeful convention scattered across route files.

## 4. Atomicity — multi-document writes must use a transaction
MongoDB supports multi-document ACID transactions on any replica set, which includes MongoDB Atlas's free tier (M0) — transactions are available there too, just with a ~60s time limit that's irrelevant for our use case.

**Pattern:**
```js
const session = await mongoose.startSession();
try {
  session.startTransaction();
  await Product.updateOne({ _id, status: "ACTIVE" }, { $set: { status: "SOLD", stock: 0 } }, { session });
  await Order.updateOne({ _id: orderId }, { $set: { orderStatus: "CONFIRMED" }, $push: { statusHistory: {...} } }, { session });
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```

**Operations that must use a transaction** — anything touching more than one document/collection where a partial failure would leave the data inconsistent:
- Order confirmation (stock decrement + `orderStatus` change + `statusHistory` push)
- Cancellation/return (stock restore + `orderStatus` change)
- Cart → order conversion (mark cart `convertedAt` + create the order)
- Remittance reconciliation (one `transactions` record updating `payment.status` across multiple `orders` at once)

## 5. Response shape
- Consistent envelope: `{ data }` on success, `{ error: { message, code } }` on failure. No raw arrays/strings sometimes and objects other times.

**Status codes:**
| Code | When |
|---|---|
| `200` | successful GET/PATCH/PUT with a body |
| `201` | successful POST creating a resource (order, product, customer) |
| `204` | successful DELETE/archive, no body |
| `400` | validation failure (Zod parse error) |
| `401` | no/invalid session |
| `403` | valid session, wrong role |
| `404` | resource doesn't exist |
| `409` | business-rule conflict (e.g. product no longer `ACTIVE` when confirming, duplicate email on registration) |
| `429` | rate limit triggered |
| `500` | unexpected/unhandled |

Deliberately **not** using `422` as a separate bucket from `400` — two buckets (validation vs. conflict) avoids the "which code for this case" ambiguity that splitting it further tends to cause.

## 6. Lists, pagination, mutations
- List endpoints take `?page`, `?limit` (default + max cap, e.g. 24/100) and `?sort` — never an unbounded `find()`.
- Every admin mutation route checks session + role at the top of the handler, before any DB call — never rely on the UI hiding a button as the only protection.
