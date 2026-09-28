"use client";

import { use, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useBrand } from "@/hooks/useBrands";
import { useProducts } from "@/hooks/useProducts";
import { BrowseLayout } from "@/components/browse/BrowseLayout";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

type Tab = "catalog" | "new" | "sale";

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-chart-4 via-chart-3 to-chart-1">
      <Badge variant="secondary" className="bg-background/80">{label}</Badge>
    </div>
  );
}

function BrandHero({ id }: { id: string }) {
  const { data: brand, isLoading: brandLoading } = useBrand(id);
  // Fetch all brand products for stat block
  const { data: productsData } = useProducts({ brand_id: id, per_page: 100 });

  const products = productsData?.data ?? [];
  const total = productsData?.meta?.total ?? products.length;
  const inStockCount = products.filter((p) => p.in_stock).length;
  const prices = products
    .map((p) => p.current_price ?? p.sale_price)
    .filter((p): p is number => p !== null);
  const lowestPrice = prices.length ? Math.min(...prices) : null;

  if (brandLoading) {
    return (
      <Skeleton className="h-[280px] rounded-none" />
    );
  }

  if (!brand) return null;

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3.5 sm:px-8">
        <Breadcrumb
          items={[
            { label: "Brands", href: "/brands" },
            { label: brand.name },
          ]}
        />
      </div>

      {/* Hero — two-column */}
      <div className="grid grid-cols-1 border-b border-border lg:grid-cols-[1.2fr_1fr]">
        {/* Left: image with gradient overlay */}
        <div className="relative min-h-[280px] overflow-hidden">
          {brand.image ? (
            <Image src={brand.image} alt={brand.name} fill className="object-cover" />
          ) : (
            <Placeholder label={`${brand.name} · studio`} />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-foreground/80" />
          {/* Brand name overlay */}
          <div className="absolute bottom-6 left-8 right-8 text-white">
            <div className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-background/80 mb-2">
              {brand.location ?? "USA"}
              {brand.founded_year ? ` · EST. ${brand.founded_year}` : ""}
            </div>
            <h1 className="m-0 font-heading text-3xl font-semibold leading-[0.95] tracking-tight sm:text-5xl">
              {brand.name}
            </h1>
          </div>
        </div>

        {/* Right: buyer fact sheet */}
        <div className="bg-card px-7 py-6">
          <div className="mb-1 flex items-center justify-between border-b border-border pb-3">
            <span className="text-sm font-semibold text-foreground">Buyer fact sheet</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4">
            {[
              { l: "SKUs", v: total ? String(total) : "—" },
              { l: "In stock", v: inStockCount ? String(inStockCount) : "—" },
              {
                l: "Wholesale from",
                v: lowestPrice !== null ? `$${lowestPrice.toFixed(2)}` : "—",
              },
              { l: "Terms", v: "Net-60" },
            ].map((s) => (
              <div key={s.l} className="py-3 border-b border-border">
                <div className="font-mono text-[10px] tracking-[0.06em] uppercase text-muted-foreground mb-0.5">
                  {s.l}
                </div>
                <div className="font-mono text-lg font-semibold text-foreground">
                  {s.v}
                </div>
              </div>
            ))}
          </div>

          {brand.description && (
            <blockquote className="mt-4 pl-3 border-l-2 border-primary">
              <p className="text-[13px] text-muted-foreground leading-relaxed italic">
                {brand.description}
              </p>
            </blockquote>
          )}

          <div className="mt-5 flex items-center gap-4">
            <Link href={`/brand/${id}#products`} className={cn(buttonVariants({ size: "lg" }), "h-9 px-4 no-underline")}>
              Shop all products <ArrowRight data-icon="inline-end" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function BrandProducts({ id, brandName }: { id: string; brandName: string }) {
  const [tab, setTab] = useState<Tab>("catalog");

  const TAB_CONFIG: Record<Tab, { label: string; sort?: "newest"; saleOnly?: boolean }> = {
    catalog: { label: "Catalog" },
    new: { label: "New", sort: "newest" },
    sale: { label: "Sale", saleOnly: true },
  };

  return (
    <div id="products">
      {/* Tab bar */}
      <div className="border-b border-border bg-card px-4 pt-2 sm:px-8">
        <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
          <TabsList variant="line">
            {(Object.entries(TAB_CONFIG) as [Tab, (typeof TAB_CONFIG)[Tab]][]).map(([key, cfg]) => (
              <TabsTrigger key={key} value={key} className="px-4">
                {cfg.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* BrowseLayout handles filters/table/pagination */}
      <BrowseLayout
        key={tab}
        brandId={Number(id)}
        title={brandName}
        crumbs={[
          { label: "Brands", href: "/brands" },
          { label: brandName },
        ]}
        defaultSort={TAB_CONFIG[tab].sort}
        saleOnly={TAB_CONFIG[tab].saleOnly}
      />
    </div>
  );
}

function BrandPageInner({ id }: { id: string }) {
  const { data: brand, isLoading, isError, refetch } = useBrand(id);
  const numericId = Number(id);

  if (isLoading) return <Skeleton className="h-60 rounded-none" />;

  if (!Number.isInteger(numericId) || numericId <= 0 || isError || !brand) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">Brand not found.</p>
        {isError && <Button type="button" onClick={() => refetch()}>Try again</Button>}
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <BrandHero id={id} />
      <BrandProducts id={id} brandName={brand.name} />
    </div>
  );
}

export default function BrandPage({ params }: Props) {
  const { id } = use(params);
  return (
    <Suspense>
      <BrandPageInner id={id} />
    </Suspense>
  );
}
