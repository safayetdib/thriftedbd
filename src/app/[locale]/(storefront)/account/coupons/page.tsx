import { getTranslations } from "next-intl/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import { CouponCopyButton } from "@/components/coupons/coupon-copy-button";
import { EmptyState } from "@/components/ui/empty-state";
import { TagIcon } from "@phosphor-icons/react/dist/ssr";

/**
 * Customer coupons page.
 * Shows all active, non-expired coupons available for use.
 */
export default async function AccountCouponsPage() {
  const t = await getTranslations("accountCoupons");
  await connectDB();
  const coupons = await Coupon.find({
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }],
  })
    .sort({ createdAt: -1 })
    .lean();

  const formatDate = (date: Date | undefined) =>
    date ? new Date(date).toLocaleDateString() : t("noExpiry");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-xl text-ink-900">{t("title")}</h1>
        <p className="text-body-sm text-mute">
          {coupons.length === 0 ? t("emptyBlurb") : t("couponCount", { count: coupons.length })}
        </p>
      </div>

      {coupons.length === 0 && <EmptyState icon={<TagIcon size={32} />} title={t("checkBack")} />}

      {coupons.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {coupons.map((coupon) => (
            <div
              key={coupon._id.toString()}
              className="border-hairline flex flex-col gap-3 rounded-none border bg-white p-5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <code className="text-ink-900 font-mono text-lg font-medium break-all">
                  {coupon.code}
                </code>
                <CouponCopyButton code={coupon.code} />
              </div>

              <div className="text-body-sm flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-mute">{t("discount")}:</span>
                  <span className="text-caption-md text-ink-900">
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discountValue}%`
                      : `৳${coupon.discountValue}`}
                  </span>
                </div>

                {coupon.minOrderAmount && (
                  <div className="flex justify-between">
                    <span className="text-mute">{t("minOrder")}:</span>
                    <span className="text-price text-ink-900">৳{coupon.minOrderAmount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-mute">{t("validUntil")}:</span>
                  <span className="text-ink-900">{formatDate(coupon.expiresAt)}</span>
                </div>

                {coupon.maxUses && (
                  <div className="text-caption-sm flex justify-between">
                    <span className="text-mute">{t("uses")}:</span>
                    <span className="text-charcoal">
                      {coupon.usedCount} / {coupon.maxUses}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
