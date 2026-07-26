import { z } from "zod";

// WebP-only keeps every stored asset small and consistently encoded.
const ALLOWED_CONTENT_TYPES = ["image/webp"] as const;
export const MAX_UPLOAD_BYTES = 500 * 1024; // 500 KB per image

export const presignUploadSchema = z.object({
  contentType: z.enum(ALLOWED_CONTENT_TYPES, { message: "Only WebP images are allowed" }),
  fileSize: z.number().int().positive().max(MAX_UPLOAD_BYTES, "Max file size is 500KB"),
});

export type PresignUploadInput = z.infer<typeof presignUploadSchema>;
