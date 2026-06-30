"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { createProductAction, updateProductAction } from "@/app/admin/(dashboard)/products/actions";

type RefOption = { _id: string; name: { en: string } };
type OwnerOption = { _id: string; name: string };

type ProductImage = { url: string; key: string; order: number };

type InitialProduct = {
  slug: string;
  title: { en: string; bn?: string };
  brand: string;
  categoryId: string;
  price: number;
  compareAtPrice?: number;
  images: ProductImage[];
  size: {
    type: "standard" | "measurement" | "custom";
    standard?: string;
    measurements?: { chest?: number; length?: number; sleeve?: number; waist?: number };
    custom?: string;
  };
  colorId: string;
  ownerId: string;
  grade: "T" | "B" | "M" | "W" | "O";
  condition: "Excellent" | "Good" | "Fair";
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
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [titleEn, setTitleEn] = useState(initial?.title.en ?? "");
  const [titleBn, setTitleBn] = useState(initial?.title.bn ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?._id ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [compareAtPrice, setCompareAtPrice] = useState(initial?.compareAtPrice?.toString() ?? "");
  const [images, setImages] = useState<ProductImage[]>(initial?.images ?? []);
  const [sizeType, setSizeType] = useState(initial?.size.type ?? "standard");
  const [sizeStandard, setSizeStandard] = useState(initial?.size.standard ?? "");
  const [sizeCustom, setSizeCustom] = useState(initial?.size.custom ?? "");
  const [chest, setChest] = useState(initial?.size.measurements?.chest?.toString() ?? "");
  const [length, setLength] = useState(initial?.size.measurements?.length?.toString() ?? "");
  const [sleeve, setSleeve] = useState(initial?.size.measurements?.sleeve?.toString() ?? "");
  const [waist, setWaist] = useState(initial?.size.measurements?.waist?.toString() ?? "");
  const [colorId, setColorId] = useState(initial?.colorId ?? colors[0]?._id ?? "");
  const [ownerId, setOwnerId] = useState(initial?.ownerId ?? owners[0]?._id ?? "");
  const [grade, setGrade] = useState(initial?.grade ?? "T");
  const [condition, setCondition] = useState(initial?.condition ?? "Excellent");
  const [notesEn, setNotesEn] = useState(initial?.notes?.en ?? "");
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
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

      setImages((prev) => [...prev, { url: publicUrl, key, order: prev.length }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(key: string) {
    setImages((prev) =>
      prev.filter((img) => img.key !== key).map((img, i) => ({ ...img, order: i })),
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const size =
      sizeType === "standard"
        ? { type: "standard" as const, standard: sizeStandard }
        : sizeType === "custom"
          ? { type: "custom" as const, custom: sizeCustom }
          : {
              type: "measurement" as const,
              measurements: {
                chest: chest ? Number(chest) : undefined,
                length: length ? Number(length) : undefined,
                sleeve: sleeve ? Number(sleeve) : undefined,
                waist: waist ? Number(waist) : undefined,
              },
            };

    const payload = {
      slug,
      title: { en: titleEn, bn: titleBn || undefined },
      brand,
      categoryId,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      images,
      size,
      colorId,
      ownerId,
      grade,
      condition,
      notes: notesEn ? { en: notesEn } : undefined,
      status,
    };

    const result = productId
      ? await updateProductAction(productId, payload)
      : await createProductAction(payload);

    setSubmitting(false);
    setConfirmOpen(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="border-sale-500 bg-sale-50 text-sale-700 border-2 px-4 py-3 text-sm font-medium">
          {error}
        </p>
      )}

      <div className="border-ink-900 border-2 bg-white p-5">
        <h2 className="text-eyebrow text-ink-500 mb-4">Images</h2>
        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div key={img.key} className="border-ink-900 relative border-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="size-28 object-cover" />
              <button
                type="button"
                onClick={() => removeImage(img.key)}
                className="border-ink-900 text-ink-900 hover:bg-sale-500 absolute top-1 right-1 flex size-6 items-center justify-center border-2 bg-white hover:text-white"
              >
                <TrashIcon size={12} />
              </button>
            </div>
          ))}
          <label className="border-ink-300 text-ink-500 hover:border-ink-900 hover:text-ink-900 flex size-28 cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed">
            <UploadSimpleIcon size={20} />
            <span className="text-xs font-semibold">{uploading ? "Uploading…" : "Add image"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border-ink-900 flex flex-col gap-4 border-2 bg-white p-5">
          <h2 className="text-eyebrow text-ink-500">Basics</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
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
            <Label htmlFor="titleBn">Title (Bangla, optional)</Label>
            <Input id="titleBn" value={titleBn} onChange={(e) => setTitleBn(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
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
              className="border-ink-900 h-11 border-2 bg-white px-3 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="SOLD">Sold</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div className="border-ink-900 flex flex-col gap-4 border-2 bg-white p-5">
          <h2 className="text-eyebrow text-ink-500">Classification</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="border-ink-900 h-11 border-2 bg-white px-3 text-sm"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name.en}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="colorId">Color</Label>
            <select
              id="colorId"
              value={colorId}
              onChange={(e) => setColorId(e.target.value)}
              className="border-ink-900 h-11 border-2 bg-white px-3 text-sm"
            >
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
              className="border-ink-900 h-11 border-2 bg-white px-3 text-sm"
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
                className="border-ink-900 h-11 border-2 bg-white px-3 text-sm"
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
                className="border-ink-900 h-11 border-2 bg-white px-3 text-sm"
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

        <div className="border-ink-900 flex flex-col gap-4 border-2 bg-white p-5">
          <h2 className="text-eyebrow text-ink-500">Size</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sizeType">Type</Label>
            <select
              id="sizeType"
              value={sizeType}
              onChange={(e) => setSizeType(e.target.value as typeof sizeType)}
              className="border-ink-900 h-11 border-2 bg-white px-3 text-sm"
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

        <div className="border-ink-900 flex flex-col gap-4 border-2 bg-white p-5">
          <h2 className="text-eyebrow text-ink-500">Notes</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notesEn">Internal notes (optional)</Label>
            <Input id="notesEn" value={notesEn} onChange={(e) => setNotesEn(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="primary" onClick={() => setConfirmOpen(true)} disabled={uploading}>
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
