import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatNewOrderMessage,
  notifyNewOrder,
  sendTelegramMessage,
  type NewOrderSummary,
} from "./telegram";

const order: NewOrderSummary = {
  _id: "665f1c2e9b1d4a0012345678",
  orderNumber: "ORD-20261114-AB12CD",
  customer: { name: "Rahim <Uddin>", phone: "01712345678", city: "Dhaka" },
  items: [
    { title: { en: "Vintage Denim Jacket" }, price: 1200, quantity: 1 },
    { title: { en: "Linen Shirt & Tie" }, price: 650, quantity: 1 },
  ],
  payment: { method: "COD" },
  riskFlags: [],
  shippingFee: 70,
  discountApplied: 0,
  total: 1920,
};

describe("formatNewOrderMessage", () => {
  it("includes order number, customer, items, total and an admin link", () => {
    const text = formatNewOrderMessage(order);
    expect(text).toContain("ORD-20261114-AB12CD");
    expect(text).toContain("01712345678");
    expect(text).toContain("Dhaka");
    expect(text).toContain("Vintage Denim Jacket");
    expect(text).toContain("৳1,920");
    expect(text).toContain("COD");
    expect(text).toContain("https://thriftedbd.com/admin/orders/665f1c2e9b1d4a0012345678");
  });

  it("escapes HTML so customer input cannot break Telegram's parser", () => {
    const text = formatNewOrderMessage(order);
    expect(text).toContain("Rahim &lt;Uddin&gt;");
    expect(text).toContain("Linen Shirt &amp; Tie");
    expect(text).not.toContain("<Uddin>");
  });

  it("highlights risk flags and discounts when present", () => {
    const text = formatNewOrderMessage({
      ...order,
      riskFlags: ["BLACKLISTED_PHONE"],
      couponCode: "EID10",
      discountApplied: 100,
    });
    expect(text).toContain("BLACKLISTED_PHONE");
    expect(text).toContain("EID10");
    expect(text).toContain("৳100");
  });
});

describe("sendTelegramMessage", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "123:abc");
    vi.stubEnv("TELEGRAM_CHAT_ID", "-1001234");
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    fetchMock.mockReset();
  });

  it("posts the message to the Bot API with HTML parse mode", async () => {
    const sent = await sendTelegramMessage("hello");
    expect(sent).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.telegram.org/bot123:abc/sendMessage");
    expect(JSON.parse(init.body)).toMatchObject({
      chat_id: "-1001234",
      text: "hello",
      parse_mode: "HTML",
    });
  });

  it("reports not_configured (and warns) when a variable is missing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "");
    const sent = await sendTelegramMessage("hello");
    expect(sent).toMatchObject({ ok: false, reason: "not_configured" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
  });

  it("trims stray whitespace from the env values", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", " 123:abc\n");
    vi.stubEnv("TELEGRAM_CHAT_ID", " -1001234 ");
    await sendTelegramMessage("hello");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.telegram.org/bot123:abc/sendMessage");
    expect(JSON.parse(init.body).chat_id).toBe("-1001234");
  });

  it("returns Telegram's error description instead of throwing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: false, description: "Bad Request: chat not found" }), {
        status: 400,
      }),
    );
    await expect(sendTelegramMessage("hello")).resolves.toEqual({
      ok: false,
      reason: "telegram_error",
      detail: "400 Bad Request: chat not found",
    });

    fetchMock.mockRejectedValue(new Error("network down"));
    await expect(sendTelegramMessage("hello")).resolves.toEqual({
      ok: false,
      reason: "network_error",
      detail: "network down",
    });
  });
});

describe("notifyNewOrder", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("never throws, even on a malformed order", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "123:abc");
    vi.stubEnv("TELEGRAM_CHAT_ID", "-1001234");
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(notifyNewOrder({} as NewOrderSummary)).resolves.toBe(false);
  });
});
