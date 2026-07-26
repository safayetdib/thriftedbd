"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MAX_UPLOAD_BYTES } from "@/lib/validations/upload.schema";
import { createProductAction, updateProductAction } from "@/app/admin/(dashboard)/products/actions";

/** Slug body preview — mirrors the server's slugify (the unique code is added on save). */
function toSlugBody(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type RefOption = { _id: string; name: { en: string } };
type OwnerOption = { _id: string; name: string };

type ProductImage = { url: string; key: string; order: number };

// Form image. Existing images (edit) carry a `key`; freshly picked images carry
// a `file` (a local preview `url` via object URL) and are only uploaded to R2
// when the product is created/saved. `id` is a stable client key for React/dnd.
type FormImage = { id: string; url: string; order: number; key?: string; file?: File };

type InitialProduct = {
  slug: string;
  title: { en: string; bn?: string };
  brand?: string;
  categoryId: string;
  price: number;
  compareAtPrice?: number;
  images: ProductImage[];
  size?: {
    type: "standard" | "measurement" | "custom";
    standard?: string;
    measurements?: { chest?: number; length?: number; sleeve?: number; waist?: number };
    custom?: string;
  };
  colorId?: string;
  ownerId: string;
  grade: "T" | "B" | "M" | "W" | "O";
  condition: "Excellent" | "Good" | "Fair";
  description?: { en?: string; bn?: string };
  notes?: { en?: string; bn?: string };
  status: "DRAFT" | "ACTIVE" | "SOLD" | "ARCHIVED";
};

export function ProductForm({
  productId,
  initial,
  categories,
  colors,
  owners,
}: {
  productId?: string;
  initial?: InitialProduct;
  categories: RefOption[];
  colors: RefOption[];
  owners: OwnerOption[];
}) {
  const router = useRouter();
  const [titleEn, setTitleEn] = useState(initial?.title.en ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?._id ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [compareAtPrice, setCompareAtPrice] = useState(initial?.compareAtPrice?.toString() ?? "");
  const [images, setImages] = useState<FormImage[]>(() =>
    (initial?.images ?? []).map((img) => ({
      id: img.key,
      url: img.url,
      key: img.key,
      order: img.order,
    })),
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [sizeType, setSizeType] = useState(initial?.size?.type ?? "standard");
  const [sizeStandard, setSizeStandard] = useState(initial?.size?.standard ?? "");
  const [sizeCustom, setSizeCustom] = useState(initial?.size?.custom ?? "");
  const [chest, setChest] = useState(initial?.size?.measurements?.chest?.toString() ?? "");
  const [length, setLength] = useState(initial?.size?.measurements?.length?.toString() ?? "");
  const [sleeve, setSleeve] = useState(initial?.size?.measurements?.sleeve?.toString() ?? "");
  const [waist, setWaist] = useState(initial?.size?.measurements?.waist?.toString() ?? "");
  const [colorId, setColorId] = useState(initial?.colorId ?? "");
  const [ownerId, setOwnerId] = useState(initial?.ownerId ?? owners[0]?._id ?? "");
  const [grade, setGrade] = useState(initial?.grade ?? "T");
  const [condition, setCondition] = useState(initial?.condition ?? "Excellent");
  const [descriptionEn, setDescriptionEn] = useState(initial?.description?.en ?? "");
  const [notesEn, setNotesEn] = useState(initial?.notes?.en ?? "");
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Uploads one file to R2 (presigned PUT) and returns its public url + key.
  async function uploadToR2(file: File): Promise<{ url: string; key: string }> {
    const presignRes = await fetch("/api/admin/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: file.type, fileSize: file.size }),
    });
    const presignJson = await presignRes.json();
    if (!presignRes.ok) throw new Error(presignJson.error?.message ?? "Failed to get upload URL");

    const { uploadUrl, key, publicUrl } = presignJson.data;
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!putRes.ok) throw new Error("Failed to upload image to storage");
    return { url: publicUrl, key };
  }

  // Best-effort R2 cleanup. Used to remove images that were uploaded during a
  // save attempt that ultimately failed, so they don't orphan in the bucket.
  async function cleanupR2Keys(keys: string[]) {
    if (keys.length === 0) return;
    await Promise.allSettled(
      keys.map((key) =>
        fetch("/api/admin/uploads", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key }),
        }),
      ),
    );
  }

  // Picking files does NOT upload — it just adds local previews. The actual R2
  // upload happens (in the chosen order) when the product is created/saved.
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    // Client-side gate mirrors the presign schema: WebP only, ≤500KB each.
    const rejected: string[] = [];
    const valid = files.filter((file) => {
      if (file.type !== "image/webp") {
        rejected.push(`${file.name} (not WebP)`);
        return false;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        rejected.push(`${file.name} (${Math.round(file.size / 1024)}KB > 500KB)`);
        return false;
      }
      return true;
    });

    setError(rejected.length ? `Skipped: ${rejected.join(", ")}. Only WebP images ≤500KB.` : null);
    const additions: FormImage[] = valid.map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      file,
      order: 0,
    }));
    setImages((prev) => [...prev, ...additions].map((img, i) => ({ ...img, order: i })));
  }

  // Removing only updates local state. Nothing is deleted from R2 here: freshly
  // picked images were never uploaded, and removing an existing image is applied
  // (and its R2 object cleaned up) only when the product is saved.
  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.file) URL.revokeObjectURL(target.url);
      return prev.filter((img) => img.id !== id).map((img, i) => ({ ...img, order: i }));
    });
  }

  // Reorder via drag-and-drop. The array order IS the display order — index 0 is
  // the cover shown in listings; the rest follow on the product page gallery.
  // `order` is kept synced to the index so it's authoritative on the server too.
  function moveImage(from: number, to: number) {
    if (from === to) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((img, i) => ({ ...img, order: i }));
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    // Size is optional — only include it when the selected type has a value.
    let size:
      | { type: "standard"; standard: string }
      | { type: "custom"; custom: string }
      | {
          type: "measurement";
          measurements: { chest?: number; length?: number; sleeve?: number; waist?: number };
        }
      | undefined;
    if (sizeType === "standard" && sizeStandard.trim()) {
      size = { type: "standard", standard: sizeStandard };
    } else if (sizeType === "custom" && sizeCustom.trim()) {
      size = { type: "custom", custom: sizeCustom };
    } else if (sizeType === "measurement" && (chest || length || sleeve || waist)) {
      size = {
        type: "measurement",
        measurements: {
          chest: chest ? Number(chest) : undefined,
          length: length ? Number(length) : undefined,
          sleeve: sleeve ? Number(sleeve) : undefined,
          waist: waist ? Number(waist) : undefined,
        },
      };
    }

    // Upload freshly-picked images to R2 now, in their current (dragged) order.
    // Existing images keep their url/key; `order` is the array index. Track the
    // keys uploaded in THIS attempt so we can delete them if the save fails.
    const uploadedThisAttempt: string[] = [];
    let finalImages: { url: string; key: string; order: number }[];
    try {
      finalImages = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.key) {
          finalImages.push({ url: img.url, key: img.key, order: i });
        } else if (img.file) {
          const uploaded = await uploadToR2(img.file);
          uploadedThisAttempt.push(uploaded.key);
          finalImages.push({ url: uploaded.url, key: uploaded.key, order: i });
        }
      }
    } catch (err) {
      await cleanupR2Keys(uploadedThisAttempt);
      setSubmitting(false);
      setConfirmOpen(false);
      setError(err instanceof Error ? err.message : "Image upload failed");
      return;
    }

    const payload = {
      // slug is omitted — the server auto-generates it on create and preserves
      // it on update.
      title: { en: titleEn },
      brand: brand.trim() || undefined,
      categoryId,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      images: finalImages,
      size,
      colorId: colorId || undefined,
      ownerId,
      grade,
      condition,
      description: descriptionEn ? { en: descriptionEn } : undefined,
      notes: notesEn ? { en: notesEn } : undefined,
      status,
    };

    const result = productId
      ? await updateProductAction(productId, payload)
      : await createProductAction(payload);

    if (result.error) {
      // The product wasn't saved, so the images uploaded this attempt are
      // orphaned — delete them from R2 rather than leave them behind.
      await cleanupR2Keys(uploadedThisAttempt);
      setSubmitting(false);
      setConfirmOpen(false);
      setError(result.error);
      return;
    }

    setSubmitting(false);
    setConfirmOpen(false);
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p
          role="alert"
          className="border-sale-500 bg-sale-50 text-sale-700 text-body-sm rounded-none border px-4 py-3"
        >
          {error}
        </p>
      )}

      <div className="border-hairline rounded-none border bg-white p-5">
        <h2 className="text-eyebrow text-caption-sm text-mute mb-4">Images</h2>
        <div className="flex flex-wrap gap-3">
          {images.map((img, index) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) moveImage(dragIndex, index);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={`border-hairline relative cursor-move rounded-none border transition-opacity ${
                dragIndex === index ? "opacity-40" : ""
              }`}
            >
              <Image
                src={img.url}
                alt=""
                width={112}
                height={112}
                draggable={false}
                unoptimized
                className="size-28 object-cover"
              />
              {index === 0 && (
                <span className="bg-ink-900 text-caption-sm rounded-pill absolute bottom-1 left-1 px-2 py-0.5 text-white">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="border-hairline text-ink-900 hover:border-sale-500 hover:bg-sale-500 rounded-pill absolute top-1 right-1 flex size-6 items-center justify-center border bg-white transition-colors hover:text-white"
              >
                <TrashIcon size={12} />
              </button>
            </div>
          ))}
          <label className="border-hairline text-mute hover:border-ink-900 hover:text-ink-900 flex size-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-none border border-dashed transition-colors">
            <UploadSimpleIcon size={20} />
            <span className="text-caption-sm">Add images</span>
            <input
              type="file"
              accept="image/webp"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              disabled={submitting}
            />
          </label>
        </div>
        <p className="text-mute text-caption-sm mt-3">
          WebP only, max 500KB each. Pick multiple at once and drag to reorder — the first image is
          the cover shown in listings. Images are uploaded when you save the product.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border-hairline flex flex-col gap-4 rounded-none border bg-white p-5">
          <h2 className="text-eyebrow text-caption-sm text-mute">Basics</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="titleEn">Title (English)</Label>
            <Input
              id="titleEn"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Slug (auto-generated)</Label>
            <div className="border-hairline bg-soft-cloud text-mute text-body-sm truncate rounded-sm border px-4 py-2.5">
              {productId
                ? initial?.slug
                : titleEn.trim()
                  ? `${toSlugBody(titleEn)}-••••••••`
                  : "generated from the title on save"}
            </div>
            {!productId && (
              <span className="text-mute text-caption-sm">
                A unique code is appended automatically so items never collide.
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="brand">Brand (optional)</Label>
            <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Price (৳)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="compareAtPrice">Compare-at price</Label>
              <Input
                id="compareAtPrice"
                type="number"
                min="0"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="text-ink-900 bg-soft-cloud focus-visible:border-ink-900 h-11 w-full rounded-md border border-transparent px-6 text-sm transition-colors outline-none focus-visible:bg-white"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="SOLD">Sold</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div className="border-hairline flex flex-col gap-4 rounded-none border bg-white p-5">
          <h2 className="text-eyebrow text-caption-sm text-mute">Classification</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="text-ink-900 bg-soft-cloud focus-visible:border-ink-900 h-11 w-full rounded-md border border-transparent px-6 text-sm transition-colors outline-none focus-visible:bg-white"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name.en}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="colorId">Color (optional)</Label>
            <select
              id="colorId"
              value={colorId}
              onChange={(e) => setColorId(e.target.value)}
              className="text-ink-900 bg-soft-cloud focus-visible:border-ink-900 h-11 w-full rounded-md border border-transparent px-6 text-sm transition-colors outline-none focus-visible:bg-white"
            >
              <option value="">— None —</option>
              {colors.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name.en}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ownerId">Owner</Label>
            <select
              id="ownerId"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="text-ink-900 bg-soft-cloud focus-visible:border-ink-900 h-11 w-full rounded-md border border-transparent px-6 text-sm transition-colors outline-none focus-visible:bg-white"
            >
              {owners.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grade">Grade (internal)</Label>
              <select
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value as typeof grade)}
                className="text-ink-900 bg-soft-cloud focus-visible:border-ink-900 h-11 w-full rounded-md border border-transparent px-6 text-sm transition-colors outline-none focus-visible:bg-white"
              >
                {["T", "B", "M", "W", "O"].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="condition">Condition</Label>
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as typeof condition)}
                className="text-ink-900 bg-soft-cloud focus-visible:border-ink-900 h-11 w-full rounded-md border border-transparent px-6 text-sm transition-colors outline-none focus-visible:bg-white"
              >
                {["Excellent", "Good", "Fair"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border-hairline flex flex-col gap-4 rounded-none border bg-white p-5">
          <h2 className="text-eyebrow text-caption-sm text-mute">Size (optional)</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sizeType">Type</Label>
            <select
              id="sizeType"
              value={sizeType}
              onChange={(e) => setSizeType(e.target.value as typeof sizeType)}
              className="text-ink-900 bg-soft-cloud focus-visible:border-ink-900 h-11 w-full rounded-md border border-transparent px-6 text-sm transition-colors outline-none focus-visible:bg-white"
            >
              <option value="standard">Standard (S/M/L)</option>
              <option value="measurement">Measurements</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          {sizeType === "standard" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sizeStandard">Size</Label>
              <Input
                id="sizeStandard"
                value={sizeStandard}
                onChange={(e) => setSizeStandard(e.target.value)}
                placeholder="e.g. M"
              />
            </div>
          )}
          {sizeType === "custom" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sizeCustom">Description</Label>
              <Input
                id="sizeCustom"
                value={sizeCustom}
                onChange={(e) => setSizeCustom(e.target.value)}
                placeholder="e.g. Free size"
              />
            </div>
          )}
          {sizeType === "measurement" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chest">Chest (in)</Label>
                <Input
                  id="chest"
                  type="number"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="length">Length (in)</Label>
                <Input
                  id="length"
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sleeve">Sleeve (in)</Label>
                <Input
                  id="sleeve"
                  type="number"
                  value={sleeve}
                  onChange={(e) => setSleeve(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="waist">Waist (in)</Label>
                <Input
                  id="waist"
                  type="number"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-hairline flex flex-col gap-4 rounded-none border bg-white p-5">
          <h2 className="text-eyebrow text-caption-sm text-mute">Notes</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notesEn">Internal notes (optional)</Label>
            <Input id="notesEn" value={notesEn} onChange={(e) => setNotesEn(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="border-hairline flex flex-col gap-4 rounded-none border bg-white p-5">
        <h2 className="text-eyebrow text-caption-sm text-mute">Description</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Product description (shown to customers)</Label>
          <Textarea
            id="description"
            rows={6}
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            placeholder="Everything about the piece — fabric, fit, styling, and any flaws (stains, fading, loose threads). Honest good & bad points build trust."
          />
          <span className="text-mute text-caption-sm">Appears on the product page.</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="primary" onClick={() => setConfirmOpen(true)} disabled={submitting}>
          {productId ? "Save changes" : "Create product"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {productId ? "Save changes to this product?" : "Create this product?"}
            </DialogTitle>
            <DialogDescription>
              {productId
                ? "This updates the live product record."
                : status === "ACTIVE"
                  ? "This creates the product and makes it immediately visible on the storefront."
                  : "This creates the product as a draft — it won't be visible on the storefront until set to Active."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>
              Back
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving…" : "Confirm & save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
