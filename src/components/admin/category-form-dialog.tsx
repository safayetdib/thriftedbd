"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CoverImage = { url: string; key: string };

export function CategoryFormDialog({
  trigger,
  title,
  initialValues,
  onSubmit,
  parentOptions,
}: {
  trigger: React.ReactElement;
  title: string;
  initialValues?: {
    name?: { en: string; bn?: string };
    slug?: string;
    order?: number;
    coverImage?: CoverImage;
    parentId?: string | null;
  };
  onSubmit: (values: {
    name: { en: string; bn?: string };
    slug: string;
    order?: number;
    coverImage?: CoverImage;
    parentId?: string | null;
  }) => Promise<{ error?: string } | void>;
  /** Top-level categories selectable as a parent (create mode only). */
  parentOptions?: { id: string; name: string }[];
}) {
  const router = useRouter();
  // Parent can only be chosen at creation — reparenting is unsupported, so the
  // selector is hidden when editing (initialValues present).
  const isCreate = !initialValues;
  const [open, setOpen] = useState(false);
  const [nameEn, setNameEn] = useState(initialValues?.name?.en ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [order, setOrder] = useState(initialValues?.order?.toString() ?? "");
  const [parentId, setParentId] = useState(initialValues?.parentId ?? "");
  const [coverImage, setCoverImage] = useState<CoverImage | null>(
    initialValues?.coverImage ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type !== "image/webp") {
      setError("Only WebP images are allowed.");
      return;
    }
    if (file.size > 500 * 1024) {
      setError(`Image is ${Math.round(file.size / 1024)}KB — max is 500KB.`);
      return;
    }

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

      setCoverImage({ url: publicUrl, key });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeCoverImage() {
    setCoverImage(null);
  }

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nameEn.trim() || !slug.trim()) {
      setError("Name and slug are required");
      return;
    }
    setConfirming(true);
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);

    const payload = {
      name: {
        en: nameEn,
      },
      slug,
      order: order ? Number(order) : undefined,
      coverImage: coverImage || undefined,
      parentId: isCreate ? parentId || null : undefined,
    };

    const result = await onSubmit(payload);
    setSubmitting(false);
    if (result?.error) {
      setConfirming(false);
      setError(result.error);
      return;
    }
    setConfirming(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirming(false);
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        {confirming ? (
          <>
            <DialogHeader>
              <DialogTitle>Save these changes?</DialogTitle>
            </DialogHeader>
            <dl className="text-body-sm flex flex-col gap-2">
              {isCreate && parentId && (
                <div className="flex justify-between gap-3">
                  <dt className="text-mute">Parent</dt>
                  <dd className="text-ink-900 text-body-sm-strong text-right">
                    {parentOptions?.find((o) => o.id === parentId)?.name ?? "—"}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-mute">Name (EN)</dt>
                <dd className="text-ink-900 text-body-sm-strong text-right">{nameEn}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-mute">Slug</dt>
                <dd className="text-ink-900 text-body-sm-strong text-right">{slug}</dd>
              </div>
              {order && (
                <div className="flex justify-between gap-3">
                  <dt className="text-mute">Order</dt>
                  <dd className="text-ink-900 text-body-sm-strong text-right">{order}</dd>
                </div>
              )}
              {coverImage && (
                <div className="flex justify-between gap-3">
                  <dt className="text-mute">Cover image</dt>
                  <dd className="text-ink-900 text-body-sm-strong text-right">Uploaded</dd>
                </div>
              )}
            </dl>
            {error && (
              <p
                role="alert"
                className="border-sale-500 bg-sale-50 text-sale-700 text-body-sm rounded-none border px-3 py-2"
              >
                {error}
              </p>
            )}
            <div className="mt-1 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirming(false)}
                disabled={submitting}
              >
                Back
              </Button>
              <Button type="button" variant="primary" onClick={handleConfirm} disabled={submitting}>
                {submitting ? "Saving…" : "Confirm & save"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleReview} className="flex flex-col gap-3">
              {isCreate && parentOptions && parentOptions.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="parentId">Parent category</Label>
                  <select
                    id="parentId"
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="text-ink-900 bg-soft-cloud focus-visible:border-ink-900 h-11 w-full rounded-md border border-transparent px-6 text-sm transition-colors outline-none focus-visible:bg-white"
                  >
                    <option value="">None (top-level department)</option>
                    {parentOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-mute text-caption-sm">
                    Pick a parent to make this a subcategory (e.g. Men → Shirt).
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nameEn">Name (English)</Label>
                <Input
                  id="nameEn"
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="order">Sort order</Label>
                <Input
                  id="order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Cover image</Label>
                {coverImage ? (
                  <div className="border-hairline-soft flex items-center justify-between gap-2 rounded-none border p-2">
                    <div className="text-charcoal text-body-sm flex-1">Image uploaded</div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={removeCoverImage}
                      disabled={uploading}
                    >
                      <TrashIcon size={16} />
                    </Button>
                  </div>
                ) : (
                  <label className="border-hairline hover:border-ink-900 bg-soft-cloud flex cursor-pointer flex-col items-center justify-center gap-2 rounded-none border border-dashed p-4 transition-colors">
                    <UploadSimpleIcon size={20} className="text-mute" />
                    <span className="text-charcoal text-caption-sm">
                      Click to upload or drag & drop
                    </span>
                    <span className="text-mute text-caption-sm">WebP only (max 500KB)</span>
                    <input
                      type="file"
                      accept="image/webp"
                      onChange={handleFileSelect}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {error && (
                <p
                  role="alert"
                  className="border-sale-500 bg-sale-50 text-sale-700 text-body-sm rounded-none border px-3 py-2"
                >
                  {error}
                </p>
              )}

              <Button type="submit" variant="primary" className="mt-1" disabled={uploading}>
                {uploading ? "Uploading…" : "Review & save"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
