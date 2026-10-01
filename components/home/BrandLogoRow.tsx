"use client";

import Link from "next/link";
import Image from "next/image";
import { useBrands } from "@/hooks/useBrands";
import { Placeholder } from "./Placeholder";
import { SectionHeader } from "./SectionHeader";

export function BrandLogoRow() {
  const { data: brands, isLoading } = useBrands();
  const displayed = (brands ?? []).slice(0, 8);

  return (
    <section className="px-4 sm:px-8 md:px-16 bg-brand-bg-alt" style={{ paddingTop: "3.5rem", paddingBottom: "3.5rem" }}>
      <SectionHeader eyebrow="SHOP BY BRAND" title="Brands on the shelf." viewAllHref="/brands" viewAllLabel="VIEW ALL BRANDS →" />

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 sm:gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-brand-bg" />
                <div className="h-2.5 w-12 bg-brand-bg rounded" />
              </div>
            ))
          : displayed.map((brand) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.id}`}
                className="flex flex-col items-center gap-2 no-underline group"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border border-brand-line group-hover:border-brand-blue transition-colors relative shrink-0">
                  {brand.image ? (
                    <Image src={brand.image} alt={brand.name} fill sizes="64px" className="object-cover" unoptimized />
                  ) : (
                    <Placeholder tone="cool" className="h-full" />
                  )}
                </div>
                <span className="font-mono text-[10px] tracking-[0.04em] text-brand-ink text-center leading-tight line-clamp-1">
                  {brand.name}
                </span>
              </Link>
            ))}
      </div>
    </section>
  );
}
