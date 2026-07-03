"use client";

import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@/hooks/useCategories";
import { Placeholder } from "./Placeholder";
import { SectionHeader } from "./SectionHeader";

const TONES: Array<"warm" | "orange" | "cool"> = ["warm", "orange", "cool", "warm"];

interface PromoTileGridProps {
  eyebrow: string;
  title: string;
  /** Number of category tiles to show */
  count: number;
  /** Skip this many top-level categories before taking `count` (avoids repeating tiles already shown elsewhere on the page) */
  skip?: number;
}

// TODO(backend): swap category_id stand-in for a dedicated "featured collections" endpoint once available.
export function PromoTileGrid({ eyebrow, title, count, skip = 0 }: PromoTileGridProps) {
  const { data: categories, isLoading } = useCategories();

  const topLevel = (categories ?? []).filter(
    (c) => !("parent_id" in c && (c as { parent_id?: number }).parent_id)
  );
  const displayed = topLevel.slice(skip, skip + count);

  return (
    <section className="px-4 sm:px-8 md:px-16 bg-brand-bg-alt" style={{ paddingTop: "3.5rem", paddingBottom: "3.5rem" }}>
      <SectionHeader eyebrow={eyebrow} title={title} />

      <div
        className={`grid gap-4 grid-cols-2 ${
          count >= 4 ? "md:grid-cols-4" : "md:grid-cols-2"
        }`}
      >
        {isLoading
          ? Array.from({ length: count }).map((_, i) => (
              <div key={i} className="bg-brand-white border border-brand-line animate-pulse">
                <div className="aspect-[4/3] bg-brand-bg-alt" />
                <div className="p-4">
                  <div className="h-4 bg-brand-bg-alt rounded w-3/4" />
                </div>
              </div>
            ))
          : displayed.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className="bg-brand-white border border-brand-line hover:border-brand-blue transition-colors no-underline group"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
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
                </div>
                <div className="px-4 py-3.5 flex justify-between items-center">
                  <div className="text-[14px] font-medium text-brand-ink">{cat.name}</div>
                  {cat.products_count !== undefined && (
                    <span className="font-mono text-[10px] tracking-[0.06em] text-brand-muted uppercase">
                      {cat.products_count.toLocaleString()} SKUs
                    </span>
                  )}
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
