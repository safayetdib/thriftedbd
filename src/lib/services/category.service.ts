import Category from "@/models/Category";
import { deleteR2Objects } from "@/lib/services/upload.service";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validations/category.schema";

export async function getActiveCategories() {
  return Category.find({ isActive: true }).sort({ level: 1, order: 1 }).lean();
}

/**
 * Categories ordered as a tree (each department followed by its children) with
 * a "Parent / Child" label — used by the admin product form's category picker so
 * a subcategory like "Pants" is unambiguous across departments (Men / Pants vs
 * Women / Pants).
 */
export async function getCategoryTreeOptions() {
  const cats = await getActiveCategories();
  const byId = new Map(cats.map((c) => [String(c._id), c]));
  const departments = cats.filter((c) => c.level === 0);
  const ordered = departments.flatMap((d) => [
    d,
    ...cats.filter((c) => c.level > 0 && String(c.parentId) === String(d._id)),
  ]);
  const rest = cats.filter((c) => !ordered.includes(c));
  return [...ordered, ...rest].map((c) => {
    const parent = c.parentId ? byId.get(String(c.parentId)) : undefined;
    return { _id: String(c._id), label: parent ? `${parent.name.en} / ${c.name.en}` : c.name.en };
  });
}

/**
 * Slugs must be globally unique so `?category=<slug>` always resolves to one
 * category. Two departments can each have a "Pants" subcategory, but they need
 * distinct slugs (e.g. "mens-pants", "womens-pants").
 */
async function assertSlugUnique(slug: string, excludeId?: string) {
  const existing = await Category.findOne({ slug }).lean();
  if (existing && String(existing._id) !== excludeId) {
    throw new Error("SLUG_TAKEN");
  }
}

export async function getCategoryById(id: string) {
  return Category.findById(id).lean();
}

export async function createCategory(input: CreateCategoryInput) {
  await assertSlugUnique(input.slug);

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
    coverImage: input.coverImage,
  });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  // parentId is intentionally not re-derivable here — changing a category's
  // parent would require recomputing level for the whole subtree, which is
  // out of scope until that need actually shows up.
  const { parentId: _parentId, ...rest } = input;

  if (rest.slug) await assertSlugUnique(rest.slug, id);

  // The admin form always submits the current coverImage state, so a changed
  // or cleared key means the old R2 object is now orphaned — delete it.
  const current = await Category.findById(id).select("coverImage").lean();
  const updated = await Category.findByIdAndUpdate(id, rest, { new: true });

  const oldKey = current?.coverImage?.key;
  const newKey = rest.coverImage?.key;
  if (oldKey && oldKey !== newKey) {
    await deleteR2Objects([oldKey]);
  }
  return updated;
}

export async function deactivateCategory(id: string) {
  return Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
}
