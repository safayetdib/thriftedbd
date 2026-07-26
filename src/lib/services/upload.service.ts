import { randomUUID } from "crypto";
import { PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client } from "@/lib/r2";
import type { PresignUploadInput } from "@/lib/validations/upload.schema";

export type R2Object = { key: string; url: string; size: number; lastModified: number };

/**
 * Lists every object under `prefix` in the R2 bucket, following continuation
 * tokens. Returns key, public URL, byte size, and last-modified epoch ms.
 */
export async function listR2Objects(prefix = "products/"): Promise<R2Object[]> {
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!bucket || !publicUrl) throw new Error("Missing R2_BUCKET or R2_PUBLIC_URL");

  const client = getR2Client();
  const objects: R2Object[] = [];
  let token: string | undefined;
  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: token,
        MaxKeys: 1000,
      }),
    );
    for (const o of res.Contents ?? []) {
      if (!o.Key || o.Key.endsWith("/")) continue;
      objects.push({
        key: o.Key,
        url: `${publicUrl}/${o.Key}`,
        size: o.Size ?? 0,
        lastModified: o.LastModified ? o.LastModified.getTime() : 0,
      });
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return objects;
}

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

  // Signing ContentLength as well as ContentType binds the URL to the exact
  // byte count the admin declared. R2 rejects any PUT whose Content-Length
  // differs, so the 8MB schema cap can't be bypassed by reusing the URL.
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: input.contentType,
    ContentLength: input.fileSize,
  });

  const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 300 });

  return {
    uploadUrl,
    key,
    publicUrl: `${publicUrl}/${key}`,
  };
}

export async function deleteR2Object(key: string) {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("Missing R2_BUCKET");
  await getR2Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/**
 * Best-effort batch delete. Never throws — image cleanup must not block or fail
 * the surrounding data mutation (e.g. saving a product). Failures are logged.
 * De-duplicates and ignores empty keys.
 */
export async function deleteR2Objects(keys: (string | undefined | null)[]) {
  const unique = [...new Set(keys.filter((k): k is string => Boolean(k)))];
  if (unique.length === 0) return;
  const results = await Promise.allSettled(unique.map((key) => deleteR2Object(key)));
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`Failed to delete R2 object ${unique[i]}:`, result.reason);
    }
  });
}
