import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAllColors } from "@/lib/services/color.service";

export async function GET() {
  await connectDB();
  const colors = await getAllColors();
  return NextResponse.json({ data: colors });
}
