"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const viewCartClass =
  "h-9 border-background/20 bg-transparent px-5 uppercase tracking-wide text-background/80 hover:bg-background/10 hover:text-background";

interface CartBarProps {
  onAddToCart?: () => void;
  cta?: string;
  selectedCount?: number;
  onViewCart?: () => void;
}

export function CartBar({
  onAddToCart,
  cta = "ADD TO CART",
  selectedCount,
  onViewCart,
}: CartBarProps) {
  const { itemCount, subtotal, items } = useCart();
  const { isAuthenticated } = useAuth();
  const hasPendingPrices = items.some((item) => item.price_pending);

  if (itemCount === 0 && selectedCount === undefined) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-stretch justify-between gap-3 bg-foreground px-4 py-3 font-mono text-[11.5px] tracking-[0.04em] text-background shadow-lg sm:flex-row sm:items-center sm:px-8">
      <div className="flex flex-wrap items-center gap-3 sm:gap-6">
        <span className="flex items-center gap-2">
          <ShoppingCart size={14} className="text-background/60" />
          <span className="text-background/60">CART</span>
          <Badge>{itemCount}</Badge>
        </span>
        <span className="text-background/80">
          SUBTOTAL{" "}
          <span className="font-semibold text-white">
            {!isAuthenticated || hasPendingPrices
              ? "Sign in for price"
              : `$${subtotal.toFixed(2)}`}
          </span>
        </span>
        {selectedCount !== undefined && selectedCount > 0 && (
          <span className="text-background/60">{selectedCount} SELECTED</span>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        {onAddToCart && (
          <Button type="button" size="lg" onClick={onAddToCart} className="h-9 px-5 uppercase tracking-wide">
            {cta}
          </Button>
        )}
        {onViewCart ? (
          <Button type="button" variant="outline" size="lg" onClick={onViewCart} className={viewCartClass}>
            View cart →
          </Button>
        ) : (
          <Link href="/cart" className={cn(buttonVariants({ variant: "outline", size: "lg" }), viewCartClass, "no-underline")}>
            View cart →
          </Link>
        )}
      </div>
    </div>
  );
}
