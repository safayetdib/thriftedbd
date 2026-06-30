import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

const BASE = "https://thriftedbd.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  const [products, categories] = await Promise.all([
    Product.find({ status: "ACTIVE" }, { slug: 1, updatedAt: 1 }).lean(),
    Category.find({ isActive: true }, { slug: 1, level: 1 }).lean(),
  ]);

  const topLevelCategories = categories.filter((c) => c.level === 0);

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE}/products`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    ...topLevelCategories.map((c) => ({
      url: `${BASE}/products?category=${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${BASE}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
