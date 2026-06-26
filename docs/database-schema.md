# thriftedBD — Database Schema

Full field-by-field reference for all 11 MongoDB collections. Read this before writing Mongoose models, API routes that touch the database, or migrations. See `AGENTS.md` for the business rules and order/cash-handling context that motivated this shape.

## 1. `categories` — department/category/subcategory tree
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `name` | string | e.g. "Palazzo" |
| `slug` | string | unique only among siblings |
| `parentId` | ObjectId \| null | `null` = top-level department (Boy/Girls/Women/Household/Bags) |
| `level` | number | `0` department, `1` category, `2` subcategory — `parent.level + 1` |
| `order` | number | manual sort for nav/admin |
| `isActive` | boolean | deactivate, never delete |
| `createdAt` | Date | |

**Index:** compound unique `{ parentId: 1, slug: 1 }`. Tree is small and cached in app memory; breadcrumbs and "everything under Women" queries are resolved by walking the cached tree, not stored as `ancestors`/`path` in the DB.

## 2. `colors`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `name` | string | unique |
| `hex` | string? | optional swatch |
| `createdAt` | Date | |

## 3. `owners` — who physically holds the inventory
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `name` | string | e.g. "Shaikh", "Saif", "Me" |
| `phone` | string | so whoever packs an order knows who to contact |
| `isActive` | boolean | |
| `createdAt` | Date | |

## 4. `products`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `sku` | string | unique, auto-generated |
| `slug` | string | unique |
| `title` | string | |
| `brand` | string | free text |
| `categoryId` | ObjectId ref → `categories` | leaf-most node selected |
| `categoryPath` | string | denormalized breadcrumb, e.g. "Women / Trousers / Palazzo" |
| `price` | number | BDT, integer |
| `compareAtPrice` | number? | for sale strike-through |
| `images` | array | `[{ url, key, alt, order }]` |
| `size` | object | `{ type: "standard"\|"measurement"\|"custom", standard?, measurements?: {chest, length, sleeve, waist}, custom? }` |
| `colorId` | ObjectId ref → `colors` | |
| `color` | string | denormalized snapshot |
| `ownerId` | ObjectId ref → `owners` | who currently holds the item |
| `owner` | string | denormalized snapshot |
| `grade` | enum | `T \| B \| M \| W \| O` (internal) |
| `condition` | enum | `Excellent \| Good \| Fair` (customer-facing) |
| `notes` | string | free text |
| `stock` | number | 0 or 1 in practice |
| `status` | enum | `DRAFT \| ACTIVE \| SOLD \| ARCHIVED` |
| `createdAt` / `updatedAt` | Date | |

**Indexes:** unique `sku`, unique `slug`, `{status:1, createdAt:-1}`, `{status:1, categoryId:1}`

## 5. `orders`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `orderNumber` | string | unique, human-readable |
| `items` | array | `[{ productId, title, price, image, quantity, ownerId, ownerName }]` — fully snapshotted at order time |
| `customerId` | ObjectId? ref → `customers` | set only if logged in at checkout |
| `customer` | object | `{ name, phone, address, city }` — always present, even for guests |
| `payment` | object | `{ method: "COD"\|"bKash"\|"Nagad"\|"Card", status: "PENDING"\|"PAID"\|"COLLECTED"\|"REMITTED"\|"FAILED"\|"REFUNDED", transactionRef?, collectedAt?, remittedAt? }` — see §10 for why remittance is tracked separately too |
| `confirmationCall` | object | `{ status: "NOT_CALLED"\|"CONFIRMED"\|"UNREACHABLE"\|"ON_HOLD", attempts, calledAt?, calledBy?, notes? }` |
| `riskFlags` | array | `["INVALID_NUMBER","LARGE_ORDER_NEW_BUYER","UNCONFIRMED_ADDRESS","BLACKLISTED_PHONE"]` — extensible string list |
| `advancePayment` | object | `{ required, amount?, status: "NOT_REQUIRED"\|"REQUESTED"\|"PAID"\|"WAIVED", transactionRef?, requestedAt?, paidAt? }` |
| `orderStatus` | enum | `PENDING \| CONFIRMED \| PACKED \| SHIPPED \| DELIVERED \| CANCELLED \| RETURNED` |
| `statusHistory` | array | `[{ status, changedAt, changedBy }]` |
| `courier` | object | `{ provider: "Steadfast"\|"Pathao"\|null, consignmentId?, trackingId?, trackingUrl?, courierStatus? }` |
| `cancelReason` | string? | |
| `notificationsSent` | object | `{ orderConfirmation?, dispatchTracking?, deliveryConfirmation? }` — timestamps, prevents duplicate sends |
| `shippingFee` | number | |
| `total` | number | |
| `createdAt` / `updatedAt` | Date | |

