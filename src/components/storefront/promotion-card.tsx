import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import { readableTextOn } from "@/lib/utils";
import type { IPromotion } from "@/models/Promotion";
import { useLocale } from "next-intl";

/**
 * Promotion card component.
 * Displays promotion banner with optional image, headline, body, and CTA.
 */
export function PromotionCard({ promotion }: { promotion: IPromotion }) {
  const locale = useLocale();
  const background = promotion.backgroundColor || "#1a1a1a";
  const foreground = readableTextOn(background);

  return (
    <div
      // Editorial tile - zero radius, like every campaign surface in the system.
      className="flex flex-col justify-between rounded-none p-6"
      style={{ backgroundColor: background }}
    >
      <div>
        {localize(promotion.headline, locale) && (
          <h3 className="text-heading-lg mb-2" style={{ color: foreground }}>
            {localize(promotion.headline, locale)}
          </h3>
        )}

        {localize(promotion.body, locale) && (
          <p className="text-body-sm mb-4 opacity-90" style={{ color: foreground }}>
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
