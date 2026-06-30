"use client";

import { useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import type { IFaqItem } from "@/models/Settings";

/**
 * FAQ accordion component.
 * Client component: toggles open/closed state on click.
 */
export function FaqAccordion({ faqs }: { faqs: IFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const sortedFaqs = [...faqs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-2">
      {sortedFaqs.map((faq, idx) => (
        <div key={idx} className="border-ink-900 border-2">
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="text-ink-900 hover:bg-ink-50 flex w-full items-center justify-between bg-white px-4 py-3 font-semibold transition-colors"
          >
            <span className="text-left text-sm">{faq.question?.en}</span>
            <CaretDownIcon
              size={20}
              className={`shrink-0 transition-transform ${openIndex === idx ? "rotate-180" : ""}`}
              weight="fill"
            />
          </button>

          {openIndex === idx && (
            <div className="border-ink-900 bg-ink-50 border-t-2 px-4 py-3">
              <p className="text-ink-700 text-sm">{faq.answer?.en}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
