import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getActiveCategories } from "@/lib/services/category.service";

export async function GET() {
  await connectDB();
  const categories = await getActiveCategories();
  return NextResponse.json({ data: categories });
}
