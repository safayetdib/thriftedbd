import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { IPromotion } from "@/models/Promotion";

/**
 * Promotion card component.
 * Displays promotion banner with optional image, headline, body, and CTA.
 */
export function PromotionCard({ promotion }: { promotion: IPromotion }) {
  return (
    <div
      className="border-ink-900 flex flex-col justify-between border-2 p-6 md:p-8"
      style={{ backgroundColor: promotion.backgroundColor || "#1a1a1a" }}
    >
      <div>
        {promotion.headline?.en && (
          <h3
            className="mb-2 font-extrabold"
            style={{
              fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
              color: promotion.backgroundColor ? "white" : undefined,
            }}
          >
            {promotion.headline.en}
          </h3>
        )}

        {promotion.body?.en && (
          <p
            className="mb-4 text-sm"
            style={{
              color: promotion.backgroundColor ? "rgba(255,255,255,0.9)" : undefined,
            }}
          >
            {promotion.body.en}
          </p>
        )}
      </div>

      {promotion.ctaLink && promotion.ctaText?.en && (
        <Link href={promotion.ctaLink}>
          <Button variant="primary" size="sm" className="w-fit">
            {promotion.ctaText.en}
          </Button>
        </Link>
      )}
    </div>
  );
}
