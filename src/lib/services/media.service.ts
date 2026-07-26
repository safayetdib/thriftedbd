import { deleteR2Object, listR2Objects, type R2Object } from "@/lib/services/upload.service";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Promotion from "@/models/Promotion";
import Settings from "@/models/Settings";

export type MediaItem = R2Object & { inUse: boolean };

/**
 * Collects every R2 key currently referenced anywhere - product images, category
 * covers, promotion images, and hero slides - so the gallery can flag "in use"
 * assets and block their deletion (which would break a live page).
 */
async function collectUsedKeys(): Promise<Set<string>> {
  const used = new Set<string>();

  const [products, categories, promotions, settings] = await Promise.all([
    Product.find({}, { images: 1 }).lean(),
    Category.find({ "coverImage.key": { $exists: true } }, { coverImage: 1 }).lean(),
    Promotion.find({ imageKey: { $exists: true, $ne: "" } }, { imageKey: 1 }).lean(),
    Settings.findOne({}, { homepage: 1 }).lean(),
  ]);

  for (const p of products) {
    for (const img of (p.images ?? []) as { key?: string }[]) {
      if (img.key) used.add(img.key);
    }
  }
  for (const c of categories as { coverImage?: { key?: string } }[]) {
    if (c.coverImage?.key) used.add(c.coverImage.key);
  }
  for (const promo of promotions as { imageKey?: string }[]) {
    if (promo.imageKey) used.add(promo.imageKey);
  }
  const slides = (settings as { homepage?: { heroSlides?: { imageKey?: string }[] } } | null)
    ?.homepage?.heroSlides;
  for (const slide of slides ?? []) {
    if (slide.imageKey) used.add(slide.imageKey);
  }

  return used;
}

/** Paginated, searchable, date-sortable view of the R2 media library. */
export async function getMediaLibrary(params: {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "newest" | "oldest";
}) {
  const [objects, usedKeys] = await Promise.all([listR2Objects(), collectUsedKeys()]);

  let items: MediaItem[] = objects.map((o) => ({ ...o, inUse: usedKeys.has(o.key) }));

  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    items = items.filter((o) => o.key.toLowerCase().includes(q));
  }

  items.sort((a, b) =>
    params.sort === "oldest" ? a.lastModified - b.lastModified : b.lastModified - a.lastModified,
  );

  const total = items.length;
  const usedCount = items.filter((i) => i.inUse).length;
  const limit = params.limit && params.limit > 0 ? params.limit : 24;
  const page = params.page && params.page > 0 ? params.page : 1;
  const start = (page - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    total,
    usedCount,
    orphanCount: total - usedCount,
    page,
    limit,
  };
}

/** Deletes an R2 object, refusing if it's still referenced by any entity. */
export async function deleteMedia(key: string) {
  const usedKeys = await collectUsedKeys();
  if (usedKeys.has(key)) throw new Error("IN_USE");
  await deleteR2Object(key);
}
