import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { updateSettings } from "@/lib/services/settings.service";
import { updateSettingsSchema } from "@/lib/validations/settings.schema";
import { revalidatePath } from "next/cache";

export async function PUT(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  try {
    await updateSettings(parsed.data);
    revalidatePath("/admin/homepage");
    revalidatePath("/");
    return NextResponse.json({ data: { updated: true } });
  } catch (err) {
    return NextResponse.json(
      { error: { message: err instanceof Error ? err.message : "Failed to update settings" } },
      { status: 500 },
    );
  }
}
