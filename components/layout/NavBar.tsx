"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useBrands } from "@/hooks/useBrands";
import { useCategories, type Category } from "@/hooks/useCategories";
import { useSiteConfig, type SiteSettings } from "@/context/SiteConfigContext";

type NavGroup = NonNullable<SiteSettings["nav_groups"]>[number];
type MenuItem = { id: string | number; label: string; href: string; image?: string | null };
type ResolvedGroup = NavGroup & { href: string; items: MenuItem[]; resolvedSections: { title: string; items: MenuItem[] }[] };

const FALLBACK_GROUPS: NavGroup[] = [
  { label: "Apparel / Merch", keywords: ["apparel", "merch"] },
  { label: "Hookah", keywords: ["hookah"] },
  { label: "Glass / Accessories", keywords: ["glass"] },
  { label: "Cigar / Lighter Essentials", keywords: ["cigar", "lighter", "torch"] },
  { label: "Smoking Essentials", keywords: ["smoking", "papers", "cones"] },
  { label: "Everyday Essentials", keywords: ["storage", "scented", "retail"] },
  { label: "Detox / Supplements / Health", keywords: ["detox", "health"] },
];
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function NavBar() {
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const { site } = useSiteConfig();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const navGroups = site.nav_groups?.length ? site.nav_groups : FALLBACK_GROUPS;

  const groups = useMemo<ResolvedGroup[]>(() => {
    const allCategories = categories.flatMap((category) => [category, ...(category.children ?? [])]);
    const findCategory = (label: string, url?: string) => {
      const slug = url?.match(/\/product-category\/(?:[^/]+\/)*([^/]+)\/?$/)?.[1];
      return allCategories.find((category) => (slug && category.slug === slug) || normalize(category.name) === normalize(label));
    };
    const hrefFor = (label: string, url?: string) => {
      const category = findCategory(label, url);
      if (category) return `/category/${category.id}`;
      if (url?.startsWith("/")) return url;
      return `/shop?search=${encodeURIComponent(label)}`;
    };

    return navGroups.filter((group) => group.is_active !== false).slice(0, 7).map((group, groupIndex) => {
      const resolvedSections = group.sections?.map((section, sectionIndex) => ({
        title: section.title,
        items: section.items.map((item, itemIndex) => ({ id: `${groupIndex}-${sectionIndex}-${itemIndex}`, label: item.label, href: hrefFor(item.label, item.href), image: item.img })),
      })) ?? [];
      if (resolvedSections.length) return { ...group, href: hrefFor(group.promo?.name || group.label, group.promo?.href), resolvedSections, items: resolvedSections.flatMap((section) => section.items) };

      const roots = categories.filter((category) => (group.keywords ?? []).some((keyword) => `${category.name} ${category.slug}`.toLowerCase().includes(keyword)));
      const items = (roots.length ? roots : categories.slice(groupIndex, groupIndex + 1)).flatMap((category) => category.children?.length ? category.children : [category]).map((category: Category) => ({ id: category.id, label: category.name, href: `/category/${category.id}`, image: category.image }));
      return { ...group, href: group.url || items[0]?.href || "/shop", resolvedSections: [{ title: group.label, items }], items };
    });
  }, [categories, navGroups]);

  const saleLabel = site.sale_label || "Clearance";
  const saleUrl = site.sale_url || "/sale";
  const brandTitle = site.brand_menu_title || "Shop By Brand";
  const shopAllLabel = site.shop_all_label || "Shop All";
  const ctaLabel = site.nav_cta_label || "Shop now";
  const activeMobileGroup = groups.find((group) => group.label === mobileSection);

  return (
    <nav className="sticky top-0 z-40 w-full border-b-[3px] border-primary bg-black text-white shadow-md">
      <div className="mx-auto hidden w-full max-w-[1900px] items-stretch justify-center px-2 xl:flex">
        {groups.map((group) => (
          <div key={group.label} className={group.items.length <= 6 ? "relative" : "static"} onMouseEnter={() => setOpenMenu(group.label)} onMouseLeave={() => setOpenMenu(null)}>
            <button type="button" onClick={() => setOpenMenu(openMenu === group.label ? null : group.label)} className={`flex h-full items-center gap-1 whitespace-nowrap border-b-[3px] px-3 py-4 text-[10px] font-black uppercase transition-colors 2xl:px-4 2xl:text-xs ${openMenu === group.label ? "border-white bg-primary" : "border-transparent hover:border-primary hover:bg-primary"}`} aria-expanded={openMenu === group.label}>{group.label} <ChevronDown size={12} className={`transition-transform ${openMenu === group.label ? "rotate-180" : ""}`} /></button>
            {openMenu === group.label && (
              <div className={`absolute left-1/2 top-full -translate-x-1/2 overflow-hidden rounded-b-2xl border border-t-0 border-border bg-card text-card-foreground shadow-2xl ${group.items.length <= 6 ? "w-[620px]" : group.items.length <= 12 ? "w-[min(1180px,calc(100vw-24px))]" : "w-[min(1880px,calc(100vw-24px))]"}`}>
                <div className={`grid ${group.items.length <= 6 ? "grid-cols-[1fr_250px]" : "grid-cols-[1fr_260px]"}`}>
                  <div className={`grid p-6 ${group.resolvedSections.length === 1 ? "grid-cols-1" : group.resolvedSections.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                    {group.resolvedSections.map((section) => (
                      <div key={section.title} className="border-r border-border px-4 last:border-r-0">
                        <h2 className="mb-4 border-b border-primary/60 pb-3 text-sm font-black uppercase tracking-[0.15em] text-primary">{section.title}</h2>
                        <div
                          className="grid grid-flow-col gap-x-7 gap-y-3"
                          style={{
                            gridTemplateRows: `repeat(${Math.ceil(section.items.length / (group.resolvedSections.length === 1 ? 3 : 2))}, minmax(0, 1fr))`,
                            gridAutoColumns: "minmax(0, 1fr)",
                          }}
                        >
                          {section.items.map((item) => (
                            <Link key={item.id} href={item.href} onClick={() => setOpenMenu(null)} className="group/item flex min-h-14 items-center gap-3 rounded-lg px-1 text-sm font-medium text-foreground no-underline transition-colors hover:bg-muted hover:text-primary">
                              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/50 transition-colors group-hover/item:border-primary/50">{item.image ? <Image src={item.image} alt="" fill sizes="44px" className="object-contain p-1" unoptimized /> : <span className="flex h-full items-center justify-center text-xs font-black text-primary">{item.label[0]}</span>}</span>
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href={group.href} onClick={() => setOpenMenu(null)} className="flex flex-col border-l border-border bg-muted/60 p-5 text-foreground no-underline">
                    <span className="text-center text-[10px] font-black uppercase tracking-[0.22em] text-primary">{group.promo?.tag || "Featured"}</span>
                    {group.promo?.img && <span className="relative mt-4 block aspect-[4/3] w-full overflow-hidden rounded-lg border-2 border-primary bg-card shadow-sm"><Image src={group.promo.img} alt="" fill sizes="230px" className="object-cover transition-transform duration-300 hover:scale-105" unoptimized /></span>}
                    <span className="mt-3 text-center text-xl font-black uppercase leading-tight">{group.promo?.name || group.label}</span>
                    <span className="mt-auto flex items-center justify-center gap-1 rounded-md bg-primary px-4 py-3 text-xs font-black uppercase text-primary-foreground transition-opacity hover:opacity-90">{ctaLabel} <ChevronRight size={14} /></span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
        <div className="static" onMouseEnter={() => setOpenMenu("brands")} onMouseLeave={() => setOpenMenu(null)}>
          <button type="button" onClick={() => setOpenMenu(openMenu === "brands" ? null : "brands")} className="flex h-full items-center gap-1 whitespace-nowrap px-3 py-4 text-[10px] font-black uppercase hover:bg-primary 2xl:px-4 2xl:text-xs">{brandTitle} <ChevronDown size={12} /></button>
          {openMenu === "brands" && <div className="absolute left-1/2 top-full w-[min(1120px,calc(100vw-32px))] -translate-x-1/2 rounded-b-xl bg-white p-6 text-[#18202a] shadow-xl"><div className="grid grid-cols-6 gap-3">{brands.slice(0, 12).map((brand) => <Link key={brand.id} href={`/brand/${brand.id}`} onClick={() => setOpenMenu(null)} className="flex min-h-24 flex-col items-center justify-center rounded-md border p-3 text-center text-xs font-bold no-underline hover:border-[#246697]">{brand.image && <span className="relative mb-2 h-12 w-full"><Image src={brand.image} alt="" fill sizes="130px" className="object-contain" unoptimized /></span>}{brand.name}</Link>)}</div></div>}
        </div>
        <Link href={saleUrl} className="flex items-center whitespace-nowrap px-3 py-4 text-[10px] font-black uppercase text-red-500 no-underline hover:bg-primary 2xl:px-4 2xl:text-xs">{saleLabel}</Link>
        <Link href="/shop" className="flex items-center whitespace-nowrap px-3 py-4 text-[10px] font-black uppercase text-white no-underline hover:bg-primary 2xl:px-4 2xl:text-xs">{shopAllLabel}</Link>
      </div>

      <div className="flex items-center justify-between px-4 py-3 xl:hidden">
        <Sheet open={mobileOpen} onOpenChange={(open) => { setMobileOpen(open); if (!open) setMobileSection(null); }}>
          <SheetTrigger className="inline-flex items-center gap-2 text-sm font-black uppercase"><Menu size={22} /> Menu</SheetTrigger>
          <SheetContent side="left" className="w-[min(90vw,380px)] gap-0 p-0">
            <SheetHeader className="h-16 flex-row items-center border-b px-5 py-0">{mobileSection ? <button type="button" onClick={() => setMobileSection(null)} className="text-xs font-bold uppercase">← Back</button> : <SheetTitle className="text-xs font-bold uppercase">Categories</SheetTitle>}</SheetHeader>
            <div className="flex-1 overflow-y-auto py-2 text-sm">
              {activeMobileGroup ? activeMobileGroup.resolvedSections.map((section) => <div key={section.title}><h3 className="bg-muted px-5 py-2 text-xs font-black uppercase text-[#246697]">{section.title}</h3>{section.items.map((item) => <Link key={item.id} href={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 border-b px-5 py-3 text-foreground no-underline">{item.image && <span className="relative h-9 w-9"><Image src={item.image} alt="" fill sizes="36px" className="object-contain" unoptimized /></span>}{item.label}</Link>)}</div>) : <>{groups.map((group) => <button key={group.label} type="button" onClick={() => setMobileSection(group.label)} className="flex w-full items-center justify-between border-b px-5 py-4 text-left font-bold uppercase text-foreground">{group.label}<ChevronRight size={17} /></button>)}<Link href="/brands" className="block border-b px-5 py-4 font-bold uppercase text-foreground no-underline">{brandTitle}</Link><Link href={saleUrl} className="block border-b px-5 py-4 font-black uppercase text-red-600 no-underline">{saleLabel}</Link><Link href="/shop" className="block px-5 py-4 font-black uppercase text-foreground no-underline">{shopAllLabel}</Link></>}
            </div>
          </SheetContent>
        </Sheet>
        <Link href={saleUrl} className="text-xs font-black uppercase text-red-300 no-underline">{saleLabel}</Link>
      </div>
    </nav>
  );
}
