import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import { Button } from "@/components/ui/button";
import type { IPromotion } from "@/models/Promotion";

/**
 * Promotion card component.
 * Displays promotion banner with optional image, headline, body, and CTA.
 */
export function PromotionCard({ promotion }: { promotion: IPromotion }) {
  const locale = useLocale();
  return (
    <div
      className="flex flex-col justify-between rounded-xl p-6"
      style={{ backgroundColor: promotion.backgroundColor || "#1a1a1a" }}
    >
      <div>
        {localize(promotion.headline, locale) && (
          <h3
            className="text-display-xs mb-2 font-semibold"
            style={{
              color: promotion.backgroundColor ? "white" : undefined,
            }}
          >
            {localize(promotion.headline, locale)}
          </h3>
        )}

        {localize(promotion.body, locale) && (
          <p
            className="text-body-sm mb-4"
            style={{
              color: promotion.backgroundColor ? "rgba(255,255,255,0.9)" : undefined,
            }}
          >
            {localize(promotion.body, locale)}
          </p>
        )}
      </div>

      {promotion.ctaLink && localize(promotion.ctaText, locale) && (
        <Link href={promotion.ctaLink}>
          <Button variant="primary" size="sm" className="w-fit">
            {localize(promotion.ctaText, locale)}
          </Button>
        </Link>
      )}
    </div>
  );
}
