import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client } from "@/lib/r2";
import type { PresignUploadInput } from "@/lib/validations/upload.schema";

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function createPresignedUpload(input: PresignUploadInput) {
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!bucket || !publicUrl) {
    throw new Error("Missing R2_BUCKET or R2_PUBLIC_URL");
  }

  const extension = EXTENSION_BY_CONTENT_TYPE[input.contentType];
  const key = `products/${randomUUID()}.${extension}`;

  // Presigned PUT URLs only sign content-type, not max size — the 8MB cap
  // in the schema is enforced by the browser's own upload, not by R2.
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: input.contentType,
  });

  const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 300 });

  return {
    uploadUrl,
    key,
    publicUrl: `${publicUrl}/${key}`,
  };
}
