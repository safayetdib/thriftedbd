import { connectDB } from "@/lib/db";
import { getSettings } from "@/lib/services/settings.service";
import { getActiveProducts } from "@/lib/services/product.service";
import { Button } from "@/components/ui/button";
import { FeaturedProductsForm } from "@/components/admin/featured-products-form";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export const metadata = { title: "Featured Products" };

export default async function FeaturedProductsPage() {
  await connectDB();
  const [settings, allProducts] = await Promise.all([
    getSettings(),
    getActiveProducts({ limit: 1000 }),
  ]);
  const featuredProductIds = settings.homepage?.featuredProductIds?.map(String) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/homepage" prefetch={false}>
          <Button variant="outline" size="icon-sm">
            <ArrowLeftIcon size={16} />
          </Button>
        </Link>
        <h1 className="text-ink-900 text-heading-lg">Featured Products</h1>
      </div>

      <p className="text-charcoal text-body-sm">
        Select up to 10 products to feature on the homepage. They&apos;ll appear in the order you
        select them.
      </p>

      <FeaturedProductsForm
        allProducts={(allProducts.items ?? []).map((p) => ({
          _id: String(p._id),
          title: p.title.en,
        }))}
        initialFeaturedIds={featuredProductIds}
      />
    </div>
  );
}
