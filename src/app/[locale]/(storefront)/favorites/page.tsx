import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import Product from "@/models/Product";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { HeartIcon } from "@phosphor-icons/react/dist/ssr";

/**
 * Favorites page: customer's saved products.
 * Redirected by proxy.ts if not authenticated.
 */
export default async function FavoritesPage() {
  const t = await getTranslations("favorites");
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const customer = await Customer.findById(session.user.id).lean();
  if (!customer) return null;

  // Fetch favorite products
  const favoriteProducts =
    customer.favoriteProductIds && customer.favoriteProductIds.length > 0
      ? await Product.find({
          _id: { $in: customer.favoriteProductIds },
          status: "ACTIVE",
        }).lean()
      : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-heading-xl text-ink-900">{t("title")}</h1>
        <p className="text-body-sm text-mute mt-1">
          {favoriteProducts.length === 0
            ? t("emptyBlurb")
            : t("savedCount", { count: favoriteProducts.length })}
        </p>
      </div>

      {favoriteProducts.length === 0 && (
        <EmptyState
          icon={<HeartIcon size={32} />}
          title={t("empty")}
          action={
            <Link href="/products">
              <Button variant="primary" size="sm">
                {t("browseProducts")}
              </Button>
            </Link>
          }
        />
      )}

      {favoriteProducts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoriteProducts.map((product) => (
            <ProductCard key={product._id.toString()} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
