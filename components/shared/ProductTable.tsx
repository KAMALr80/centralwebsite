"use client";

import { useState, Fragment, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronRight, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { StockDot } from "./StockDot";
import { QtyStepper } from "./QtyStepper";
import { PriceGate } from "./PriceGate";
import { type Product } from "@/hooks/useProducts";

export type { Product };

interface ProductTableProps {
  products: Product[];
  showBrand?: boolean;
  /** Show extra "Off %" column — used on sale page */
  showDiscountPct?: boolean;
  loading?: boolean;
  /** Called when quantities change; receives map of product_id → qty */
  onQtyChange?: (qtyMap: Record<number, number>) => void;
}

const TH = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

export function ProductTable({
  products,
  showBrand = true,
  showDiscountPct = false,
  loading = false,
  onQtyChange,
}: ProductTableProps) {
  const [qtyMap, setQtyMap] = useState<Record<number, number>>({});
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const columnCount = 7 + (showBrand ? 1 : 0) + (showDiscountPct ? 1 : 0);

  function setQty(productId: number, qty: number) {
    const next = { ...qtyMap, [productId]: qty };
    setQtyMap(next);
    onQtyChange?.(next);
  }

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function renderPriceCell(p: Product) {
    return (
      <PriceGate pricesVisible={p.prices_visible}>
        {p.on_sale && p.sale_price !== null ? (
          <span className="flex flex-col font-mono leading-snug">
            <span className="text-destructive font-semibold">${p.sale_price.toFixed(2)}</span>
            <span className="text-muted-foreground line-through text-[11px]">${p.regular_price?.toFixed(2)}</span>
          </span>
        ) : (
          <span className="font-mono font-semibold text-foreground">
            {p.current_price !== null ? `$${p.current_price.toFixed(2)}` : "—"}
          </span>
        )}
      </PriceGate>
    );
  }

  function renderDiscountPct(p: Product) {
    if (!p.prices_visible || !p.on_sale || !p.sale_price || !p.regular_price) return <span className="text-muted-foreground">—</span>;
    const pct = Math.round((1 - p.sale_price / p.regular_price) * 100);
    return <span className="font-mono text-destructive font-semibold">{pct}%</span>;
  }

  function renderRow(p: Product, isChild = false): ReactNode {
    const isGrouped = p.type === "grouped" && p.children && p.children.length > 0;
    const isOpen = expanded.has(p.id);

    return (
      <Fragment key={p.id}>
        <TableRow className={cn("text-[12.5px]", isChild && "bg-muted/30")}>
          <TableCell className="w-8">
            {isGrouped ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => toggleExpand(p.id)}
                aria-label={isOpen ? "Collapse variants" : "Expand variants"}
              >
                {isOpen ? <ChevronDown /> : <ChevronRight />}
              </Button>
            ) : isChild ? (
              <span className="ml-2 block h-px w-3 bg-border" />
            ) : null}
          </TableCell>

          <TableCell className="w-14">
            <div className="size-9 shrink-0 overflow-hidden rounded-md bg-muted">
              {p.image ? (
                <Image
                  src={p.image}
                  alt={p.name}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                  <ImageIcon className="size-4" />
                </div>
              )}
            </div>
          </TableCell>

          <TableCell className="w-24">
            <span className="font-mono text-[11px] text-muted-foreground">{p.sku}</span>
          </TableCell>

          <TableCell className="whitespace-normal">
            <div className="flex items-center gap-2">
              <Link
                href={`/product/${p.id}`}
                className="font-semibold text-foreground transition-colors hover:text-primary"
              >
                {p.name}
              </Link>
              {p.on_sale && <Badge variant="destructive" className="font-mono">Sale</Badge>}
              {isGrouped && (
                <span className="font-mono text-[10px] text-muted-foreground">
                  · {p.children!.length} variants
                </span>
              )}
            </div>
          </TableCell>

          {showBrand && (
            <TableCell className="w-32">
              {p.brand?.id ? (
                <Link
                  href={`/brand/${p.brand.id}`}
                  className="text-[12px] text-primary transition-colors hover:text-primary/80"
                >
                  {p.brand.name}
                </Link>
              ) : (
                <span className="text-[12px] text-muted-foreground">{p.brand?.name}</span>
              )}
            </TableCell>
          )}

          <TableCell className="w-24 text-right">{renderPriceCell(p)}</TableCell>

          {showDiscountPct && (
            <TableCell className="w-16 text-right">{renderDiscountPct(p)}</TableCell>
          )}

          <TableCell className="w-28">
            <StockDot inStock={p.in_stock} stockQuantity={p.stock_quantity} />
          </TableCell>

          <TableCell className="w-28 text-right">
            {isGrouped ? (
              <span className="font-mono text-[11px] text-muted-foreground">— expand —</span>
            ) : !p.in_stock ? (
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Out of stock</span>
            ) : (
              <QtyStepper
                value={qtyMap[p.id] ?? 0}
                onChange={(n) => setQty(p.id, n)}
                max={p.stock_quantity ?? undefined}
              />
            )}
          </TableCell>
        </TableRow>

        {isGrouped && isOpen && p.children!.map((child) => renderRow(child, true))}
      </Fragment>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-8" />
            <TableHead className={cn(TH, "w-14")}>Img</TableHead>
            <TableHead className={cn(TH, "w-24")}>SKU</TableHead>
            <TableHead className={TH}>Product</TableHead>
            {showBrand && <TableHead className={cn(TH, "w-32")}>Brand</TableHead>}
            <TableHead className={cn(TH, "w-24 text-right")}>Price</TableHead>
            {showDiscountPct && <TableHead className={cn(TH, "w-16 text-right")}>Off</TableHead>}
            <TableHead className={cn(TH, "w-28")}>Stock</TableHead>
            <TableHead className={cn(TH, "w-28 text-right")}>Qty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : products.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columnCount}
                className="py-12 text-center font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground"
              >
                No products found
              </TableCell>
            </TableRow>
          ) : (
            products.map((p) => renderRow(p))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
