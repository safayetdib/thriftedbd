import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getProductById } from "@/lib/services/product.service";
import { getActiveCategories } from "@/lib/services/category.service";
import { getActiveColors } from "@/lib/services/color.service";
import { getActiveOwners } from "@/lib/services/owner.service";
import { ProductForm } from "@/components/admin/product-form";
import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { archiveProductAction } from "../actions";
import { Button } from "@/components/ui/button";
import type { IProductImage } from "@/models/Product";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await connectDB();
  const [product, categories, colors, owners] = await Promise.all([
    getProductById(id),
    getActiveCategories(),
    getActiveColors(),
    getActiveOwners(),
  ]);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-ink-900 text-2xl font-extrabold">Edit product</h1>
        {product.status !== "ARCHIVED" && (
          <ConfirmableForm
            action={archiveProductAction.bind(null, id)}
            title={`Archive "${product.title.en}"?`}
            description="It will be hidden from the storefront and admin product list. You can't undo this from here."
            confirmLabel="Archive"
            confirmVariant="destructive"
          >
            <Button type="submit" variant="destructive" size="sm">
              Archive
            </Button>
          </ConfirmableForm>
        )}
      </div>
      <ProductForm
        productId={id}
        initial={{
          slug: product.slug,
          title: product.title,
          brand: product.brand,
          categoryId: String(product.categoryId),
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          images: product.images.map((img: IProductImage, i: number) => ({
            url: img.url,
            key: img.key,
            order: img.order ?? i,
          })),
          size: product.size,
          colorId: String(product.colorId),
          ownerId: String(product.ownerId),
          grade: product.grade,
          condition: product.condition,
          notes: product.notes,
          status: product.status,
        }}
        categories={categories.map((c) => ({ _id: String(c._id), name: c.name }))}
        colors={colors.map((c) => ({ _id: String(c._id), name: c.name }))}
        owners={owners.map((o) => ({ _id: String(o._id), name: o.name }))}
      />
    </div>
  );
}
