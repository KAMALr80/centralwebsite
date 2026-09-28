"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useBrands, type Brand } from "@/hooks/useBrands";
import { useCategories, type Category } from "@/hooks/useCategories";
import { useProducts, type Product } from "@/hooks/useProducts";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FALLBACK_CATEGORIES = [
  "Apparel / Merch",
  "Hookah",
  "Glass / Accessories",
  "Cigar / Lighter Essentials",
  "Smoking Essentials",
  "Everyday Essentials",
  "Detox / Supplements",
  "Clearance",
];

const FALLBACK_BRANDS = ["Puffco", "OPMS", "Coastal Clouds", "Smok", "Formula 420", "Raw", "Blazy Susan"];

const PROMO_TILES = [
  { title: "Infused Essentials", tone: "blue" },
  { title: "7-Hydroxy", tone: "teal" },
  { title: "Juice Bar", tone: "orange" },
  { title: "Vaporizer Vault", tone: "green" },
] as const;

const FEATURED_PRODUCTS = [
  "YOLO Hot Grabba Tube - Box of 30",
  "Puffco Peak Pro Rig 3DXL",
  "Puffco Peak Pro Chamber",
  "ROOR Smoke Ware Cleaner",
  "RAW Cone 5 Premium Hand Pipe",
  "RAW Lighter - Extendo Black",
  "RAW Rolling Papers Box King Size",
  "DUD Hookah Husic Assorted Colors",
  "Zebra Smoke Hookah Assorted Colors",
  "Al Malaki Prince Hookah Top",
  "DUD Party 4 Hoses Hookah",
  "DUD Turkeya Hookah",
  "Quick Fix Plus",
  "Uwell Caliburn A2 Refillable Pod",
];

type Tone = "blue" | "green" | "orange" | "teal" | "dark";

const TONES: Record<Tone, string> = {
  blue: "from-chart-4 via-chart-3 to-chart-1 text-primary-foreground",
  teal: "from-chart-3 via-chart-2 to-chart-1 text-primary-foreground",
  orange: "from-chart-5 via-chart-4 to-chart-2 text-primary-foreground",
  green: "from-chart-5 via-chart-3 to-chart-2 text-primary-foreground",
  dark: "from-foreground via-foreground/90 to-chart-5 text-background",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function BannerVisual({
  title,
  subtitle,
  tone = "blue",
  compact = false,
  eyebrow = "New Arrival",
  cta,
}: {
  title: string;
  subtitle?: string;
  tone?: Tone;
  compact?: boolean;
  eyebrow?: string;
  cta?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full min-h-[230px] overflow-hidden rounded-xl bg-gradient-to-br",
        TONES[tone]
      )}
    >
      <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_18px_18px,white_1.5px,transparent_1.5px)] [background-size:36px_36px]" />
      <div className="absolute -right-16 -bottom-16 size-64 rounded-full bg-background/10" />
      <div className="absolute right-10 -top-10 size-40 rounded-full bg-background/10" />
      <div
        className={cn(
          "relative z-10 flex flex-col justify-center",
          compact ? "max-w-[340px] p-7 md:p-8" : "max-w-[620px] p-8 md:p-12"
        )}
      >
        <Badge variant="secondary" className="mb-4 bg-background/15 text-inherit backdrop-blur">
          {eyebrow}
        </Badge>
        <h2
          className={cn(
            "font-heading font-semibold leading-[1.05] tracking-tight",
            compact ? "text-2xl md:text-3xl" : "text-4xl sm:text-5xl md:text-6xl"
          )}
        >
          {title}
        </h2>
        {subtitle && <p className="mt-3 max-w-[340px] text-sm leading-6 opacity-85">{subtitle}</p>}
        {cta && (
          <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-transform group-hover:translate-x-0.5">
            {cta} <ArrowRight className="size-4" />
          </span>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, href, linkLabel = "View all" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h2>
      {href && (
        <Link href={href} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground no-underline")}>
          {linkLabel} <ArrowRight data-icon="inline-end" />
        </Link>
      )}
    </div>
  );
}

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("mx-auto w-full max-w-[1500px] px-4 py-8 md:px-8 md:py-10", className)}>{children}</section>;
}

function ProductFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/40">
      <ImageIcon className="size-10" />
    </div>
  );
}

