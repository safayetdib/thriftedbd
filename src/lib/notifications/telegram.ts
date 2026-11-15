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

export type TelegramSendResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "telegram_error" | "network_error"; detail?: string };

/**
 * Sends a message to the configured Telegram chat. Never throws - failures come
 * back as a result (and are logged) so callers can't break checkout by sending.
 */
export async function sendTelegramMessage(text: string): Promise<TelegramSendResult> {
  // Trimmed because a stray space or newline pasted into the Netlify UI would
  // otherwise silently break the request URL or chat lookup.
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    const missing = [!token && "TELEGRAM_BOT_TOKEN", !chatId && "TELEGRAM_CHAT_ID"].filter(Boolean);
    console.warn(`Telegram alert skipped: ${missing.join(", ")} not set`);
    return { ok: false, reason: "not_configured", detail: `${missing.join(", ")} not set` };
  }

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
      const body = await res.text();
      let description = body;
      try {
        description = (JSON.parse(body) as { description?: string }).description ?? body;
      } catch {
        // Non-JSON body - keep the raw text.
      }
      const detail = `${res.status} ${description}`;
      console.error(`Telegram sendMessage failed: ${detail}`);
      return { ok: false, reason: "telegram_error", detail };
    }
    return { ok: true };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Telegram sendMessage error:", detail);
    return { ok: false, reason: "network_error", detail };
  }
}

export async function notifyNewOrder(order: NewOrderSummary) {
  try {
    return (await sendTelegramMessage(formatNewOrderMessage(order))).ok;
  } catch (err) {
    console.error("New-order notification failed:", err instanceof Error ? err.message : err);
    return false;
  }
}
