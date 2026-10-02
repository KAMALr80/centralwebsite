"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, FileText, ImageIcon, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSiteConfig, type HomepageItem, type HomepageSection } from "@/context/SiteConfigContext";
import { useBrands } from "@/hooks/useBrands";
import { useCategories } from "@/hooks/useCategories";
import { useProducts, type Product } from "@/hooks/useProducts";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function SectionHeader({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  const { site } = useSiteConfig();
  const label = linkLabel ?? site.view_all_label ?? "View all";
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h2>
      {href && (
        <Link href={href} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground no-underline")}>
          {label} <ArrowRight data-icon="inline-end" />
        </Link>
      )}
    </div>
  );
}

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("mx-auto w-full max-w-[1500px] px-4 py-5 md:px-8 md:py-7", className)}>{children}</section>;
}

/** Renders the uploaded heading banner (image and/or promo video); null when the section has none. */
function HeadingBanner({ section }: { section: HomepageSection }) {
  const heading = section.items.find((item) => item.kind === "heading" && (item.desktop_image_url || item.video_url));
  if (!heading) return null;

  const image = heading.desktop_image_url ? <ResponsiveImage item={heading} className="block h-auto w-full" /> : null;
  const video = heading.video_url ? (
    <video
      ref={(el) => {
        if (!el) return;
        el.muted = true;
        el.play().catch(() => undefined);
      }}
      src={heading.video_url}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-label={section.title}
      className="block h-auto w-full"
    />
  ) : null;

  return (
    <div className="mb-4">
      {image && (
        <div className="relative overflow-hidden rounded-lg bg-muted">
          {heading.link_url ? <Link href={heading.link_url} aria-label={section.title} className="block">{image}</Link> : image}
          <h2 className="sr-only">{section.title}</h2>
        </div>
      )}
      {video && (
        <div className={cn("relative overflow-hidden rounded-lg bg-muted", image && "mt-3")}>
          {heading.link_url ? <Link href={heading.link_url} aria-label={section.title} className="block">{video}</Link> : video}
          {!image && <h2 className="sr-only">{section.title}</h2>}
        </div>
      )}
    </div>
  );
}

/** Uses the uploaded heading banner when present, otherwise a text heading. */
function ManagedHeader({ section, href, linkLabel }: { section: HomepageSection; href?: string; linkLabel?: string }) {
  const hasHeading = section.items.some((item) => item.kind === "heading" && (item.desktop_image_url || item.video_url));
  if (!hasHeading) return <SectionHeader title={section.title} href={href} linkLabel={linkLabel} />;
  return <HeadingBanner section={section} />;
}

function ResponsiveImage({ item, className, eager = false }: { item: HomepageItem; className?: string; eager?: boolean }) {
  return (
    <picture>
      {item.mobile_image_url && <source media="(max-width: 640px)" srcSet={item.mobile_image_url} />}
      <img src={item.desktop_image_url} alt={item.alt_text || item.title || ""} loading={eager ? "eager" : "lazy"} className={className} />
    </picture>
  );
}

function MaybeLink({ href, label, className, children }: { href: string | null; label?: string; className?: string; children: React.ReactNode }) {
  if (!href) return <div className={className}>{children}</div>;
  return <Link href={href} aria-label={label} className={cn("no-underline", className)}>{children}</Link>;
}

function heroSlides(section: HomepageSection) {
  return section.items.filter((item) => item.kind === "slide" && item.desktop_image_url);
}

function HeroSlider({ section, className }: { section: HomepageSection; className: string }) {
  const slides = heroSlides(section);
  const [active, setActive] = useState(0);
  const interval = typeof section.settings.interval_ms === "number" ? section.settings.interval_ms : 5000;

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), interval);
    return () => window.clearInterval(timer);
  }, [slides.length, interval]);

  if (slides.length === 0) return null;
  const move = (direction: number) => setActive((value) => (value + direction + slides.length) % slides.length);

  return (
      <div className={cn("group/hero relative overflow-hidden rounded-xl bg-muted", className)} aria-label={section.title}>
        {slides.map((slide, index) => (
          <MaybeLink
            key={slide.id}
            href={slide.link_url}
            label={slide.alt_text || slide.title || undefined}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              active === index ? "z-10 opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <ResponsiveImage item={slide} eager={index === 0} className="absolute inset-0 h-full w-full object-cover" />
          </MaybeLink>
        ))}
        {slides.length > 1 && (
          <>
            <Button type="button" size="icon-lg" variant="secondary" onClick={() => move(-1)} aria-label="Previous slide" className="absolute left-3 top-1/2 z-20 -translate-y-1/2 bg-background/80 opacity-0 backdrop-blur transition-opacity focus-visible:opacity-100 group-hover/hero:opacity-100">
              <ChevronLeft />
            </Button>
            <Button type="button" size="icon-lg" variant="secondary" onClick={() => move(1)} aria-label="Next slide" className="absolute right-3 top-1/2 z-20 -translate-y-1/2 bg-background/80 opacity-0 backdrop-blur transition-opacity focus-visible:opacity-100 group-hover/hero:opacity-100">
              <ChevronRight />
            </Button>
            <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-1.5">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={index === active ? "true" : undefined}
                  className={cn("h-1.5 rounded-full transition-all", index === active ? "w-6 bg-primary" : "w-1.5 bg-background/70")}
                />
              ))}
            </div>
          </>
        )}
      </div>
  );
}

