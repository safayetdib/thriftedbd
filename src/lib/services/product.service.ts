import { randomUUID } from "crypto";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Color from "@/models/Color";
import Owner from "@/models/Owner";
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
}) {
  const limit = clampLimit(params.limit);
  const page = params.page && params.page > 0 ? params.page : 1;
  const filter: Record<string, unknown> = { status: "ACTIVE" };
  if (params.categoryId) filter.categoryId = params.categoryId;

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

export async function getProductBySlug(slug: string) {
  return Product.findOne({ slug }).lean();
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
  const [categoryPath, color, owner] = await Promise.all([
    buildCategoryPath(input.categoryId),
    Color.findById(input.colorId).lean(),
    Owner.findById(input.ownerId).lean(),
  ]);

  if (!color) throw new Error("COLOR_NOT_FOUND");
  if (!owner) throw new Error("OWNER_NOT_FOUND");

  return Product.create({
    sku: generateSku(),
    slug: input.slug,
    title: input.title,
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
    notes: input.notes,
    status: input.status ?? "DRAFT",
  });
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const update: Record<string, unknown> = { ...input };

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
