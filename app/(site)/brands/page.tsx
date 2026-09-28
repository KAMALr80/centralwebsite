"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useBrands } from "@/hooks/useBrands";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <span className="font-heading text-3xl font-semibold uppercase text-muted-foreground/60">
        {label.slice(0, 2)}
      </span>
    </div>
  );
}

export default function BrandsPage() {
  const { data: brands, isLoading } = useBrands();

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        crumbs={[{ label: "Brands" }]}
        title="All Brands"
        meta={brands ? `${brands.length} brands` : undefined}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
                <Skeleton className="aspect-[4/3] rounded-none" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !brands?.length ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No brands found
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.id}`}
                className="group block overflow-hidden rounded-lg bg-card no-underline ring-1 ring-foreground/10 transition-shadow hover:shadow-md hover:ring-primary/30"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {brand.image ? (
                    <Image
                      src={brand.image}
                      alt={brand.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <Placeholder label={brand.name} />
                  )}
                </div>
                <div className="px-4 pb-5 pt-4">
                  {brand.location && (
                    <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                      {brand.location}
                    </div>
                  )}
                  <div className="font-heading text-lg font-semibold leading-tight text-foreground">
                    {brand.name}
                  </div>
                  {brand.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {brand.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    {brand.products_count !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {brand.products_count} SKUs
                      </span>
                    )}
                    <ArrowRight className="ml-auto size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
