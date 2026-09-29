"use client";

import { use, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ChevronLeft, ChevronRight, ImageIcon, ShoppingCart } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import { type Product } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { PriceGate } from "@/components/shared/PriceGate";
import { StockDot } from "@/components/shared/StockDot";
import { CartBar } from "@/components/shared/CartBar";
import { QtyStepper } from "@/components/shared/QtyStepper";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import {
  useToggleWishlist,
  useWishlist as useWishlistItems,
} from "@/hooks/useWishlist";

interface Props {
  params: Promise<{ id: string }>;
}

// ─── Image Gallery ────────────────────────────────────────────────────────────

function ImagePlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground/50">
      <ImageIcon className="size-10" />
      <span className="text-xs">No image</span>
    </div>
  );
}

function ImageGallery({ images, name }: { images: { url: string; is_primary: boolean }[]; name: string }) {
  const sorted = [...images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => (i - 1 + sorted.length) % sorted.length);
  const next = () => setActive((i) => (i + 1) % sorted.length);

  if (sorted.length === 0) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
        <ImagePlaceholder />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        <Image
          src={sorted[active].url}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
          priority
        />
        {sorted.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
            >
              <ChevronRight />
            </Button>
          </>
        )}
      </div>

      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {sorted.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md bg-muted ring-2 transition-shadow",
                i === active ? "ring-primary" : "ring-transparent hover:ring-border"
              )}
            >
              <Image src={img.url} alt={`${name} ${i + 1}`} fill className="object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Price Block ─────────────────────────────────────────────────────────────

function PriceBlock({ product }: { product: Product }) {
  return (
    <PriceGate pricesVisible={product.prices_visible}>
      {product.on_sale && product.sale_price !== null ? (
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-semibold text-destructive">
            ${product.sale_price.toFixed(2)}
          </span>
          {product.regular_price !== null && (
            <span className="font-mono text-base text-muted-foreground line-through">
              ${product.regular_price.toFixed(2)}
            </span>
          )}
          {product.regular_price !== null && product.sale_price !== null && (
            <Badge variant="destructive" className="font-mono">
              -{Math.round((1 - product.sale_price / product.regular_price) * 100)}%
            </Badge>
          )}
        </div>
      ) : product.current_price !== null ? (
        <span className="font-mono text-2xl font-semibold text-foreground">
          ${product.current_price.toFixed(2)}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">Price not set</span>
      )}
    </PriceGate>
  );
}

// ─── Simple Product Panel ────────────────────────────────────────────────────

function SimpleAddToCart({ product }: { product: Product }) {
  const [qty, setQty] = useState(0);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const price = product.current_price ?? product.sale_price;

  if (!isAuthenticated || !product.prices_visible || price === null) {
    return (
      <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "mt-5 h-10 w-full text-sm no-underline")}>
        Login to buy
      </Link>
    );
  }

  const handleAdd = () => {
    if (qty === 0) return;
    addItem(
      {
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        image: product.image,
        price,
        parent_id: product.parent_id,
        parent_name: null,
      },
      qty
    );
    setQty(0);
  };

  return (
    <div className="mt-5 flex items-center gap-3">
      <QtyStepper
        value={qty}
        onChange={setQty}
        disabled={!product.in_stock}
        max={product.stock_quantity ?? undefined}
      />
      <Button
        size="lg"
        onClick={handleAdd}
        disabled={qty === 0 || !product.in_stock}
        className="h-9 flex-1 text-sm"
      >
        <ShoppingCart />
        {!product.in_stock ? "Out of stock" : "Add to cart"}
      </Button>
    </div>
  );
}

// ─── Grouped Variant Table ───────────────────────────────────────────────────

