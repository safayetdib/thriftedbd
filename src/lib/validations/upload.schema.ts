import { z } from "zod";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const presignUploadSchema = z.object({
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(8 * 1024 * 1024, "Max file size is 8MB"),
});

export type PresignUploadInput = z.infer<typeof presignUploadSchema>;
