import type { I18nText } from "@/models/shared";

const SITE_URL = "https://thriftedbd.com";
// Telegram sometimes stalls; never let it hold a serverless function open for long.
const REQUEST_TIMEOUT_MS = 5_000;

/** The subset of an order the new-order alert needs - a lean doc or hydrated order both fit. */
export interface NewOrderSummary {
  _id: { toString(): string } | string;
  orderNumber: string;
  customer: { name: string; phone: string; city?: string };
  items: { title: I18nText; price: number; quantity: number }[];
  payment: { method: string };
  riskFlags: string[];
  couponCode?: string;
  shippingFee: number;
  discountApplied: number;
  total: number;
}

// Telegram's HTML parse mode only needs these three escaped.
function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function taka(amount: number) {
  return `৳${amount.toLocaleString("en-US")}`;
}

export function formatNewOrderMessage(order: NewOrderSummary) {
  const lines = [
    `🛍️ <b>New order ${escapeHtml(order.orderNumber)}</b>`,
    "",
    `👤 ${escapeHtml(order.customer.name)}`,
    `📞 ${escapeHtml(order.customer.phone)}`,
  ];
  if (order.customer.city) lines.push(`📍 ${escapeHtml(order.customer.city)}`);

  lines.push("", "<b>Items</b>");
  for (const item of order.items) {
    const qty = item.quantity > 1 ? ` ×${item.quantity}` : "";
    lines.push(`• ${escapeHtml(item.title.en)}${qty} - ${taka(item.price * item.quantity)}`);
  }

  lines.push("", `🚚 Delivery: ${taka(order.shippingFee)}`);
  if (order.discountApplied > 0) {
    const coupon = order.couponCode ? ` (${escapeHtml(order.couponCode)})` : "";
    lines.push(`🏷️ Discount${coupon}: -${taka(order.discountApplied)}`);
  }
  lines.push(`💰 <b>Total: ${taka(order.total)}</b> · ${escapeHtml(order.payment.method)}`);

  if (order.riskFlags.length > 0) {
    lines.push("", `⚠️ <b>Risk:</b> ${order.riskFlags.map(escapeHtml).join(", ")}`);
  }

  lines.push("", `${SITE_URL}/admin/orders/${order._id.toString()}`);
  return lines.join("\n");
}

/**
 * Sends a message to the configured Telegram chat. Returns false (never throws)
 * when unconfigured or when Telegram fails, so callers can fire and forget.
 */
export async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) {
      // Never log the token-bearing URL; the status + Telegram's description is enough.
      console.error(`Telegram sendMessage failed: ${res.status} ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Telegram sendMessage error:", err instanceof Error ? err.message : err);
    return false;
  }
}

export async function notifyNewOrder(order: NewOrderSummary) {
  try {
    return await sendTelegramMessage(formatNewOrderMessage(order));
  } catch (err) {
    console.error("New-order notification failed:", err instanceof Error ? err.message : err);
    return false;
  }
}