function GroupedVariantTable({ product }: { product: Product }) {
  const children = product.children ?? [];
  const [qtys, setQtys] = useState<Record<number, number>>({});
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const setQty = (id: number, qty: number) =>
    setQtys((prev) => ({ ...prev, [id]: qty }));

  const selectedCount = Object.values(qtys).filter((q) => q > 0).length;

  const handleAddAll = () => {
    children.forEach((child) => {
      const qty = qtys[child.id] ?? 0;
      if (qty === 0) return;
      const price = child.current_price ?? child.sale_price;
      if (!child.in_stock || price === null) return;
      addItem(
        {
          product_id: child.id,
          name: child.name,
          sku: child.sku,
          image: child.image ?? product.image,
          price,
          parent_id: product.id,
          parent_name: product.name,
        },
        qty
      );
    });
    setQtys({});
  };

  const TH = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

  if (children.length === 0) {
    return <p className="mt-4 text-sm text-muted-foreground">No variants available.</p>;
  }

  if (!isAuthenticated || !product.prices_visible) {
    return (
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Sign in to view wholesale prices and order variants.</p>
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "h-9 px-5 no-underline")}>
            Login to buy
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border py-4">
        <CardTitle className="flex items-center gap-2">
          Variants <Badge variant="secondary" className="font-mono">{children.length} SKUs</Badge>
        </CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={cn(TH, "pl-4")}>Variant</TableHead>
            <TableHead className={TH}>SKU</TableHead>
            <TableHead className={cn(TH, "text-right")}>Price</TableHead>
            <TableHead className={cn(TH, "text-right")}>Stock</TableHead>
            <TableHead className={cn(TH, "text-right")}>Qty</TableHead>
            <TableHead className={cn(TH, "pr-4 text-right")}>Line</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {children.map((child) => {
            const qty = qtys[child.id] ?? 0;
            const price = child.current_price ?? child.sale_price;
            return (
              <TableRow key={child.id} className="text-[12.5px]">
                <TableCell className="pl-4">
                  <div className="flex items-center gap-2">
                    {(child.image ?? product.image) ? (
                      <div className="relative size-8 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={(child.image ?? product.image)!}
                          alt={child.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : null}
                    <span className="text-foreground">{child.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">{child.sku}</TableCell>
                <TableCell className="text-right">
                  <PriceGate pricesVisible={child.prices_visible}>
                    {child.on_sale && child.sale_price !== null ? (
                      <span className="font-mono font-semibold text-destructive">${child.sale_price.toFixed(2)}</span>
                    ) : price !== null ? (
                      <span className="font-mono">${price.toFixed(2)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </PriceGate>
                </TableCell>
                <TableCell className="text-right">
                  <StockDot inStock={child.in_stock} stockQuantity={child.stock_quantity} />
                </TableCell>
                <TableCell className="text-right">
                  <QtyStepper
                    value={qty}
                    onChange={(n) => setQty(child.id, n)}
                    disabled={!child.in_stock || price === null}
                    max={child.stock_quantity ?? undefined}
                  />
                </TableCell>
                <TableCell className="pr-4 text-right font-mono text-foreground">
                  {qty > 0 && price !== null ? `$${(qty * price).toFixed(2)}` : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <span className="text-xs text-muted-foreground">
          {selectedCount} variant{selectedCount !== 1 ? "s" : ""} selected
        </span>
        <Button size="lg" onClick={handleAddAll} disabled={selectedCount === 0} className="h-9 px-5">
          <ShoppingCart />
          Add to cart ({selectedCount})
        </Button>
      </div>

      <CartBar />
    </Card>
  );
}

// ─── Spec Strip ──────────────────────────────────────────────────────────────

function SpecStrip({ attributes }: { attributes?: Record<string, string> | null }) {
  if (!attributes || Object.keys(attributes).length === 0) return null;

  const entries = Object.entries(attributes);

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border py-4">
        <CardTitle>Product specifications</CardTitle>
      </CardHeader>
      <dl className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(([key, value]) => (
          <div key={key} className="bg-card px-4 py-4">
            <dt className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">{key}</dt>
            <dd className="text-sm text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

// ─── Main Product Detail ──────────────────────────────────────────────────────

function ProductDetail({ id }: { id: string }) {
  const { data: product, isLoading, isError } = useProduct(id);
  const { data: wishlistItems = [] } = useWishlistItems();
  const { toggle: toggleWishlist, isPending: wishlistLoading } = useToggleWishlist();
  const { isAuthenticated } = useAuth();
  const wishlisted = wishlistItems.some((item) => item.product_id === Number(id));

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-8">
        <Skeleton className="mb-6 h-4 w-64" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-[4/3] rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Product not found.</p>
        <Link href="/shop" className={cn(buttonVariants({ variant: "outline" }), "no-underline")}>
          <ChevronLeft /> Back to shop
        </Link>
      </div>
    );
  }

  const images = product.images ?? (product.image ? [{ url: product.image, is_primary: true }] : []);
  const description = product.short_description || product.description;

  const crumbs = [
    { label: "Shop", href: "/shop" },
    ...(product.category ? [{ label: product.category.name, href: `/category/${product.category.id}` }] : []),
    ...(product.brand ? [{ label: product.brand.name, href: `/brand/${product.brand.id}` }] : []),
    { label: product.name },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-8">
        <Breadcrumb items={crumbs} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-4 sm:p-6">
            <ImageGallery images={images} name={product.name} />
          </Card>

          <Card className="p-5 sm:p-8">
            <div>
              {product.brand && (
                <Link
                  href={`/brand/${product.brand.id}`}
                  className="font-mono text-xs font-medium uppercase tracking-wide text-primary transition-colors hover:text-primary/80"
                >
                  {product.brand.name}
                </Link>
              )}

              <h1 className="mt-1 font-heading text-3xl font-semibold leading-[1.1] tracking-tight text-foreground">
                {product.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] uppercase text-muted-foreground">SKU · {product.sku}</span>
                {product.on_sale && <Badge variant="destructive" className="font-mono">Sale</Badge>}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <PriceBlock product={product} />
                <StockDot inStock={product.in_stock} stockQuantity={product.stock_quantity} />
              </div>

              {description && (
                <>
                  <Separator className="my-5" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description.length > 400 ? description.slice(0, 400) + "…" : description}
                  </p>
                </>
              )}

              {product.type !== "grouped" && <SimpleAddToCart product={product} />}

              <Separator className="my-5" />

              {isAuthenticated ? (
                <Button
                  variant={wishlisted ? "destructive" : "outline"}
                  onClick={() => toggleWishlist(product.id)}
                  disabled={wishlistLoading}
                  title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart fill={wishlisted ? "currentColor" : "none"} />
                  {wishlisted ? "Wishlisted" : "Add to wishlist"}
                </Button>
              ) : (
                <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "no-underline")}>
                  <Heart /> Sign in to wishlist
                </Link>
              )}
            </div>
          </Card>
        </div>

        {product.type === "grouped" && <GroupedVariantTable product={product} />}

        <SpecStrip attributes={product.attributes} />
      </div>

      {product.type !== "grouped" && product.prices_visible && <CartBar />}
    </div>
  );
}

export default function ProductPage({ params }: Props) {
  const { id } = use(params);
  return (
    <Suspense>
      <ProductDetail id={id} />
    </Suspense>
  );
}
