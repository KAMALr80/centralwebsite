"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { Placeholder } from "@/components/home/Placeholder";
import { PromoTileGrid } from "@/components/home/PromoTileGrid";
import { BrandLogoRow } from "@/components/home/BrandLogoRow";
import { NewArrivalsSection } from "@/components/home/NewArrivalsSection";
import { TopTrendingSection } from "@/components/home/TopTrendingSection";
import { NewsletterBar } from "@/components/home/NewsletterBar";
import { HeroCarousel } from "@/components/home/HeroCarousel";

// ── Section B — Category Grid ────────────────────────────────────
const TONES: Array<"warm" | "orange" | "cool"> = [
  "warm", "orange", "cool", "warm", "orange", "cool", "warm", "orange",
];

function CategoryGrid() {
  const { data: categories, isLoading } = useCategories();

  const topLevel = (categories ?? []).filter((c) => !("parent_id" in c && (c as { parent_id?: number }).parent_id));
  const displayed = topLevel.slice(0, 8);

  return (
    <section className="px-4 sm:px-8 md:px-16" style={{ paddingTop: "4.5rem", paddingBottom: "3.5rem" }}>
      {/* Section header */}
      <div className="flex flex-wrap justify-between items-end gap-3 mb-8">
        <div>
          <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-brand-muted mb-2">
            MOST SOUGHT-AFTER
          </div>
          <h2 className="font-serif text-[28px] sm:text-[36px] md:text-[44px] text-brand-ink font-normal tracking-tight m-0">
            The categories customers reach for first.
          </h2>
        </div>
        <Link
          href="/shop"
          className="font-mono text-[11px] tracking-[0.06em] uppercase text-brand-muted hover:text-brand-ink transition-colors no-underline"
        >
          VIEW ALL CATEGORIES →
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-brand-white border border-brand-line animate-pulse">
                <div className="aspect-square bg-brand-bg-alt" />
                <div className="p-4">
                  <div className="h-4 bg-brand-bg-alt rounded w-3/4 mb-2" />
                  <div className="h-3 bg-brand-bg-alt rounded w-1/2" />
                </div>
              </div>
            ))
          : displayed.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className="bg-brand-white border border-brand-line hover:border-brand-blue transition-colors no-underline group"
              >
                <div className="aspect-square relative overflow-hidden">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Placeholder label={cat.name} tone={TONES[i % TONES.length]} className="h-full" />
                  )}
                  <span className="absolute top-3 left-3 font-mono text-[10px] tracking-[0.08em] bg-brand-ink text-brand-white px-1.5 py-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="px-4 py-3.5 flex justify-between items-center">
                  <div>
                    <div className="text-[15px] font-medium text-brand-ink">{cat.name}</div>
                    {cat.products_count !== undefined && (
                      <div className="font-mono text-[10px] tracking-[0.06em] text-brand-muted uppercase mt-1">
                        {cat.products_count.toLocaleString()} SKUs
                      </div>
                    )}
                  </div>
                  <ArrowRight size={16} className="text-brand-blue shrink-0" />
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="bg-brand-bg">
      <HeroCarousel />
      <BrandLogoRow />
      <CategoryGrid />
      <PromoTileGrid eyebrow="FEATURED COLLECTIONS" title="Shop the essentials." count={4} skip={0} />
      <NewArrivalsSection />
      <TopTrendingSection />
      <NewsletterBar />
    </div>
  );
}
