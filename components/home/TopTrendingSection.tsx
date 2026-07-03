"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductGrid } from "@/components/shared/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { SectionHeader } from "./SectionHeader";

// TODO(backend): no trending/best-seller signal exists in the Product API yet.
// Once a real signal (e.g. order_count_30d) is available, wire it in here via sort/params.
export function TopTrendingSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [qtyMap, setQtyMap] = useState<Record<number, number>>({});

  const { data, isLoading } = useProducts({ per_page: 10 });
  const products = data?.data ?? [];

  const handleAddToCart = useCallback(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    products.forEach((p) => {
      const qty = qtyMap[p.id];
      if (qty && qty > 0 && p.in_stock) {
        addItem(
          {
            product_id: p.id,
            name: p.name,
            sku: p.sku,
            image: p.image,
            price: p.current_price ?? p.sale_price ?? 0,
            parent_id: p.parent_id,
            parent_name: null,
          },
          qty
        );
      }
    });
    setQtyMap({});
  }, [products, qtyMap, addItem, isAuthenticated, router]);

  const selectedCount = Object.values(qtyMap).filter((q) => q > 0).length;

  return (
    <section className="px-4 sm:px-8 md:px-16 bg-brand-bg-alt" style={{ paddingTop: "3.5rem", paddingBottom: "3.5rem" }}>
      <SectionHeader
        eyebrow="Curated picks"
        title="Top trending."
        subtitle=""
        viewAllHref="/shop"
        action={
          selectedCount > 0 ? (
            <button
              onClick={handleAddToCart}
              className="font-mono text-[11px] tracking-[0.06em] uppercase bg-brand-orange text-white px-3 py-1.5 rounded-[var(--brand-radius)] hover:bg-brand-orange/90 transition-colors"
            >
              Add {selectedCount} to cart →
            </button>
          ) : undefined
        }
      />

      <ProductGrid products={products} loading={isLoading} onQtyChange={setQtyMap} />
    </section>
  );
}