/** A hero directly followed by another hero renders as main slider (2/3) + side slider (1/3). */
function HeroRow({ main, side }: { main: HomepageSection; side?: HomepageSection }) {
  const hasMain = heroSlides(main).length > 0;
  const hasSide = side ? heroSlides(side).length > 0 : false;
  if (!hasMain && !hasSide) return null;

  if (hasMain && hasSide && side) {
    return (
      <Section className="pt-6 md:pt-8">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <HeroSlider section={main} className="aspect-[1041/396]" />
          <HeroSlider section={side} className="aspect-[450/347] lg:aspect-auto lg:h-full" />
        </div>
      </Section>
    );
  }

  return (
    <Section className="pt-6 md:pt-8">
      <HeroSlider section={hasMain ? main : side!} className="aspect-[1041/396]" />
    </Section>
  );
}

function BannerGrid({ items }: { items: HomepageItem[] }) {
  if (items.length === 0) return null;
  const gridColsClass =
    items.length <= 2 ? "lg:grid-cols-[2fr_1fr]" : items.length === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4";
  return (
    <div className={cn("grid gap-4", gridColsClass)}>
      {items.map((item) => (
        <MaybeLink key={item.id} href={item.link_url} label={item.alt_text || item.title || undefined} className="group block overflow-hidden rounded-xl bg-muted">
          <ResponsiveImage item={item} className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]" />
        </MaybeLink>
      ))}
    </div>
  );
}

function ManagedBanners({ section, compressTop, compressBottom }: { section: HomepageSection; compressTop?: boolean; compressBottom?: boolean }) {
  const banners = section.items.filter((item) => item.kind === "content" && item.desktop_image_url);
  const hasHeading = section.items.some((item) => item.kind === "heading" && (item.desktop_image_url || item.video_url));
  if (banners.length === 0 && !hasHeading) return null;
  return (
    <Section className={cn("py-3 md:py-4", compressTop && "pt-0 md:pt-0", compressBottom && "pb-0 md:pb-0")}>
      <HeadingBanner section={section} />
      <BannerGrid items={banners} />
    </Section>
  );
}

