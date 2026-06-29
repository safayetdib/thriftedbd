import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getPublicSettings } from "@/lib/services/settings.service";

export async function GET() {
  await connectDB();
  const settings = await getPublicSettings();
  return NextResponse.json({ data: settings });
}
