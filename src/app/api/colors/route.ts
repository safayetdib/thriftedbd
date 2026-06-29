import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getActiveColors } from "@/lib/services/color.service";

export async function GET() {
  await connectDB();
  const colors = await getActiveColors();
  return NextResponse.json({ data: colors });
}
