import Category from "@/models/Category";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validations/category.schema";

export async function getActiveCategories() {
  return Category.find({ isActive: true }).sort({ level: 1, order: 1 }).lean();
}

export async function getCategoryById(id: string) {
  return Category.findById(id).lean();
}

export async function createCategory(input: CreateCategoryInput) {
  let level = 0;
  if (input.parentId) {
    const parent = await Category.findById(input.parentId).lean();
    if (!parent) {
      throw new Error("PARENT_NOT_FOUND");
    }
    level = parent.level + 1;
  }

  return Category.create({
    name: input.name,
    slug: input.slug,
    parentId: input.parentId ?? null,
    level,
    order: input.order ?? 0,
  });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  // parentId is intentionally not re-derivable here — changing a category's
  // parent would require recomputing level for the whole subtree, which is
  // out of scope until that need actually shows up.
  const { parentId: _parentId, ...rest } = input;
  return Category.findByIdAndUpdate(id, rest, { new: true });
}

export async function deactivateCategory(id: string) {
  return Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
}
