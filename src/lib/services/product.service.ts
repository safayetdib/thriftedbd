import { randomUUID } from "crypto";
import mongoose from "mongoose";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Color from "@/models/Color";
import Owner from "@/models/Owner";
import { withBanglaDraft } from "@/lib/services/translate.service";
import { deleteR2Objects } from "@/lib/services/upload.service";
import type { CreateProductInput, UpdateProductInput } from "@/lib/validations/product.schema";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

function clampLimit(limit?: number) {
  if (!limit || limit < 1) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

async function buildCategoryPath(categoryId: string) {
  const category = await Category.findById(categoryId).lean();
  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  const chain = [category];
  let parentId = category.parentId;
  while (parentId) {
    const parent = await Category.findById(parentId).lean();
    if (!parent) break;
    chain.unshift(parent);
    parentId = parent.parentId;
  }

  return {
    en: chain.map((c) => c.name.en).join(" / "),
    bn: chain.map((c) => c.name.bn ?? c.name.en).join(" / "),
  };
}

function generateSku() {
  return `TBD-${randomUUID().split("-")[0].toUpperCase()}`;
}

/**
 * Returns the category id plus every descendant id, so filtering by a parent
 * department (e.g. "Girls") also returns products filed under its subcategories
 * (e.g. "Girls / Tops"). Walks the tree breadth-first with a depth cap.
 */
async function collectCategoryAndDescendantIds(rootId: string) {
  if (!mongoose.isValidObjectId(rootId)) return [];
  const root = new mongoose.Types.ObjectId(rootId);
  const ids: mongoose.Types.ObjectId[] = [root];
  let frontier: mongoose.Types.ObjectId[] = [root];

  for (let depth = 0; depth < 6 && frontier.length > 0; depth++) {
    const children = await Category.find({ parentId: { $in: frontier } }, { _id: 1 }).lean();
    if (children.length === 0) break;
    const childIds = children.map((c) => c._id as mongoose.Types.ObjectId);
    ids.push(...childIds);
    frontier = childIds;
  }
  return ids;
}

/** Latin, lowercase, hyphen-separated slug body (no uniqueness suffix). */
function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Auto-generates a unique, human-readable slug: the slugified title plus the
 * SKU's random code so unique thrift items never collide, e.g.
 * "Green Cotton T-Shirt" + SKU "TBD-A1B2C3D4" -> "green-cotton-t-shirt-a1b2c3d4".
 */
function generateSlug(titleEn: string, sku: string) {
  const body = slugify(titleEn) || "item";
  const suffix = sku.replace(/^TBD-/, "").toLowerCase();
  return `${body}-${suffix}`;
}

/**
 * Drops a size that carries no actual value (e.g. an empty standard string or
 * measurements that are all blank) so we never persist an empty `size` object.
 */
function normalizeSize(size: CreateProductInput["size"]): CreateProductInput["size"] {
  if (!size) return undefined;
  if (size.type === "standard") return size.standard?.trim() ? size : undefined;
  if (size.type === "custom") return size.custom?.trim() ? size : undefined;
  const m = size.measurements;
  const hasMeasurement = Boolean(m && (m.chest || m.length || m.sleeve || m.waist));
  return hasMeasurement ? size : undefined;
}

export async function getActiveProducts(params: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  conditions?: string[];
  colorIds?: string[];
  brands?: string[];
  sort?: "newest" | "price-asc" | "price-desc" | "sale-first";
  /** When true, SOLD products are shown too (marked as sold), not just ACTIVE. */
  includeSold?: boolean;
}) {
  const limit = clampLimit(params.limit);
  const page = params.page && params.page > 0 ? params.page : 1;
  const filter: Record<string, unknown> = params.includeSold
    ? { status: { $in: ["ACTIVE", "SOLD"] } }
    : { status: "ACTIVE" };

  if (params.categoryId) {
    // Include the category and all its subcategories so a parent department
    // (e.g. "Girls") surfaces products filed under its children ("Girls / Tops").
    const categoryIds = await collectCategoryAndDescendantIds(params.categoryId);
    filter.categoryId = { $in: categoryIds };
  }

  if (params.search && params.search.trim()) {
    filter.$text = { $search: params.search.trim() };
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    filter.price = {};
    if (params.minPrice !== undefined)
      (filter.price as Record<string, number>).$gte = params.minPrice;
    if (params.maxPrice !== undefined)
      (filter.price as Record<string, number>).$lte = params.maxPrice;
  }

  if (params.sizes && params.sizes.length > 0) {
    // A selected size may be a standard size (M) or a custom label (e.g. Free
    // size) — match either field.
    filter.$or = [
      { "size.standard": { $in: params.sizes } },
      { "size.custom": { $in: params.sizes } },
    ];
  }

  if (params.conditions && params.conditions.length > 0) {
    filter.condition = { $in: params.conditions };
  }

  if (params.colorIds && params.colorIds.length > 0) {
    filter.colorId = { $in: params.colorIds.map((id) => new mongoose.Types.ObjectId(id)) };
  }

  if (params.brands && params.brands.length > 0) {
    filter.brand = { $in: params.brands };
  }

  // Determine sort
  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (params.sort === "price-asc") sort = { price: 1 };
  else if (params.sort === "price-desc") sort = { price: -1 };
  else if (params.sort === "sale-first") sort = { compareAtPrice: -1, price: 1 };
  // Keep buyable items ahead of sold ones ("ACTIVE" < "SOLD"), then the chosen order.
  if (params.includeSold) sort = { status: 1, ...sort };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

const STANDARD_SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

/**
 * Distinct size labels present across ACTIVE products — standard sizes first (in
 * canonical order) then custom labels. Powers the sidebar size filter so custom
 * sizes (e.g. `H 19" W 10"`) are selectable, not just a hardcoded S/M/L list.
 */
export async function getAvailableSizes(): Promise<string[]> {
  const [standards, customs] = await Promise.all([
    Product.distinct("size.standard", {
      status: { $in: ["ACTIVE", "SOLD"] },
      "size.standard": { $nin: [null, ""] },
    }),
    Product.distinct("size.custom", {
      status: { $in: ["ACTIVE", "SOLD"] },
      "size.custom": { $nin: [null, ""] },
    }),
  ]);
  const std = standards as string[];
  const orderedStandard = [
    ...STANDARD_SIZE_ORDER.filter((s) => std.includes(s)),
    ...std.filter((s) => !STANDARD_SIZE_ORDER.includes(s)).sort(),
  ];
  const orderedCustom = (customs as string[]).slice().sort();
  return [...orderedStandard, ...orderedCustom];
}

export async function getProductBySlug(slug: string) {
  return Product.findOne({ slug }).lean();
}

export async function getProductById(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Product.findById(id).lean();
}

export async function getSimilarProducts(
  productId: string,
  categoryId: string,
  currentPrice: number,
) {
  if (!mongoose.isValidObjectId(productId)) return [];

  const products = await Product.find({
    categoryId,
    status: "ACTIVE",
    _id: { $ne: productId },
  })
    .sort({ price: 1 })
    .limit(20)
    .lean();

  // Sort by distance from current price, return 8 closest
  return products
    .sort((a, b) => Math.abs(a.price - currentPrice) - Math.abs(b.price - currentPrice))
    .slice(0, 8);
}

export async function getAdminProducts(params: { page?: number; limit?: number; status?: string }) {
  const limit = clampLimit(params.limit);
  const page = params.page && params.page > 0 ? params.page : 1;
  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

export async function createProduct(input: CreateProductInput) {
  const [categoryPath, color, owner, title, description, notes] = await Promise.all([
    buildCategoryPath(input.categoryId),
    input.colorId ? Color.findById(input.colorId).lean() : null,
    Owner.findById(input.ownerId).lean(),
    withBanglaDraft(input.title),
    input.description ? withBanglaDraft(input.description) : undefined,
    input.notes ? withBanglaDraft(input.notes) : undefined,
  ]);

  // Colour is optional; only fail if an id was supplied but doesn't resolve.
  if (input.colorId && !color) throw new Error("COLOR_NOT_FOUND");
  if (!owner) throw new Error("OWNER_NOT_FOUND");

  const sku = generateSku();
  const slug = input.slug ?? generateSlug(input.title.en, sku);

  return Product.create({
    sku,
    slug,
    title,
    brand: input.brand,
    categoryId: input.categoryId,
    categoryPath,
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    images: input.images ?? [],
    size: normalizeSize(input.size),
    colorId: input.colorId,
    color: color?.name,
    ownerId: input.ownerId,
    owner: owner.name,
    grade: input.grade,
    condition: input.condition,
    description,
    notes,
    status: input.status ?? "DRAFT",
  });
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const update: Record<string, unknown> = { ...input };
  if (input.size !== undefined) update.size = normalizeSize(input.size);

  // If the images array is being replaced, collect the R2 keys that were
  // dropped so their objects can be deleted after the update succeeds.
  let removedImageKeys: string[] = [];
  if (input.images) {
    const current = await Product.findById(id).select("images").lean();
    const nextKeys = new Set(input.images.map((img) => img.key));
    const currentImages: { key: string }[] = current?.images ?? [];
    removedImageKeys = currentImages
      .map((img) => img.key)
      .filter((key) => key && !nextKeys.has(key));
  }

  if (input.title) {
    update.title = await withBanglaDraft(input.title);
  }
  if (input.description) {
    update.description = await withBanglaDraft(input.description);
  }
  if (input.notes) {
    update.notes = await withBanglaDraft(input.notes);
  }
  if (input.categoryId) {
    update.categoryPath = await buildCategoryPath(input.categoryId);
  }
  if (input.colorId) {
    const color = await Color.findById(input.colorId).lean();
    if (!color) throw new Error("COLOR_NOT_FOUND");
    update.color = color.name;
  }
  if (input.ownerId) {
    const owner = await Owner.findById(input.ownerId).lean();
    if (!owner) throw new Error("OWNER_NOT_FOUND");
    update.owner = owner.name;
  }

  const updated = await Product.findByIdAndUpdate(id, update, { new: true });
  if (removedImageKeys.length > 0) {
    await deleteR2Objects(removedImageKeys);
  }
  return updated;
}

export async function archiveProduct(id: string) {
  return Product.findByIdAndUpdate(id, { status: "ARCHIVED" }, { new: true });
}

/**
 * Permanently removes an ARCHIVED product and deletes its R2 images. Guarded to
 * archived-only so active/draft/sold products can't be hard-deleted by accident.
 */
export async function deleteProductPermanently(id: string) {
  const product = await Product.findById(id);
  if (!product) throw new Error("PRODUCT_NOT_FOUND");
  if (product.status !== "ARCHIVED") throw new Error("NOT_ARCHIVED");

  const keys = (product.images ?? []).map((img: { key: string }) => img.key).filter(Boolean);
  await product.deleteOne();
  if (keys.length > 0) await deleteR2Objects(keys);
  return { _id: id };
}
