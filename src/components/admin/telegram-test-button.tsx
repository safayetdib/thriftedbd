"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Result = { ok: true } | { ok: false; reason: string; detail?: string };

const REASON_HINT: Record<string, string> = {
  not_configured: "Add the missing variable in Netlify, then trigger a new deploy.",
  telegram_error: "Check the bot token and chat ID values in Netlify.",
  network_error: "Couldn't reach Telegram - try again in a minute.",
};

export function TelegramTestButton() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function sendTest() {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/telegram-test", { method: "POST" });
      const json = await res.json();
      setResult(
        res.ok
          ? json.data
          : { ok: false, reason: "request_failed", detail: json.error?.message ?? res.status },
      );
    } catch (err) {
      setResult({
        ok: false,
        reason: "request_failed",
        detail: err instanceof Error ? err.message : "Request failed",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={sendTest}
        loading={sending}
      >
        Send test alert
      </Button>
      {result && (
        <p
          role="status"
          className={`text-body-sm rounded-none border px-3 py-2 ${
            result.ok
              ? "border-success text-success bg-white"
              : "border-sale-500 bg-sale-50 text-sale-700"
          }`}
        >
          {result.ok
            ? "Sent - check the Telegram group."
            : `Failed: ${result.detail ?? result.reason}. ${REASON_HINT[result.reason] ?? ""}`}
        </p>
      )}
    </div>
  );
}
