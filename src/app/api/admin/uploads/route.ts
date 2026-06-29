import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { presignUploadSchema } from "@/lib/validations/upload.schema";
import { createPresignedUpload } from "@/lib/services/upload.service";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const parsed = presignUploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  const result = await createPresignedUpload(parsed.data);
  return NextResponse.json({ data: result }, { status: 201 });
}
