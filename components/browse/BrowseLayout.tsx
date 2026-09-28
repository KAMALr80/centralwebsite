"use client";

import { useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X, SlidersHorizontal, LayoutList, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProductTable } from "@/components/shared/ProductTable";
import { ProductGrid } from "@/components/shared/ProductGrid";
import { Pagination } from "@/components/shared/Pagination";
import { CartBar } from "@/components/shared/CartBar";
import { useProducts, type ProductsParams } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useBrands } from "@/hooks/useBrands";
import { useCategories, type Category } from "@/hooks/useCategories";
import type { BreadcrumbItem } from "@/components/shared/Breadcrumb";

const SORT_OPTIONS = [
  { value: "name_asc", label: "Bestselling" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
] as const;

const VALID_SORTS = new Set<ProductsParams["sort"]>(SORT_OPTIONS.map((option) => option.value));

interface BrowseLayoutProps {
  categoryId?: number;
  categoryName?: string;
  brandId?: number;
  /** Sub-categories passed from category pages (rendered as pills) */
  subCategories?: Category[];
  crumbs?: BreadcrumbItem[];
  title?: string;
  defaultSort?: ProductsParams["sort"];
  saleOnly?: boolean;
  showDiscountPct?: boolean;
}

export function BrowseLayout({
  categoryId,
  categoryName,
  brandId,
  subCategories = [],
  crumbs,
  title,
  defaultSort = "name_asc",
  saleOnly = false,
  showDiscountPct = false,
}: BrowseLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL-driven state
  const requestedPage = Number(searchParams.get("page") ?? 1);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const requestedSort = searchParams.get("sort") as ProductsParams["sort"];
  const sort = requestedSort && VALID_SORTS.has(requestedSort) ? requestedSort : defaultSort;
  const search = searchParams.get("search")?.trim() || undefined;
  const inStock = searchParams.get("in_stock") === "true";
  const activeBrandIds = searchParams.getAll("brand_id").map(Number).filter(Boolean);
  const subCatId = searchParams.get("sub_cat") ? Number(searchParams.get("sub_cat")) : undefined;
  // Sidebar-driven category selection (only used when categoryId prop is not set)
  const catId = searchParams.get("cat") ? Number(searchParams.get("cat")) : undefined;

  // Local state
  const [qtyMap, setQtyMap] = useState<Record<number, number>>({});
  const [brandSearch, setBrandSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const { items: cartItems, addItem, updateQty } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const storedView = localStorage.getItem("fastweb_view");
      if (storedView === "list" || storedView === "grid") setView(storedView);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function switchView(v: "list" | "grid") {
    setView(v);
    setQtyMap({});
    try {
      localStorage.setItem("fastweb_view", v);
    } catch {
      // The selected view still works when storage is unavailable.
    }
  }

  // ── URL helpers ────────────────────────────────────────────────────────────

  function setParam(key: string, value: string | null) {
    const p = new URLSearchParams(searchParams.toString());
    if (value === null) p.delete(key);
    else p.set(key, value);
    if (key !== "page") p.delete("page");
    router.push(`${pathname}?${p.toString()}`);
  }

  function toggleBrand(id: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("brand_id");
    p.delete("page");
    const next = activeBrandIds.includes(id) ? [] : [id];
    next.forEach((b) => p.append("brand_id", String(b)));
    router.push(`${pathname}?${p.toString()}`);
  }

  function toggleCategory(id: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("sub_cat");
    p.delete("page");
    if (catId === id) {
      p.delete("cat");
    } else {
      p.set("cat", String(id));
    }
    router.push(`${pathname}?${p.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  // ── Data ───────────────────────────────────────────────────────────────────

  const { data: allBrands } = useBrands();
  const { data: allCategories } = useCategories();

  const filteredBrands = brandSearch.trim()
    ? (allBrands ?? []).filter((b) =>
        b.name.toLowerCase().includes(brandSearch.toLowerCase().trim())
      )
    : (allBrands ?? []);

  // Sub-categories for the sidebar filter:
  // - On a fixed category page (categoryId prop): children come from subCategories prop
  // - On generic pages: children come from whichever top-level cat is selected via URL
  const activeSidebarCat = !categoryId
    ? (allCategories ?? []).find((c) => c.id === catId)
    : null;
  const sidebarSubCats: Category[] = categoryId
    ? subCategories
    : (activeSidebarCat?.children ?? []);

  const params: ProductsParams = {
    category_id: catId ?? categoryId,
    sub_category_id: subCatId,
    brand_id: activeBrandIds.length >= 1 ? activeBrandIds[0] : undefined,
    in_stock: inStock || undefined,
    search,
    sort,
    page,
    per_page: 48,
  };
  if (brandId) params.brand_id = brandId;

  const { data, isLoading, isError, refetch } = useProducts(params);

  const products = useMemo(() => {
    const nextProducts = data?.data ?? [];
    return saleOnly ? nextProducts.filter((p) => p.on_sale) : nextProducts;
  }, [data?.data, saleOnly]);

  const meta = data?.meta;
  const activeFilterCount =
    (inStock ? 1 : 0) +
    activeBrandIds.length +
    (!categoryId && catId ? 1 : 0) +
    (subCatId ? 1 : 0);

  // ── Cart ───────────────────────────────────────────────────────────────────

  const persistSelectedItems = useCallback(() => {
    products.forEach((product) => {
      const quantity = qtyMap[product.id] ?? 0;
      if (quantity <= 0 || !product.in_stock) return;

      if (cartItems.some((item) => item.product_id === product.id)) {
        updateQty(product.id, quantity);
        return;
      }

      const rawPrice =
        product.current_price ?? product.sale_price ?? product.regular_price;
      const price = rawPrice === null ? 0 : Number(rawPrice);

      addItem(
        {
          product_id: product.id,
          name: product.name,
          sku: product.sku,
          image: product.image,
          price: Number.isFinite(price) && price >= 0 ? price : 0,
          parent_id: product.parent_id,
          parent_name: null,
          price_pending: !product.prices_visible || rawPrice === null,
        },
        quantity
      );
    });
  }, [products, qtyMap, cartItems, addItem, updateQty]);

  const handleAddToCart = useCallback(() => {
    const selectedProducts = products.filter(
      (product) => (qtyMap[product.id] ?? 0) > 0
    );

    if (!isAuthenticated) {
      persistSelectedItems();
      setQtyMap({});
      return;
    }

    if (selectedProducts.some((product) => !product.prices_visible)) {
      persistSelectedItems();
      router.push("/cart");
      return;
    }

    products.forEach((p) => {
      const qty = qtyMap[p.id];
      const price = p.current_price ?? p.sale_price;
      if (qty && qty > 0 && p.in_stock && p.prices_visible && price !== null) {
        addItem(
          {
            product_id: p.id,
            name: p.name,
            sku: p.sku,
            image: p.image,
            price,
            parent_id: p.parent_id,
            parent_name: null,
          },
          qty
        );
      }
    });
    setQtyMap({});
  }, [
    products,
    qtyMap,
    addItem,
    isAuthenticated,
    persistSelectedItems,
    router,
    setQtyMap,
  ]);

  const handleViewCart = useCallback(() => {
    if (!isAuthenticated) {
      persistSelectedItems();
      router.push("/login?next=/cart");
      return;
    }
    router.push("/cart");
  }, [isAuthenticated, persistSelectedItems, router]);

  const selectedCount = Object.values(qtyMap).filter((q) => q > 0).length;

  const pageTitle = title ?? categoryName ?? (brandId ? "Brand" : "All Products");
  const metaStr = meta
    ? `${meta.total.toLocaleString()} SKUs${meta.from && meta.to ? ` · ${meta.from}–${meta.to}` : ""}`
    : undefined;

  // Chip label helpers
  const activeCatName = !categoryId
    ? (allCategories ?? []).find((c) => c.id === catId)?.name
    : undefined;
  const activeSubCatName = sidebarSubCats.find((sc) => sc.id === subCatId)?.name;

  return (
    <div className="bg-background min-h-screen pb-20">
      <PageHeader
        crumbs={
          crumbs ?? [
            { label: "Shop", href: "/shop" },
            ...(categoryName ? [{ label: categoryName }] : []),
          ]
        }
        title={pageTitle}
        meta={metaStr}
      />

      {/* Sub-category pills — category pages only */}
      {subCategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-3 sm:px-8">
          <Button
            variant={!subCatId ? "default" : "outline"}
            size="sm"
            className="rounded-full px-3"
            onClick={() => setParam("sub_cat", null)}
          >
            All
          </Button>
          {subCategories.map((sc) => (
            <Button
              key={sc.id}
              variant={subCatId === sc.id ? "default" : "outline"}
              size="sm"
              className="rounded-full px-3"
              onClick={() => setParam("sub_cat", String(sc.id))}
            >
              {sc.name}
              {sc.products_count !== undefined && (
                <span className="font-mono text-[9.5px] opacity-60">{sc.products_count}</span>
              )}
            </Button>
          ))}
        </div>
      )}

      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 pt-6 sm:px-8 lg:flex-row">
        {/* ── Filters sidebar ──────────────────────────────── */}
        <aside className="w-full shrink-0 lg:w-[240px]">
          <Card size="sm" className="gap-0 py-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <SlidersHorizontal className="size-3.5" />
                Filters
                {activeFilterCount > 0 && <Badge variant="secondary">{activeFilterCount}</Badge>}
              </span>
              {activeFilterCount > 0 && (
                <Button variant="link" size="xs" className="h-auto px-0" onClick={clearAll}>
                  Clear all
                </Button>
              )}
            </div>

            <FilterSection title="Stock">
              <FilterOption
                checked={inStock}
                onCheckedChange={(checked) => setParam("in_stock", checked ? "true" : null)}
                label="In stock now"
              />
            </FilterSection>

            {!brandId && (
              <FilterSection
                title="Brand"
                aside={activeBrandIds.length > 0 ? `${activeBrandIds.length} selected` : undefined}
              >
                <Input
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="Search brands…"
                  className="mb-2"
                />
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {filteredBrands.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No brands found</p>
                  ) : (
                    filteredBrands.map((b) => (
                      <FilterOption
                        key={b.id}
                        checked={activeBrandIds.includes(b.id)}
                        onCheckedChange={() => toggleBrand(b.id)}
                        label={b.name}
                      />
                    ))
                  )}
                </div>
              </FilterSection>
            )}

            {!categoryId && (
              <FilterSection title="Category">
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {(allCategories ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)).map((cat) => (
                    <FilterOption
                      key={cat.id}
                      checked={catId === cat.id}
                      onCheckedChange={() => toggleCategory(cat.id)}
                      label={cat.name}
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {sidebarSubCats.length > 0 && (
              <FilterSection title="Sub-category">
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {sidebarSubCats.map((sc) => (
                    <FilterOption
                      key={sc.id}
                      checked={subCatId === sc.id}
                      onCheckedChange={() =>
                        setParam("sub_cat", subCatId === sc.id ? null : String(sc.id))
                      }
                      label={sc.name}
                    />
                  ))}
                </div>
              </FilterSection>
            )}
          </Card>
        </aside>

        {/* ── Main: toolbar + table + pagination ─────────── */}
        <main className="min-w-0 flex-1">
          <div className="mb-3 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {meta && (
                <span>
                  <span className="font-semibold text-foreground">{meta.total.toLocaleString()} SKUs</span>
                  {meta.from && meta.to && ` · ${meta.from}–${meta.to}`}
                </span>
              )}
              {inStock && (
                <FilterChip onRemove={() => setParam("in_stock", null)}>In stock</FilterChip>
              )}
              {activeBrandIds.map((bid) => {
                const brand = (allBrands ?? []).find((b) => b.id === bid);
                return (
                  <FilterChip key={bid} onRemove={() => toggleBrand(bid)}>
                    {brand?.name ?? bid}
                  </FilterChip>
                );
              })}
              {!categoryId && catId && (
                <FilterChip onRemove={() => toggleCategory(catId)}>{activeCatName ?? catId}</FilterChip>
              )}
              {subCatId && (
                <FilterChip onRemove={() => setParam("sub_cat", null)}>{activeSubCatName ?? subCatId}</FilterChip>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5">
                <Button
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => switchView("list")}
                  aria-pressed={view === "list"}
                  aria-label="List view"
                >
                  <LayoutList />
                </Button>
                <Button
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => switchView("grid")}
                  aria-pressed={view === "grid"}
                  aria-label="Grid view"
                >
                  <LayoutGrid />
                </Button>
              </div>

              <Select
                items={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                value={sort}
                onValueChange={(value) => {
                  if (value) setParam("sort", value);
                }}
              >
                <SelectTrigger className="min-w-36 bg-card" aria-label="Sort products">
                  <span className="text-muted-foreground">Sort:</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isError ? (
            <Card className="items-center py-12 text-center">
              <p className="text-sm text-muted-foreground">Products could not be loaded.</p>
              <Button type="button" onClick={() => refetch()}>
                Try again
              </Button>
            </Card>
          ) : view === "grid" ? (
            <ProductGrid
              products={products}
              showBrand={!brandId}
              showDiscountPct={showDiscountPct}
              loading={isLoading}
              onQtyChange={setQtyMap}
            />
          ) : (
            <ProductTable
              products={products}
              showBrand={!brandId}
              showDiscountPct={showDiscountPct}
              loading={isLoading}
              onQtyChange={setQtyMap}
            />
          )}

          {!isError && meta && meta.last_page > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                onPageChange={(p) => setParam("page", String(p))}
              />
            </div>
          )}
        </main>
      </div>

      <CartBar
        onAddToCart={selectedCount > 0 ? handleAddToCart : undefined}
        selectedCount={selectedCount}
        onViewCart={handleViewCart}
      />
    </div>
  );
}

function FilterSection({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: string;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-border px-4 py-4 last:border-b-0">
      <div className="mb-2.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span>{title}</span>
        {aside && <span className="font-normal normal-case tracking-normal">{aside}</span>}
      </div>
      {children}
    </div>
  );
}

function FilterOption({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <Label className="cursor-pointer font-normal text-foreground">
      <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} />
      <span className="truncate">{label}</span>
    </Label>
  );
}

function FilterChip({ onRemove, children }: { onRemove: () => void; children: ReactNode }) {
  return (
    <Badge
      variant="outline"
      render={<button type="button" onClick={onRemove} />}
      className="h-6 cursor-pointer gap-1 bg-card px-2.5 text-[11px] hover:bg-muted"
    >
      {children}
      <X data-icon="inline-end" />
    </Badge>
  );
}
