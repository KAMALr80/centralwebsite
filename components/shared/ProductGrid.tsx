"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { StockDot } from "./StockDot";
import { QtyStepper } from "./QtyStepper";
import { PriceGate } from "./PriceGate";
import { type Product } from "@/hooks/useProducts";

interface ProductGridProps {
  products: Product[];
  showBrand?: boolean;
  showDiscountPct?: boolean;
  loading?: boolean;
  onQtyChange?: (qtyMap: Record<number, number>) => void;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="mt-3 h-7" />
      </div>
    </div>
  );
}

function ImagePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/40">
      <ImageIcon className="size-8" />
    </div>
  );
}

export function ProductGrid({
  products,
  showBrand = true,
  showDiscountPct = false,
  loading = false,
  onQtyChange,
}: ProductGridProps) {
  const [qtyMap, setQtyMap] = useState<Record<number, number>>({});

  function setQty(productId: number, qty: number) {
    const next = { ...qtyMap, [productId]: qty };
    setQtyMap(next);
    onQtyChange?.(next);
  }

  function renderPrice(p: Product) {
    return (
      <PriceGate pricesVisible={p.prices_visible}>
        {p.on_sale && p.sale_price !== null ? (
          <span className="flex items-baseline gap-1.5 font-mono">
            <span className="text-destructive font-semibold text-[13px]">
              ${p.sale_price.toFixed(2)}
            </span>
            <span className="text-muted-foreground line-through text-[11px]">
              ${p.regular_price?.toFixed(2)}
            </span>
            {showDiscountPct && p.regular_price && (
              <span className="text-destructive font-mono text-[10.5px]">
                {Math.round((1 - p.sale_price / p.regular_price) * 100)}% off
              </span>
            )}
          </span>
        ) : (
          <span className="font-mono font-semibold text-[13px] text-foreground">
            {p.current_price !== null ? `$${p.current_price.toFixed(2)}` : "—"}
          </span>
        )}
      </PriceGate>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pt-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-border bg-card py-16 text-center font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
        No products found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pt-3">
      {products.map((p) => {
        const isGrouped = p.type === "grouped" && p.children && p.children.length > 0;

        return (
          <div
            key={p.id}
            className="flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-[border-color,box-shadow] hover:border-primary hover:shadow-md"
          >
            {/* Image */}
            <Link href={`/product/${p.id}`} className="block relative aspect-square overflow-hidden bg-muted">
              {p.image ? (
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <ImagePlaceholder />
              )}
              {p.on_sale && (
                <Badge className="absolute top-2 left-2 bg-destructive font-mono text-white">Sale</Badge>
              )}
            </Link>

            {/* Body */}
            <div className="p-3 flex flex-col flex-1 gap-1 min-w-0">
              {showBrand && p.brand && (
                <div className="truncate">
                  {p.brand.id ? (
                    <Link
                      href={`/brand/${p.brand.id}`}
                      className="font-mono text-[10px] tracking-[0.05em] uppercase text-primary hover:text-primary/80 transition-colors"
                    >
                      {p.brand.name}
                    </Link>
                  ) : (
                    <span className="font-mono text-[10px] tracking-[0.05em] uppercase text-muted-foreground">
                      {p.brand.name}
                    </span>
                  )}
                </div>
              )}

              <Link
                href={`/product/${p.id}`}
                className="text-[12.5px] font-semibold text-foreground hover:text-primary transition-colors leading-snug line-clamp-2"
              >
                {p.name}
              </Link>

              <span className="font-mono text-[10.5px] text-muted-foreground">{p.sku}</span>

              <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                {renderPrice(p)}
                <StockDot inStock={p.in_stock} stockQuantity={p.stock_quantity} />
              </div>

              <div className="pt-1">
                {isGrouped ? (
                  <Link
                    href={`/product/${p.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full no-underline")}
                  >
                    {p.children!.length} variants →
                  </Link>
                ) : !p.in_stock ? (
                  <span className="block py-1.5 text-center font-mono text-[10.5px] uppercase text-muted-foreground">
                    Out of stock
                  </span>
                ) : (
                  <QtyStepper
                    value={qtyMap[p.id] ?? 0}
                    onChange={(n) => setQty(p.id, n)}
                    max={p.stock_quantity ?? undefined}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
