/**
 * Find the TELEGRAM_CHAT_ID for new-order alerts, then send a test message to it.
 * 1. Put TELEGRAM_BOT_TOKEN in .env.local.
 * 2. Message your bot (or add it to a group and send any message there).
 * 3. Run: pnpm tsx scripts/telegram-chat-id.ts            # lists chats the bot has seen
 *    Then: pnpm tsx scripts/telegram-chat-id.ts --test     # sends a test to TELEGRAM_CHAT_ID
 */
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { sendTelegramMessage } from "../src/lib/notifications/telegram";

interface TelegramUpdate {
  message?: { chat: { id: number; type: string; title?: string; first_name?: string } };
  my_chat_member?: { chat: { id: number; type: string; title?: string } };
}

async function run() {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN) throw new Error("Missing TELEGRAM_BOT_TOKEN in .env.local");

  if (process.argv.includes("--test")) {
    if (!TELEGRAM_CHAT_ID) throw new Error("Missing TELEGRAM_CHAT_ID in .env.local");
    const sent = await sendTelegramMessage("✅ thriftedBD order alerts are connected.");
    console.log(sent ? "Test message sent." : "Test message failed - see the error above.");
    return;
  }

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
  const body = (await res.json()) as {
    ok: boolean;
    result?: TelegramUpdate[];
    description?: string;
  };
  if (!body.ok) throw new Error(`Telegram error: ${body.description}`);

  const chats = new Map<number, string>();
  for (const update of body.result ?? []) {
    const chat = update.message?.chat ?? update.my_chat_member?.chat;
    if (chat) {
      const name = chat.title ?? ("first_name" in chat ? chat.first_name : undefined) ?? "";
      chats.set(chat.id, `${chat.type} ${name}`.trim());
    }
  }

  if (chats.size === 0) {
    console.log("No chats yet. Send your bot a message (or post in the group), then re-run.");
    return;
  }
  for (const [id, label] of chats) console.log(`${id}\t${label}`);
}

run().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
