import { connectDB } from "@/lib/db";
import { getSettings } from "@/lib/services/settings.service";
import { Button } from "@/components/ui/button";
import type { IHeroSlide, IWhyBuyBlock, IFaqItem } from "@/models/Settings";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-ink-900 flex flex-col gap-4 border-2 bg-white p-5">
      <h2 className="text-eyebrow text-ink-500">{title}</h2>
      {children}
    </div>
  );
}

export default async function AdminHomepagePage() {
  await connectDB();
  const settings = await getSettings();
  const homepage = settings.homepage ?? {};

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-ink-900 text-2xl font-extrabold">Homepage</h1>

      <Section title="Hero Slides">
        <p className="text-ink-700 text-sm">{homepage.heroSlides?.length ?? 0} slide(s)</p>
        <div className="flex flex-col gap-2">
          {(homepage.heroSlides ?? []).map((slide: IHeroSlide, idx: number) => (
            <div
              key={idx}
              className="border-ink-200 flex items-center justify-between border-2 p-3"
            >
              <div className="flex flex-col gap-1">
                <p className="text-ink-900 font-semibold">{slide.headline || "Untitled slide"}</p>
                <p className="text-ink-500 text-xs">{slide.imageUrl ? "Has image" : "No image"}</p>
              </div>
              <span className="text-ink-500 text-xs">{slide.enabled ? "Enabled" : "Disabled"}</span>
            </div>
          ))}
          {(homepage.heroSlides?.length ?? 0) === 0 && (
            <p className="text-ink-500 text-sm">No hero slides configured yet.</p>
          )}
        </div>
        <Button variant="secondary" size="sm" disabled>
          Manage hero slides (coming soon)
        </Button>
      </Section>

      <Section title="Featured Products">
        <p className="text-ink-700 text-sm">
          {homepage.featuredProductIds?.length ?? 0} product(s)
        </p>
        <p className="text-ink-500 text-xs">
          {(homepage.featuredProductIds ?? []).join(", ") || "No products selected"}
        </p>
        <Button variant="secondary" size="sm" disabled>
          Manage featured products (coming soon)
        </Button>
      </Section>

      <Section title="Featured Categories">
        <p className="text-ink-700 text-sm">
          {homepage.featuredCategoryIds?.length ?? 0} categor(y|ies)
        </p>
        <p className="text-ink-500 text-xs">
          {(homepage.featuredCategoryIds ?? []).join(", ") || "No categories selected"}
        </p>
        <Button variant="secondary" size="sm" disabled>
          Manage featured categories (coming soon)
        </Button>
      </Section>

      <Section title="Why buy from us">
        <p className="text-ink-700 text-sm">{homepage.whyBuyBlocks?.length ?? 0} block(s)</p>
        {(homepage.whyBuyBlocks ?? []).map((block: IWhyBuyBlock, idx: number) => (
          <div key={idx} className="border-ink-200 border-2 p-3">
            <p className="text-ink-900 font-semibold">{block.icon}</p>
            <p className="text-ink-700 text-sm">{block.title?.en || "Untitled"}</p>
          </div>
        ))}
        {(homepage.whyBuyBlocks?.length ?? 0) === 0 && (
          <p className="text-ink-500 text-sm">No blocks configured yet.</p>
        )}
        <Button variant="secondary" size="sm" disabled>
          Manage blocks (coming soon)
        </Button>
      </Section>

      <Section title="FAQ">
        <p className="text-ink-700 text-sm">{homepage.faqs?.length ?? 0} item(s)</p>
        {(homepage.faqs ?? []).map((item: IFaqItem, idx: number) => (
          <div key={idx} className="border-ink-200 border-2 p-3">
            <p className="text-ink-900 text-sm font-semibold">{item.question?.en || "Untitled"}</p>
          </div>
        ))}
        {(homepage.faqs?.length ?? 0) === 0 && (
          <p className="text-ink-500 text-sm">No FAQs configured yet.</p>
        )}
        <Button variant="secondary" size="sm" disabled>
          Manage FAQs (coming soon)
        </Button>
      </Section>

      <div className="bg-ink-50 border-ink-300 flex flex-col gap-2 border-2 p-4">
        <p className="text-ink-700 font-semibold">Note</p>
        <p className="text-ink-600 text-sm">
          Detailed CMS editors for hero slides, featured products, and FAQ management are coming
          soon. For now, you can manage these via the API or contact the development team.
        </p>
      </div>
    </div>
  );
}
