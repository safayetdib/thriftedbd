"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { XIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

export function ProductGallery({ images, alt }: { images: { url: string }[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const hasMultiple = images.length > 1;
  const current = images[active] ?? images[0];

  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") setActive((p) => Math.max(0, p - 1));
      if (e.key === "ArrowRight") setActive((p) => Math.min(images.length - 1, p + 1));
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, images.length]);

  const prev = useCallback(() => setActive((p) => Math.max(0, p - 1)), []);
  const next = useCallback(
    () => setActive((p) => Math.min(images.length - 1, p + 1)),
    [images.length],
  );

  return (
    <>
      <div className="flex flex-col-reverse gap-3 md:flex-row">
        {hasMultiple && (
          <div className="flex gap-2 overflow-x-auto md:flex-col md:overflow-y-auto">
            {images.map((img, i) => (
              <button
                key={img.url + i}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "bg-soft-cloud relative size-14 shrink-0 overflow-hidden border transition-colors md:size-16",
                  i === active ? "border-ink-900" : "hover:border-hairline border-transparent",
                )}
              >
                <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="bg-soft-cloud relative block w-full cursor-zoom-in overflow-hidden rounded-none focus-visible:outline-offset-[-2px]"
            style={{ aspectRatio: "3/4" }}
          >
            {current?.url && (
              <Image
                src={current.url}
                alt={alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 hover:scale-105"
                priority
              />
            )}
          </button>
          {hasMultiple && (
            <span className="text-ink-900 text-caption-sm absolute right-3 bottom-3 rounded-full bg-white/80 px-3 py-1 backdrop-blur-xs">
              {active + 1} / {images.length}
            </span>
          )}
        </div>
      </div>

      {lightboxOpen && current?.url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
            aria-label="Close"
          >
            <XIcon size={20} weight="bold" />
          </button>

          {hasMultiple && (
            <span className="text-caption-md absolute top-4 left-4 z-10 rounded-full bg-white/20 px-3 py-1 text-white">
              {active + 1} / {images.length}
            </span>
          )}

          {hasMultiple && active > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute top-1/2 left-4 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
              aria-label="Previous image"
            >
              <CaretLeftIcon size={24} weight="bold" />
            </button>
          )}

          {hasMultiple && active < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute top-1/2 right-4 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
              aria-label="Next image"
            >
              <CaretRightIcon size={24} weight="bold" />
            </button>
          )}

          <div
            className="flex h-full w-full items-center justify-center px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[85vh] w-full max-w-[90vw]">
              <Image
                src={current.url}
                alt={alt}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