function LiveCategories({ title }: { title: string }) {
  const { data: categories } = useCategories();
  if (!categories?.length) return null;
  return (
    <Section>
      <SectionHeader title={title} href="/shop" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.slice(0, 8).map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.id}`}
            className="group overflow-hidden rounded-lg bg-card no-underline ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
          >
            <div className="relative h-[200px] overflow-hidden bg-muted">
              {category.image ? (
                <Image src={category.image} alt={category.name} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
              ) : (
                <div className="flex h-full items-end bg-gradient-to-br from-chart-4 via-chart-3 to-chart-1 p-5 text-primary-foreground">
                  <span className="font-heading text-2xl font-semibold leading-tight">{category.name}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-sm font-medium text-foreground">{category.name}</h3>
              <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

function CategoryGrid({ section }: { section: HomepageSection }) {
  const tiles = section.items.filter((item) => item.kind === "content" && item.desktop_image_url);
  if (tiles.length === 0) return <LiveCategories title={section.title} />;

  // A short list of brand/promo banners reads best as bare, wide tiles with a hover-grow effect.
  // Larger category grids keep the labeled card treatment so plain photos stay identifiable.
  const isBannerStyle = tiles.length <= 4;

  return (
    <Section>
      <ManagedHeader section={section} href="/shop" />
      <div className={cn("grid gap-4", isBannerStyle ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6")}>
        {tiles.map((tile) =>
          isBannerStyle ? (
            <MaybeLink
              key={tile.id}
              href={tile.link_url}
              label={tile.title || tile.alt_text || undefined}
              className="group block overflow-hidden rounded-lg bg-muted"
            >
              <ResponsiveImage
                item={tile}
                className="aspect-[394/227] h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </MaybeLink>
          ) : (
            <MaybeLink
              key={tile.id}
              href={tile.link_url}
              label={tile.title || tile.alt_text || undefined}
              className="group flex flex-col overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <ResponsiveImage item={tile} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              {tile.title && (
                <div className="flex items-center justify-between px-3 py-2.5">
                  <h3 className="line-clamp-1 text-sm font-medium text-foreground">{tile.title}</h3>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              )}
            </MaybeLink>
          ),
        )}
      </div>
    </Section>
  );
}

function HomeProductCard({ product, isAuthenticated }: { product: Product; isAuthenticated: boolean }) {
  const { addItem } = useCart();
  const { site } = useSiteConfig();
  const image = product.image ?? product.images?.find((img) => img.is_primary)?.url;
  const href = `/product/${product.id}`;
  const soldOut = !product.in_stock;
  const price = product.current_price ?? product.sale_price ?? product.regular_price ?? null;
  const regularPrice = product.on_sale && product.regular_price && product.sale_price ? product.regular_price : null;
  const canAdd = Boolean(product.type === "simple" && !soldOut && price !== null && isAuthenticated);
  const currency = site.currency_code || "USD";
  const soldOutLabel = site.sold_out_label || "Sold out";
  const loginToBuyLabel = site.login_to_buy_label || "Login to buy";
  const wholesaleLabel = site.wholesale_label || "Wholesale";
  const priceUnavailableLabel = site.price_unavailable_label || "Price N/A";

  function handleAddToCart() {
    if (price === null) return;
    addItem({ product_id: product.id, name: product.name, sku: product.sku, image: image ?? null, price, parent_id: product.parent_id }, 1);
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md hover:ring-primary/30">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-muted" aria-label={`View ${product.name}`}>
        {image ? (
          <Image src={image} alt={product.name} fill sizes="(max-width: 768px) 50vw, 15vw" className="object-contain p-3 transition-transform duration-300 group-hover:scale-105" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/40">
            <ImageIcon className="size-10" />
          </div>
        )}
        {soldOut && (
          <div className="absolute left-2 top-2">
            <Badge variant="destructive" className="bg-background/90 font-mono">{soldOutLabel}</Badge>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <span className="line-clamp-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{product.category?.name ?? wholesaleLabel}</span>
        <Link href={href} className="mt-1 no-underline">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5 text-foreground transition-colors group-hover:text-primary">{product.name}</h3>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          {!isAuthenticated ? (
            <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full no-underline")}>
              {loginToBuyLabel}
            </Link>
          ) : (
            <>
              <span className="flex flex-col">
                <span className="font-mono text-[10px] font-medium uppercase tracking-wide text-primary">{wholesaleLabel}</span>
                <span className="font-mono text-lg font-semibold leading-tight text-foreground">{price !== null ? formatPrice(price, currency) : priceUnavailableLabel}</span>
                {regularPrice && <span className="font-mono text-[11px] leading-tight text-muted-foreground line-through">{formatPrice(regularPrice, currency)}</span>}
              </span>
              {canAdd ? (
                <Button type="button" size="icon-lg" onClick={handleAddToCart} aria-label={`Add ${product.name} to cart`} title="Add to cart">
                  <ShoppingCart />
                </Button>
              ) : (
                <Link href={href} className={cn(buttonVariants({ variant: "secondary", size: "icon-lg" }), "no-underline")} aria-label={`View ${product.name}`} title="View product">
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

// Columns per breakpoint for product grids; must match the grid-cols classes in ProductRows.
const PRODUCT_COLUMNS = { base: 2, md: 3, lg: 5, xl: 7 } as const;

/** Hides the trailing products that would leave a half-empty last row at each breakpoint. */
function fullRowsClass(index: number, total: number) {
  const visible = (columns: number) => (total < columns ? total : Math.floor(total / columns) * columns);
  return cn(
    index < visible(PRODUCT_COLUMNS.base) ? "block" : "hidden",
    index < visible(PRODUCT_COLUMNS.md) ? "md:block" : "md:hidden",
    index < visible(PRODUCT_COLUMNS.lg) ? "lg:block" : "lg:hidden",
    index < visible(PRODUCT_COLUMNS.xl) ? "xl:block" : "xl:hidden",
  );
}

function ProductRows({ products, isAuthenticated, keyPrefix = "" }: { products: Product[]; isAuthenticated: boolean; keyPrefix?: string }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
      {products.map((product, index) => (
        <div key={`${keyPrefix}${product.id}`} className={fullRowsClass(index, products.length)}>
          <HomeProductCard product={product} isAuthenticated={isAuthenticated} />
        </div>
      ))}
    </div>
  );
}

function ProductGridSection({ section, products }: { section: HomepageSection; products: Product[] }) {
  const { isAuthenticated } = useAuth();
  const promos = section.items.filter((item) => item.kind === "content" && item.desktop_image_url).slice(0, 2);
  if (products.length === 0 && promos.length === 0) return null;
  return (
    <Section>
      <ManagedHeader section={section} href="/shop" />
      {products.length > 0 && <ProductRows products={products} isAuthenticated={isAuthenticated} keyPrefix={`${section.id}-`} />}
      {promos.length > 0 && <div className="mt-4"><BannerGrid items={promos} /></div>}
    </Section>
  );
}

function LiveBrands({ title }: { title: string }) {
  const { data: brands } = useBrands();
  const { site } = useSiteConfig();
  if (!brands?.length) return null;
  return (
    <Section>
      <SectionHeader title={title} href="/brands" linkLabel={site.all_brands_label || "All brands"} />
      <div className="grid grid-cols-2 gap-6 rounded-xl bg-card px-6 py-8 ring-1 ring-foreground/10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {brands.slice(0, 7).map((brand) => (
          <Link key={brand.id} href={`/brand/${brand.id}`} className="group flex min-w-0 flex-col items-center gap-3 text-center no-underline">
            <div className="relative size-24 overflow-hidden rounded-full bg-card shadow-sm ring-1 ring-foreground/10 transition-shadow group-hover:shadow-md group-hover:ring-primary/40 md:size-28">
              {brand.image ? (
                <Image src={brand.image} alt={brand.name} fill sizes="112px" className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="font-heading text-2xl font-semibold uppercase text-muted-foreground">{brand.name.slice(0, 2)}</span>
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">{brand.name}</span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

function BrandShowcase({ section }: { section: HomepageSection }) {
  const { site } = useSiteConfig();
  const logos = section.items.filter((item) => item.kind === "brand" && (item.video_url || item.desktop_image_url)).slice(0, 7);
  if (logos.length === 0) return <LiveBrands title={section.title} />;
  return (
    <Section>
      <ManagedHeader section={section} href="/brands" linkLabel={site.all_brands_label || "All brands"} />
      <div className="hidden justify-center gap-6 rounded-xl bg-card px-6 py-8 lg:flex">
        {logos.map((logo) => (
          <MaybeLink
            key={logo.id}
            href={logo.link_url}
            label={logo.alt_text || logo.title || undefined}
            className="group flex flex-col items-center gap-3 text-center no-underline lg:w-[calc((100%-9rem)/7)]"
          >
            <span className="relative block size-24 overflow-hidden rounded-full bg-muted shadow-sm transition-shadow group-hover:shadow-md group-hover:ring-1 group-hover:ring-primary/40 md:size-28">
              {logo.video_url ? (
                <video src={logo.video_url} autoPlay loop muted playsInline preload="metadata" className="h-full w-full object-cover" aria-label={logo.alt_text || logo.title || undefined} />
              ) : (
                <ResponsiveImage item={logo} className="h-full w-full object-cover" />
              )}
            </span>
            <span className="text-sm font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
              {logo.title}
            </span>
          </MaybeLink>
        ))}
      </div>
    </Section>
  );
}

function CatalogShowcase({ section }: { section: HomepageSection }) {
  const catalogs = section.items.filter((item) => item.kind === "catalog" && item.desktop_image_url && item.pdf_url);
  if (catalogs.length === 0) return null;
  const eyebrow = typeof section.settings.eyebrow === "string" ? section.settings.eyebrow : null;
  const description = typeof section.settings.description === "string" ? section.settings.description : null;
  return (
    <Section>
      <div className="grid items-center gap-8 rounded-xl bg-foreground px-6 py-10 text-background md:px-10 lg:grid-cols-[1fr_2fr]">
        <div>
          {eyebrow && <Badge variant="secondary" className="mb-4 bg-background/15 text-inherit">{eyebrow}</Badge>}
          <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">{section.title}</h2>
          {description && <p className="mt-4 max-w-md text-sm leading-6 opacity-80">{description}</p>}
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {catalogs.map((catalog) => (
            <a
              key={catalog.id}
              href={catalog.pdf_url ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-lg bg-background text-foreground no-underline shadow-lg transition-transform hover:-translate-y-1"
            >
              <div className="aspect-[210/297] overflow-hidden bg-muted">
                <ResponsiveImage item={catalog} className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium">
                <FileText className="size-4 shrink-0 text-primary" />
                <span className="line-clamp-1">{catalog.title || catalog.alt_text || "Catalog"}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}

function ManagedSection({
  section,
  products,
  compressTop,
  compressBottom,
}: {
  section: HomepageSection;
  products: Map<number, Product>;
  compressTop?: boolean;
  compressBottom?: boolean;
}) {
  switch (section.type) {
    case "hero":
      return <HeroRow main={section} />;
    case "banner":
      return <ManagedBanners section={section} compressTop={compressTop} compressBottom={compressBottom} />;
    case "featured_category":
      return <CategoryGrid section={section} />;
    case "product_carousel": {
      const limit = typeof section.settings.limit === "number" ? section.settings.limit : 14;
      const selected = (section.data?.product_ids ?? [])
        .map((id) => products.get(id))
        .filter((product): product is Product => Boolean(product))
        .slice(0, limit);
      return <ProductGridSection section={section} products={selected} />;
    }
    case "brand_showcase":
      return <BrandShowcase section={section} />;
    case "catalog_showcase":
      return <CatalogShowcase section={section} />;
    default:
      return null;
  }
}

/** Shown when the homepage CMS cannot be reached, so the storefront still lists live catalogue data. */
function LiveFallback() {
  const { isAuthenticated } = useAuth();
  const { site } = useSiteConfig();
  const { data: newest } = useProducts({ sort: "newest", per_page: 14 });
  return (
    <>
      <LiveCategories title={site.shop_by_category_title || "Shop by category"} />
      <LiveBrands title={site.featured_brands_title || "Featured brands"} />
      {newest?.data?.length ? (
        <Section>
          <SectionHeader title={site.new_arrivals_title || "New arrivals"} href="/new" />
          <ProductRows products={newest.data} isAuthenticated={isAuthenticated} />
        </Section>
      ) : null}
    </>
  );
}

export default function HomePage() {
  const { homepage, site, loaded, error } = useSiteConfig();
  const sections = useMemo(() => homepage?.sections ?? [], [homepage]);
  const rows = useMemo(() => {
    const result: [HomepageSection, HomepageSection?, boolean?, boolean?][] = [];
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].type === "hero" && sections[i + 1]?.type === "hero") {
        result.push([sections[i], sections[i + 1]]);
        i++;
      } else {
        const isBanner = sections[i].type === "banner";
        const compressTop = isBanner && sections[i - 1]?.type === "banner";
        const compressBottom = isBanner && sections[i + 1]?.type === "banner";
        result.push([sections[i], undefined, compressTop, compressBottom]);
      }
    }
    return result;
  }, [sections]);
  const productIds = useMemo(
    () => Array.from(new Set(sections.flatMap((section) => (section.type === "product_carousel" ? section.data?.product_ids ?? [] : [])))),
    [sections]
  );
  const { data } = useProducts({ ids: productIds, per_page: Math.max(productIds.length, 1) });
  const productsById = useMemo(() => new Map((productIds.length ? data?.data ?? [] : []).map((product) => [product.id, product])), [data, productIds.length]);

  return (
    <div className="w-full min-w-0 overflow-x-clip bg-background">
      {site.homepage_heading && <h1 className="sr-only">{site.homepage_heading}</h1>}
      {!loaded && (
        <Section className="pt-6 md:pt-8">
          <div className="aspect-[1920/622] min-h-[210px] animate-pulse rounded-xl bg-muted" aria-label="Loading homepage" />
        </Section>
      )}
      {loaded && (error || !homepage) && <LiveFallback />}
      {rows.map(([section, side, compressTop, compressBottom]) =>
        side ? (
          <HeroRow key={section.id} main={section} side={side} />
        ) : (
          <ManagedSection key={section.id} section={section} products={productsById} compressTop={compressTop} compressBottom={compressBottom} />
        )
      )}
    </div>
  );
}
