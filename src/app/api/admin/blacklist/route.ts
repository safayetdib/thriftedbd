import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createBlacklistSchema } from "@/lib/validations/blacklist.schema";
import { getBlacklist, createBlacklistEntry } from "@/lib/services/blacklist.service";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  await connectDB();
  const { searchParams } = new URL(request.url);
  const isActiveParam = searchParams.get("isActive");
  const isActive = isActiveParam === null ? undefined : isActiveParam === "true";

  const entries = await getBlacklist({ isActive });
  return NextResponse.json({ data: entries });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const parsed = createBlacklistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  const session = await auth();
  try {
    const entry = await createBlacklistEntry(parsed.data, session!.user.id);
    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: { message: "Phone is already blacklisted", code: "DUPLICATE" } },
        { status: 409 },
      );
    }
    throw err;
  }
}
