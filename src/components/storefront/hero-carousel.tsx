"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import type { IHeroSlide } from "@/models/Settings";

/**
 * Hero carousel: displays hero slides from Settings with prev/next arrows and dot indicators.
 * Client component: handles slide rotation and navigation.
 */
export function HeroCarousel({ slides }: { slides: IHeroSlide[] }) {
  const enabledSlides = slides
    .filter((s) => s.enabled)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay || enabledSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % enabledSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlay, enabledSlides.length]);

  const currentSlide = enabledSlides[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + enabledSlides.length) % enabledSlides.length);
    setIsAutoPlay(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % enabledSlides.length);
    setIsAutoPlay(false);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  if (!currentSlide || enabledSlides.length === 0) return null;

  return (
    <section className="bg-ink-900 relative min-h-[420px] overflow-hidden md:min-h-[560px]">
      <div className="relative h-full w-full">
        {/* Slide image background */}
        {currentSlide.imageUrl && (
          <div className="absolute inset-0">
            <Image
              src={currentSlide.imageUrl}
              alt={currentSlide.headline || "Hero slide"}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        {/* Slide content */}
        <div className="relative flex h-full flex-col justify-center px-4 py-20 md:px-8">
          <div className="max-w-container mx-auto w-full">
            {currentSlide.headline && (
              <h1
                className="text-ink-50 max-w-xl font-sans font-extrabold"
                style={{ fontSize: "clamp(2.25rem, 6vw, 3.5rem)", lineHeight: 1.05 }}
              >
                {currentSlide.headline}
              </h1>
            )}

            {currentSlide.subheadline && (
              <p className="text-ink-100 mt-4 max-w-lg text-lg">{currentSlide.subheadline}</p>
            )}

            {currentSlide.ctaText && currentSlide.ctaLink && (
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href={currentSlide.ctaLink}>
                  <Button variant="primary" size="lg">
                    {currentSlide.ctaText}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {enabledSlides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 p-2 transition-colors hover:bg-white md:left-8"
            aria-label="Previous slide"
          >
            <CaretLeftIcon size={24} className="text-ink-900" />
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 p-2 transition-colors hover:bg-white md:right-8"
            aria-label="Next slide"
          >
            <CaretRightIcon size={24} className="text-ink-900" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {enabledSlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-8">
          {enabledSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