function BrandLogo({ brand, index }: { brand?: Brand; index: number }) {
  const label = brand?.name ?? FALLBACK_BRANDS[index % FALLBACK_BRANDS.length];

  return (
    <Link
      href={brand ? `/brand/${brand.id}` : "/brands"}
      className="group flex min-w-0 flex-col items-center gap-3 text-center no-underline"
    >
      <div className="relative size-24 overflow-hidden rounded-full bg-card shadow-sm ring-1 ring-foreground/10 transition-shadow group-hover:shadow-md group-hover:ring-primary/40 md:size-28">
        {brand?.image ? (
          <Image src={brand.image} alt={label} fill sizes="112px" className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="font-heading text-2xl font-semibold uppercase text-muted-foreground">{label.slice(0, 2)}</span>
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">{label}</span>
    </Link>
  );
}

function HomeProductCard({
  product,
  fallbackName,
  index,
  isAuthenticated,
}: {
  product?: Product;
  fallbackName: string;
  index: number;
  isAuthenticated: boolean;
}) {
  const { addItem } = useCart();
  const title = product?.name ?? fallbackName;
  const image = product?.image ?? product?.images?.find((img) => img.is_primary)?.url;
  const href = product ? `/product/${product.id}` : "/shop";
  const soldOut = product ? !product.in_stock : index % 6 === 0;
  const isNew = !soldOut && (index === 1 || index === 2 || index === 3);
  const category = product?.category?.name ?? (index % 2 === 0 ? "Glass / Accessories" : "Papers / Cones / Wraps");
  const price = product?.current_price ?? product?.sale_price ?? product?.regular_price ?? null;
  const regularPrice =
    product?.on_sale && product.regular_price && product.sale_price
      ? product.regular_price
      : null;
  const canAdd = Boolean(product && product.type === "simple" && !soldOut && price !== null && isAuthenticated);

  function handleAddToCart() {
    if (!product || price === null) return;
    addItem(
      {
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        image: image ?? null,
        price,
        parent_id: product.parent_id,
      },
      1
    );
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md hover:ring-primary/30">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-muted" aria-label={`View ${title}`}>
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 15vw"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <ProductFallback />
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          {soldOut && <Badge variant="destructive" className="bg-background/90 font-mono">Sold out</Badge>}
          {isNew && <Badge className="font-mono">New</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <span className="line-clamp-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{category}</span>
        <Link href={href} className="mt-1 no-underline">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5 text-foreground transition-colors group-hover:text-primary">
            {title}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          {!isAuthenticated ? (
            <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full no-underline")}>
              Login to buy
            </Link>
          ) : (
            <>
              <span className="flex flex-col">
                <span className="font-mono text-[10px] font-medium uppercase tracking-wide text-primary">Wholesale</span>
                <span className="font-mono text-lg font-semibold leading-tight text-foreground">
                  {price !== null ? formatPrice(price) : "Price N/A"}
                </span>
                {regularPrice && (
                  <span className="font-mono text-[11px] leading-tight text-muted-foreground line-through">{formatPrice(regularPrice)}</span>
                )}
              </span>

              {canAdd && product ? (
                <Button type="button" size="icon-lg" onClick={handleAddToCart} aria-label={`Add ${title} to cart`} title="Add to cart">
                  <ShoppingCart />
                </Button>
              ) : (
                <Link
                  href={href}
                  className={cn(buttonVariants({ variant: "secondary", size: "icon-lg" }), "no-underline")}
                  aria-label={`View ${title}`}
                  title="View product"
                >
                  <ArrowRight />
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function HeroPromos() {
  return (
    <Section className="pt-6 md:pt-8">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Link href="/new" className="group block min-h-[360px] no-underline">
          <BannerVisual
            title="Haze Collection"
            subtitle="Premium wholesale inventory for fast moving counters."
            cta="Shop the drop"
          />
        </Link>
        <Link href="/shop" className="group block min-h-[360px] no-underline">
          <BannerVisual
            title="Botanical Alternatives"
            subtitle="Fresh drops across everyday essentials."
            tone="dark"
            eyebrow="Wholesale Focus"
            cta="Browse"
            compact
          />
        </Link>
      </div>
    </Section>
  );
}

function FeaturedBrands() {
  const { data: brands } = useBrands();
  const displayed: Array<Brand | undefined> =
    brands && brands.length > 0 ? brands.slice(0, 7) : Array.from({ length: 7 });

  return (
    <Section>
      <SectionHeader title="Featured brands" href="/brands" linkLabel="All brands" />
      <div className="grid grid-cols-2 gap-6 rounded-xl bg-card px-6 py-8 ring-1 ring-foreground/10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {displayed.map((brand, index) => (
          <BrandLogo key={brand?.id ?? index} brand={brand} index={index} />
        ))}
      </div>
    </Section>
  );
}

function PromoGrid() {
  return (
    <Section className="py-0 md:py-0">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PROMO_TILES.map((tile) => (
          <Link key={tile.title} href="/shop" className="group block min-h-[260px] no-underline">
            <BannerVisual title={tile.title} tone={tile.tone} eyebrow="Collection" compact />
          </Link>
        ))}
      </div>
    </Section>
  );
}

function Categories() {
  const { data: categories } = useCategories();
  const displayed: Array<Category | undefined> =
    categories && categories.length > 0 ? categories.slice(0, 8) : Array.from({ length: 8 });

  return (
    <Section>
      <SectionHeader title="Shop by category" href="/shop" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {displayed.map((category, index) => {
          const label = category?.name ?? FALLBACK_CATEGORIES[index % FALLBACK_CATEGORIES.length];
          return (
            <Link
              key={category?.id ?? index}
              href={category ? `/category/${category.id}` : "/shop"}
              className="group overflow-hidden rounded-lg bg-card no-underline ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
            >
              <div className="relative h-[200px] overflow-hidden bg-muted">
                {category?.image ? (
                  <Image
                    src={category.image}
                    alt={label}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className={cn("flex h-full items-end bg-gradient-to-br p-5", TONES[index % 2 === 0 ? "blue" : "teal"])}>
                    <span className="font-heading text-2xl font-semibold leading-tight">{label}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <h3 className="text-sm font-medium text-foreground">{label}</h3>
                <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}

function ProductSection({
  title,
  href,
  products,
  fallbackOffset = 0,
}: {
  title: string;
  href: string;
  products?: Product[];
  fallbackOffset?: number;
}) {
  const { isAuthenticated } = useAuth();
  const displayed =
    products && products.length > 0
      ? products.slice(0, 14)
      : Array.from<Product | undefined>({ length: 14 }).fill(undefined);

  return (
    <Section>
      <SectionHeader title={title} href={href} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
        {displayed.map((product, index) => (
          <HomeProductCard
            key={product?.id ?? `${title}-${index}`}
            product={product}
            fallbackName={FEATURED_PRODUCTS[(index + fallbackOffset) % FEATURED_PRODUCTS.length]}
            index={index + fallbackOffset}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </Section>
  );
}

function SplitFeature() {
  return (
    <Section>
      <div className="mb-4 min-h-[200px]">
        <BannerVisual
          title="Counter Ready Wholesale"
          subtitle="Fast turns, better margins, one simple cart."
          tone="dark"
          eyebrow="Why Central"
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Link href="/sale" className="group block min-h-[260px] no-underline">
          <BannerVisual title="Nicotine Disposable" subtitle="Bulk deals for approved retail buyers." tone="green" eyebrow="Deals" cta="Shop deals" />
        </Link>
        <Link href="/new" className="group block min-h-[260px] no-underline">
          <BannerVisual title="7-Hydroxymitragynine" subtitle="New stock landing weekly." tone="blue" compact />
        </Link>
      </div>
    </Section>
  );
}

export default function HomePage() {
  const { data: newProducts } = useProducts({ sort: "newest", per_page: 14 });
  const { data: trendingProducts } = useProducts({ in_stock: true, per_page: 14 });

  return (
    <div className="w-full min-w-0 overflow-x-clip bg-background">
      <HeroPromos />
      <FeaturedBrands />
      <PromoGrid />
      <Categories />
      <ProductSection title="New arrivals" href="/new" products={newProducts?.data} />
      <SplitFeature />
      <ProductSection title="Top trending" href="/shop" products={trendingProducts?.data} fallbackOffset={6} />
    </div>
  );
}
