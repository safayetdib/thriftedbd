import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { sendTelegramMessage } from "@/lib/notifications/telegram";

/**
 * Sends a test message to the order-alerts Telegram chat so admins can check
 * the production setup without placing an order. Returns the failure reason
 * (never the token) when it doesn't go through.
 */
export async function POST() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const result = await sendTelegramMessage(
    "✅ Test alert from thriftedBD admin - new-order alerts are working.",
  );
  return NextResponse.json({ data: result });
}
