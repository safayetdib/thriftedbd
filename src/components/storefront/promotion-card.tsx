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
      className="border-ink-900 flex flex-col justify-between border-2 p-6 md:p-8"
      style={{ backgroundColor: promotion.backgroundColor || "#1a1a1a" }}
    >
      <div>
        {localize(promotion.headline, locale) && (
          <h3
            className="mb-2 font-extrabold"
            style={{
              fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
              color: promotion.backgroundColor ? "white" : undefined,
            }}
          >
            {localize(promotion.headline, locale)}
          </h3>
        )}

        {localize(promotion.body, locale) && (
          <p
            className="mb-4 text-sm"
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