**Indexes:** unique `orderNumber`, `{orderStatus:1, createdAt:-1}`, `{customerId:1, createdAt:-1}`

**Status transition rules:**
- `orderStatus` only advances `PENDING → CONFIRMED` once `confirmationCall.status === "CONFIRMED"` **and** (`advancePayment.required === false` or `advancePayment.status` is `"PAID"`/`"WAIVED"`).
- Stock decrements at that same `PENDING → CONFIRMED` transition, never earlier (never on cart-add or order placement).
- `CANCELLED` and `RETURNED` both restore stock (+1, product back to `ACTIVE`). `RETURNED` should prompt the admin to consider adding the phone to `blacklist`.
- At checkout, look up `customer.phone` against `blacklist`; an active match auto-adds `"BLACKLISTED_PHONE"` to `riskFlags` and should default `advancePayment.required = true`.

## 6. `users` (admin dashboard login)
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `email` | string | unique |
| `passwordHash` | string | |
| `role` | enum | `admin` |
| `createdAt` | Date | |

## 7. `customers` (storefront accounts)
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `email` | string | unique |
| `passwordHash` | string | |
| `name` | string | |
| `phone` | string | |
| `addresses` | array | `[{ label, address, city, isDefault }]` |
| `favoriteProductIds` | array | `[ObjectId ref → products]` |
| `emailVerified` | Date \| null | reserved for later |
| `createdAt` / `updatedAt` | Date | |

## 8. `settings` (singleton)
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `deliveryFee` | object | `{ insideDhaka, outsideDhaka }` |
| `storeContact` | object | `{ phone, email, address }` |
| `socialLinks` | object | `{ facebook, instagram, tiktok, youtube }` |
| `announcement` | string? | top utility bar promo text |
| `riskThresholds` | object | `{ largeOrderAmount }` — drives the `LARGE_ORDER_NEW_BUYER` risk flag |
| `updatedAt` | Date | |

## 9. `carts`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `customerId` | ObjectId? ref → `customers` | set once logged in |
| `cartToken` | string? | httpOnly cookie ID for guests |
| `items` | array | `[{ productId, title, price, image, quantity, addedAt }]` |
| `contactEmail` / `contactPhone` | string? | for abandoned-cart outreach |
| `lastActivityAt` | Date | |
| `convertedAt` | Date \| null | |
| `convertedOrderId` | ObjectId \| null | |
| `createdAt` / `updatedAt` | Date | |

**Indexes:** unique sparse `customerId`, unique sparse `cartToken`, `{convertedAt:1, lastActivityAt:-1}`

## 10. `transactions` — cash ledger
Tracks every cash movement, independent of individual orders, because a single courier remittance often settles several delivered orders at once.

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `type` | enum | `COD_REMITTANCE \| ONLINE_PAYMENT \| ADVANCE_PAYMENT \| REFUND` |
| `amount` | number | |
| `method` | enum | `bKash \| Nagad \| Bank \| Cash` |
| `reference` | string? | transaction ID (bKash TrxID, bank ref) |
| `orderIds` | array | `[ObjectId]` — can cover multiple orders in one remittance batch |
| `courierProvider` | enum? | `Steadfast \| Pathao \| null` |
| `status` | enum | `PENDING \| RECEIVED \| RECONCILED` |
| `receivedAt` | Date? | |
| `recordedBy` | ObjectId ref → `users` | |
| `notes` | string? | |
| `createdAt` | Date | |

**Indexes:** multikey on `orderIds`, index on `status`

## 11. `blacklist` — failed-delivery / risk phone list
Digitizes the manual blacklist spreadsheet.

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `phone` | string | unique |
| `name` | string? | |
| `reason` | string | e.g. "failed delivery x2", "refused COD" |
| `relatedOrderIds` | array | `[ObjectId]` |
| `isActive` | boolean | allows un-blacklisting later |
| `addedBy` | ObjectId ref → `users` | |
| `createdAt` | Date | |

**Index:** unique `phone`
