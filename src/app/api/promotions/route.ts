import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getActivePromotions } from "@/lib/services/promotion.service";
import type { PromotionPage } from "@/models/Promotion";

/**
 * Public: Get active promotions for given pages.
 * Query params: pages=homepage,plp,pdp (comma-separated or repeated)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pagesParam = searchParams.get("pages");

  let pages: PromotionPage[] = [];
  if (pagesParam) {
    pages = pagesParam.split(",").filter(Boolean) as PromotionPage[];
  }

  // If no pages specified, return all active promotions
  if (pages.length === 0) {
    pages = ["homepage", "plp", "pdp", "cart", "checkout", "success", "global"];
  }

  await connectDB();
  const promotions = await getActivePromotions(pages);
  return NextResponse.json({ data: promotions });
}
