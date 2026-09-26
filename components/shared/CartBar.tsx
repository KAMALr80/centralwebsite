"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

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
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-stretch justify-between gap-3 bg-brand-navy px-4 py-3 font-mono text-[11.5px] tracking-[0.04em] text-white shadow-[0_-2px_16px_rgba(0,0,0,0.2)] sm:flex-row sm:items-center sm:px-8">
      <div className="flex flex-wrap items-center gap-3 sm:gap-6">
        <span className="flex items-center gap-2">
          <ShoppingCart size={14} className="text-[#9DAAC2]" />
          <span className="text-[#9DAAC2]">CART</span>
          <span className="bg-brand-orange px-1.5 py-0.5 text-[10px] leading-none text-white">
            {itemCount}
          </span>
        </span>
        <span className="text-[#C8D2E5]">
          SUBTOTAL{" "}
          <span className="font-semibold text-white">
            {!isAuthenticated || hasPendingPrices
              ? "Sign in for price"
              : `$${subtotal.toFixed(2)}`}
          </span>
        </span>
        {selectedCount !== undefined && selectedCount > 0 && (
          <span className="text-[#9DAAC2]">{selectedCount} SELECTED</span>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        {onAddToCart && (
          <button
            type="button"
            onClick={onAddToCart}
            className="bg-brand-orange px-5 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-orange/90"
          >
            {cta}
          </button>
        )}
        {onViewCart ? (
          <button
            type="button"
            onClick={onViewCart}
            className="border border-[#2A4A6E] px-5 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[#C8D2E5] transition-colors hover:border-[#9DAAC2] hover:text-white"
          >
            View cart →
          </button>
        ) : (
          <Link
            href="/cart"
            className="border border-[#2A4A6E] px-5 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[#C8D2E5] no-underline transition-colors hover:border-[#9DAAC2] hover:text-white"
          >
            View cart →
          </Link>
        )}
      </div>
    </div>
  );
}
