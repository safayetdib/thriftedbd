import { randomUUID } from "crypto";
import mongoose from "mongoose";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Color from "@/models/Color";
import Owner from "@/models/Owner";
import { withBanglaDraft } from "@/lib/services/translate.service";
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
}) {
  const limit = clampLimit(params.limit);
  const page = params.page && params.page > 0 ? params.page : 1;
  const filter: Record<string, unknown> = { status: "ACTIVE" };

  if (params.categoryId) filter.categoryId = params.categoryId;

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
    filter["size.standard"] = { $in: params.sizes };
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
  const [categoryPath, color, owner, title, notes] = await Promise.all([
    buildCategoryPath(input.categoryId),
    Color.findById(input.colorId).lean(),
    Owner.findById(input.ownerId).lean(),
    withBanglaDraft(input.title),
    input.notes ? withBanglaDraft(input.notes) : undefined,
  ]);

  if (!color) throw new Error("COLOR_NOT_FOUND");
  if (!owner) throw new Error("OWNER_NOT_FOUND");

  return Product.create({
    sku: generateSku(),
    slug: input.slug,
    title,
    brand: input.brand,
    categoryId: input.categoryId,
    categoryPath,
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    images: input.images ?? [],
    size: input.size,
    colorId: input.colorId,
    color: color.name,
    ownerId: input.ownerId,
    owner: owner.name,
    grade: input.grade,
    condition: input.condition,
    notes,
    status: input.status ?? "DRAFT",
  });
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const update: Record<string, unknown> = { ...input };

  if (input.title) {
    update.title = await withBanglaDraft(input.title);
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

  return Product.findByIdAndUpdate(id, update, { new: true });
}

export async function archiveProduct(id: string) {
  return Product.findByIdAndUpdate(id, { status: "ARCHIVED" }, { new: true });
}
