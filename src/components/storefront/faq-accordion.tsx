"use client";

import { useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useLocale } from "next-intl";
import { localize } from "@/lib/localize";
import type { IFaqItem } from "@/models/Settings";

/**
 * FAQ accordion component.
 * Client component: toggles open/closed state on click.
 */
export function FaqAccordion({ faqs }: { faqs: IFaqItem[] }) {
  const locale = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const sortedFaqs = [...faqs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    // Nike faq-row: not a boxed card — a stack of rows on canvas, separated by a
    // single hairline, 24px vertical padding. DESIGN.md → Components → faq-row.
    <div className="border-hairline border-t">
      {sortedFaqs.map((faq, idx) => (
        <div key={idx} className="border-hairline border-b">
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="text-ink-900 text-heading-md flex w-full items-center justify-between gap-4 bg-white py-6 text-left"
            aria-expanded={openIndex === idx}
            aria-controls={`faq-panel-${idx}`}
          >
            <span>{localize(faq.question, locale)}</span>
            <CaretDownIcon
              size={20}
              className={`shrink-0 transition-transform ${openIndex === idx ? "rotate-180" : ""}`}
            />
          </button>

          {openIndex === idx && (
            <div
              id={`faq-panel-${idx}`}
              role="region"
              aria-labelledby={`faq-button-${idx}`}
              className="pb-6"
            >
              <p className="text-body-md text-charcoal">{localize(faq.answer, locale)}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
