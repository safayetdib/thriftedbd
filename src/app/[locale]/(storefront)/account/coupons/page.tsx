import { getTranslations } from "next-intl/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import { CouponCopyButton } from "@/components/coupons/coupon-copy-button";

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
        <h1 className="text-ink-900 text-2xl font-extrabold">{t("title")}</h1>
        <p className="text-ink-600 text-sm">
          {coupons.length === 0 ? t("emptyBlurb") : t("couponCount", { count: coupons.length })}
        </p>
      </div>

      {coupons.length === 0 && (
        <div className="border-ink-900 flex flex-col items-center gap-4 border-2 bg-white p-8 text-center">
          <p className="text-ink-700">{t("checkBack")}</p>
        </div>
      )}

      {coupons.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {coupons.map((coupon) => (
            <div
              key={coupon._id.toString()}
              className="border-ink-900 flex flex-col gap-3 border-2 bg-white p-5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <code className="font-mono text-lg font-bold text-green-700">{coupon.code}</code>
                <CouponCopyButton code={coupon.code} />
              </div>

              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-600">{t("discount")}:</span>
                  <span className="text-ink-900 font-semibold">
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discountValue}%`
                      : `৳${coupon.discountValue}`}
                  </span>
                </div>

                {coupon.minOrderAmount && (
                  <div className="flex justify-between">
                    <span className="text-ink-600">{t("minOrder")}:</span>
                    <span className="text-ink-900">৳{coupon.minOrderAmount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-ink-600">{t("validUntil")}:</span>
                  <span className="text-ink-900">{formatDate(coupon.expiresAt)}</span>
                </div>

                {coupon.maxUses && (
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-600">{t("uses")}:</span>
                    <span className="text-ink-700">
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
