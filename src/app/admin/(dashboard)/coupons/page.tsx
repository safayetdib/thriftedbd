import { PlusIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getAllCoupons } from "@/lib/services/coupon.service";
import { Button } from "@/components/ui/button";
import { EntityFormDialog, type EntityField } from "@/components/admin/entity-form-dialog";
import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { createCouponAction, updateCouponAction, deleteCouponAction } from "./actions";

const FIELDS: EntityField[] = [
  { name: "code", label: "Code", required: true },
  {
    name: "discountType",
    label: "Discount type",
    required: true,
    type: "select",
    options: ["PERCENTAGE", "FIXED_BDT"],
  },
  { name: "discountValue", label: "Discount value", required: true, type: "number" },
  { name: "minOrderAmount", label: "Min order amount (৳)", type: "number" },
  { name: "maxUses", label: "Max uses (leave blank for unlimited)", type: "number" },
  { name: "expiresAt", label: "Expires at (ISO 8601)" },
];

export default async function AdminCouponsPage() {
  await connectDB();
  const result = await getAllCoupons({ page: 1, limit: 100 });
  const coupons = result.items;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-ink-900 text-2xl font-extrabold">Coupons</h1>
        <EntityFormDialog
          trigger={
            <Button variant="primary" size="sm">
              <PlusIcon size={16} /> New coupon
            </Button>
          }
          title="New coupon"
          fields={FIELDS}
          onSubmit={createCouponAction}
        />
      </div>

      <div className="border-ink-900 overflow-x-auto border-2 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-ink-900 bg-ink-100 border-b-2">
            <tr>
              <th className="text-ink-900 px-4 py-3 font-bold">Code</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Discount</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Min order</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Uses / Limit</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Expires</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Active</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="text-ink-500 px-4 py-8 text-center">
                  No coupons yet. Create one to get started.
                </td>
              </tr>
            )}
            {coupons.map((coupon) => (
              <tr key={coupon._id.toString()} className="border-ink-900 border-t-2">
                <td className="px-4 py-3 font-semibold">{coupon.code}</td>
                <td className="px-4 py-3">
                  {coupon.discountType === "PERCENTAGE"
                    ? `${coupon.discountValue}%`
                    : `৳${coupon.discountValue}`}
                </td>
                <td className="px-4 py-3">
                  {coupon.minOrderAmount ? `৳${coupon.minOrderAmount}` : "—"}
                </td>
                <td className="px-4 py-3">
                  {coupon.usedCount} / {coupon.maxUses ?? "∞"}
                </td>
                <td className="px-4 py-3 text-xs">
                  {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={coupon.isActive ? "font-bold text-green-700" : "text-ink-500"}>
                    {coupon.isActive ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <EntityFormDialog
                      trigger={
                        <Button variant="secondary" size="sm">
                          <PencilSimpleIcon size={14} />
                        </Button>
                      }
                      title="Edit coupon"
                      fields={FIELDS}
                      initialValues={coupon as Record<string, unknown>}
                      onSubmit={(input) => updateCouponAction(coupon._id.toString(), input)}
                    />
                    <ConfirmableForm
                      action={() => deleteCouponAction(coupon._id.toString())}
                      title="Delete coupon?"
                      description="This action cannot be undone."
                      confirmLabel="Delete"
                      confirmVariant="destructive"
                    >
                      <Button variant="secondary" size="sm" type="submit">
                        <TrashIcon size={14} />
                      </Button>
                    </ConfirmableForm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
