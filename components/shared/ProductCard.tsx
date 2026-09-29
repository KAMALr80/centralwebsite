"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StockDot } from "./StockDot";
import { PriceGate } from "./PriceGate";
import { type Product } from "@/hooks/useProducts";

export type ProductCardData = Pick<
  Product,
  "id" | "name" | "sku" | "brand" | "current_price" |
  "sale_price" | "regular_price" | "on_sale" | "in_stock" | "stock_quantity" |
  "prices_visible" | "image"
>;

interface ProductCardProps {
  product: ProductCardData;
  onWishlistToggle?: (id: number) => void;
  wishlisted?: boolean;
}

function ImagePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/40">
      <ImageIcon className="size-8" />
    </div>
  );
}

export function ProductCard({ product, onWishlistToggle, wishlisted = false }: ProductCardProps) {
  return (
    <div className="relative bg-card border border-border rounded-lg overflow-hidden group hover:border-primary hover:shadow-md transition-[border-color,box-shadow]">
      {/* Image */}
      <Link href={`/product/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder />
        )}
        {product.on_sale && (
          <Badge className="absolute top-2 left-2 bg-destructive font-mono text-white">Sale</Badge>
        )}
      </Link>

      {/* Details */}
      <div className="p-3">
        {product.brand?.name && (
          <Link
            href={product.brand.id ? `/brand/${product.brand.id}` : "/brands"}
            className="font-mono text-[10px] tracking-[0.06em] text-primary uppercase hover:text-primary/80 transition-colors"
          >
            {product.brand.name}
          </Link>
        )}
        <Link href={`/product/${product.id}`} className="block mt-0.5">
          <h3 className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between gap-2">
          <PriceGate pricesVisible={product.prices_visible}>
            {product.on_sale && product.sale_price !== null ? (
              <span className="flex items-baseline gap-1.5 font-mono text-[13px]">
                <span className="text-destructive font-semibold">${product.sale_price.toFixed(2)}</span>
                <span className="text-muted-foreground line-through text-[11px]">${product.regular_price?.toFixed(2)}</span>
              </span>
            ) : (
              <span className="font-mono text-[13px] font-semibold text-foreground">
                {product.current_price !== null ? `$${product.current_price.toFixed(2)}` : "—"}
              </span>
            )}
          </PriceGate>

          <StockDot inStock={product.in_stock} stockQuantity={product.stock_quantity} />
        </div>
      </div>

      {/* Wishlist button */}
      {onWishlistToggle && (
        <button
          onClick={() => onWishlistToggle(product.id)}
          className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/80 shadow-sm backdrop-blur transition-colors hover:bg-background"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={14}
            className={wishlisted ? "text-destructive fill-destructive" : "text-muted-foreground"}
          />
        </button>
      )}
    </div>
  );
}
