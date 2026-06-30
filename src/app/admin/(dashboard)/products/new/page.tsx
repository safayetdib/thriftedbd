import { connectDB } from "@/lib/db";
import { getActiveCategories } from "@/lib/services/category.service";
import { getActiveColors } from "@/lib/services/color.service";
import { getActiveOwners } from "@/lib/services/owner.service";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  await connectDB();
  const [categories, colors, owners] = await Promise.all([
    getActiveCategories(),
    getActiveColors(),
    getActiveOwners(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-ink-900 text-2xl font-extrabold">New product</h1>
      <ProductForm
        categories={categories.map((c) => ({ _id: String(c._id), name: c.name }))}
        colors={colors.map((c) => ({ _id: String(c._id), name: c.name }))}
        owners={owners.map((o) => ({ _id: String(o._id), name: o.name }))}
      />
    </div>
  );
}
