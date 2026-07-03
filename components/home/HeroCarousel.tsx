"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Placeholder } from "./Placeholder";

// TODO(backend): wire to a real promo/banner endpoint once available — slides are static placeholders for now.
const PRIMARY_SLIDES = [
  { id: 1, badge: "SS26 WHOLESALE PREVIEW", title: "Open now for buyers.", tone: "warm" as const, href: "/register" },
  { id: 2, badge: "NET-60 TERMS", title: "Stock now, pay in sixty days.", tone: "cool" as const, href: "/shop" },
  { id: 3, badge: "612 VETTED BRANDS", title: "One purchase order, one invoice.", tone: "orange" as const, href: "/brands" },
];

const SECONDARY_SLIDE = {
  badge: "BOTANICAL ALTERNATIVES",
  title: "New wellness lines in stock.",
  href: "/shop",
};

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const slide = PRIMARY_SLIDES[index];

  function prev() {
    setIndex((i) => (i - 1 + PRIMARY_SLIDES.length) % PRIMARY_SLIDES.length);
  }
  function next() {
    setIndex((i) => (i + 1) % PRIMARY_SLIDES.length);
  }

  return (
    <div className="grid md:grid-cols-[1.7fr_1fr] gap-px bg-brand-line border-b border-brand-line">
      {/* Primary — large rotating promo */}
      <div className="relative bg-brand-white min-h-[280px] sm:min-h-[380px] md:min-h-[460px] overflow-hidden group">
        <Link href={slide.href} className="block w-full h-full no-underline">
          <Placeholder label={slide.title} tone={slide.tone} className="h-full" />
        </Link>

        {/* Corner badge */}
        <span className="absolute top-4 left-4 bg-brand-ink text-white font-mono text-[10px] tracking-[0.08em] uppercase px-2 py-1">
          {slide.badge}
        </span>

        {/* Arrow nav */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute top-1/2 left-3 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white flex items-center justify-center text-brand-ink transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute top-1/2 right-3 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white flex items-center justify-center text-brand-ink transition-colors"
        >
          <ChevronRight size={18} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {PRIMARY_SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === index ? "bg-brand-ink" : "bg-brand-ink/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Secondary — single static promo */}
      <Link
        href={SECONDARY_SLIDE.href}
        className="relative bg-brand-white min-h-[220px] sm:min-h-[300px] md:min-h-[460px] overflow-hidden block no-underline group"
      >
        <Placeholder label={SECONDARY_SLIDE.title} tone="cool" className="h-full" />
        <span className="absolute top-4 left-4 bg-brand-blue text-white font-mono text-[10px] tracking-[0.08em] uppercase px-2 py-1">
          {SECONDARY_SLIDE.badge}
        </span>
        <span className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/85 group-hover:bg-white flex items-center justify-center text-brand-ink transition-colors">
          <ChevronRight size={16} />
        </span>
      </Link>
    </div>
  );
}
