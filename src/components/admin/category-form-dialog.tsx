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
}: {
  trigger: React.ReactElement;
  title: string;
  initialValues?: {
    name?: { en: string; bn?: string };
    slug?: string;
    order?: number;
    coverImage?: CoverImage;
  };
  onSubmit: (values: {
    name: { en: string; bn?: string };
    slug: string;
    order?: number;
    coverImage?: CoverImage;
  }) => Promise<{ error?: string } | void>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nameEn, setNameEn] = useState(initialValues?.name?.en ?? "");
  const [nameBn, setNameBn] = useState(initialValues?.name?.bn ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [order, setOrder] = useState(initialValues?.order?.toString() ?? "");
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
        bn: nameBn || undefined,
      },
      slug,
      order: order ? Number(order) : undefined,
      coverImage: coverImage || undefined,
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
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Name (EN)</dt>
                <dd className="text-ink-900 text-right font-semibold">{nameEn}</dd>
              </div>
              {nameBn && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-500">Name (BN)</dt>
                  <dd className="text-ink-900 text-right font-semibold">{nameBn}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Slug</dt>
                <dd className="text-ink-900 text-right font-semibold">{slug}</dd>
              </div>
              {order && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-500">Order</dt>
                  <dd className="text-ink-900 text-right font-semibold">{order}</dd>
                </div>
              )}
              {coverImage && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-500">Cover image</dt>
                  <dd className="text-ink-900 text-right font-semibold">Uploaded</dd>
                </div>
              )}
            </dl>
            {error && (
              <p
                role="alert"
                className="border-sale-500 bg-sale-50 border-2 px-3 py-2 text-sm font-medium text-white"
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
                <Label htmlFor="nameBn">Name (Bangla, optional)</Label>
                <Input
                  id="nameBn"
                  type="text"
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
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
                  <div className="border-ink-200 flex items-center justify-between gap-2 border-2 p-2">
                    <div className="text-ink-700 flex-1 text-sm">Image uploaded</div>
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
                  <label className="border-ink-200 hover:border-ink-400 bg-ink-50 flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed p-4 transition-colors">
                    <UploadSimpleIcon size={20} className="text-ink-500" />
                    <span className="text-ink-600 text-xs font-semibold">
                      Click to upload or drag & drop
                    </span>
                    <span className="text-ink-500 text-xs">JPEG, PNG, WebP (max 8MB)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
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
                  className="border-sale-500 bg-sale-50 border-2 px-3 py-2 text-sm font-medium text-white"
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
