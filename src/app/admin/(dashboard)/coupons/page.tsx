import { PlusIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getAllCoupons } from "@/lib/services/coupon.service";
import { Button } from "@/components/ui/button";
import { EntityFormDialog, type EntityField } from "@/components/admin/entity-form-dialog";
import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { createCouponAction, updateCouponAction, deleteCouponAction } from "./actions";
import { EmptyTableRow } from "@/components/ui/empty-state";

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
        <table className="admin-data-table w-full min-w-[900px] text-left text-sm">
          <thead className="border-ink-900 bg-ink-100 border-b-2">
            <tr>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Code</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Discount</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Min order</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Uses / Limit</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Expires</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Active</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && <EmptyTableRow colSpan={7} message="No coupons yet." />}
            {coupons.map((coupon) => (
              <tr
                key={coupon._id.toString()}
                className="border-ink-200 hover:bg-ink-50 border-b transition-colors last:border-0"
              >
                <td className="px-5 py-3.5 font-semibold">{coupon.code}</td>
                <td className="px-5 py-3.5">
                  {coupon.discountType === "PERCENTAGE"
                    ? `${coupon.discountValue}%`
                    : `৳${coupon.discountValue}`}
                </td>
                <td className="px-5 py-3.5">
                  {coupon.minOrderAmount ? `৳${coupon.minOrderAmount}` : "—"}
                </td>
                <td className="px-5 py-3.5">
                  {coupon.usedCount} / {coupon.maxUses ?? "∞"}
                </td>
                <td className="px-5 py-3.5 text-xs">
                  {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-3.5">
                  <span className={coupon.isActive ? "font-bold text-green-700" : "text-ink-500"}>
                    {coupon.isActive ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
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
