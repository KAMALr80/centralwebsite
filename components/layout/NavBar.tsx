"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useBrands } from "@/hooks/useBrands";
import { useCategories, type Category } from "@/hooks/useCategories";

const NAV_GROUPS = [
  { label: "Apparel / Merch", keywords: ["apparel", "fashion", "merch"] },
  { label: "Hookah", keywords: ["hookah"] },
  { label: "CBD / Hemp", keywords: ["cbd", "hemp", "mushroom"] },
  { label: "Botanicals", keywords: ["kratom", "botanical", "alkaloid", "hydroxy"] },
  { label: "E-Juice / Vapes", keywords: ["juice", "nicotine", "vape", "disposable"] },
  { label: "Glass / Accessories", keywords: ["glass", "bong", "pipe"] },
  { label: "Smoking Essentials", keywords: ["rolling", "smoking", "paper", "cone"] },
  { label: "Everyday Essentials", keywords: ["clean", "storage", "misc", "incense"] },
] as const;

function matches(category: Category, keywords: readonly string[]) {
  const value = `${category.name} ${category.slug}`.toLowerCase();
  return keywords.some((keyword) => value.includes(keyword));
}
function categoryItems(category: Category) {
  return category.children && category.children.length > 0 ? category.children : [category];
}

export function NavBar() {
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  const groups = useMemo(
    () =>
      NAV_GROUPS.map((group, index) => {
        const matched = categories.filter((category) => matches(category, group.keywords));
        const fallback = categories[index] ? [categories[index]] : [];
        const roots = matched.length > 0 ? matched : fallback;
        return {
          ...group,
          items: roots.flatMap(categoryItems).slice(0, 18),
          href: roots[0] ? `/category/${roots[0].id}` : "/shop",
        };
      }),
    [categories]
  );

  const activeMobileGroup = groups.find((group) => group.label === mobileSection);

  return (
    <nav className="sticky top-0 z-40 w-full min-w-0 overflow-x-clip border-b-[3px] border-primary bg-foreground text-white shadow-md">
      <div className="mx-auto hidden w-full max-w-[1500px] min-w-0 items-stretch justify-center px-2 xl:flex">
        {groups.map((group) => (
          <div key={group.label} className="static" onMouseEnter={() => setOpenMenu(group.label)} onMouseLeave={() => setOpenMenu(null)}>
            <button type="button" onClick={() => setOpenMenu((value) => (value === group.label ? null : group.label))} onFocus={() => setOpenMenu(group.label)} className="flex h-full items-center gap-1 whitespace-nowrap border-b-[3px] border-transparent px-2.5 py-4 text-[10px] font-extrabold uppercase tracking-[0.03em] transition-colors hover:border-primary hover:bg-primary/90 2xl:px-3 2xl:text-[11px] 2xl:tracking-[0.04em]" aria-expanded={openMenu === group.label}>
              {group.label}<ChevronDown size={12} />
            </button>
            {openMenu === group.label && (
              <div className="absolute left-1/2 top-full w-[min(1120px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-md border border-t-0 border-border bg-popover text-popover-foreground shadow-xl">
                <div className="grid grid-cols-[1fr_220px]">
                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between border-b border-primary/25 pb-3">
                      <h2 className="text-sm font-black uppercase tracking-[0.12em] text-primary">{group.label}</h2>
                      <Link href={group.href} onClick={() => setOpenMenu(null)} className="text-xs font-bold text-primary hover:text-primary/80">View all</Link>
                    </div>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                      {group.items.length > 0 ? group.items.map((category) => (
                        <Link key={category.id} href={`/category/${category.id}`} onClick={() => setOpenMenu(null)} className="flex min-h-12 items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-foreground no-underline hover:bg-muted hover:text-primary">
                          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                            {category.image ? <Image src={category.image} alt="" fill sizes="36px" className="object-contain" unoptimized /> : <span className="flex h-full items-center justify-center text-xs font-black text-primary">{category.name.slice(0, 1)}</span>}
                          </span>
                          <span>{category.name}</span>
                        </Link>
                      )) : <p className="col-span-3 py-8 text-sm text-muted-foreground">Categories are loading…</p>}
                    </div>
                  </div>
                  <Link href={group.href} onClick={() => setOpenMenu(null)} className="flex flex-col justify-end bg-gradient-to-br from-muted via-background to-primary/10 p-6 no-underline">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Featured</span>
                    <span className="mt-2 text-2xl font-black uppercase leading-tight text-foreground">{group.label}</span>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase text-primary">Shop now <ChevronRight size={14} /></span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="static" onMouseEnter={() => setOpenMenu("brands")} onMouseLeave={() => setOpenMenu(null)}>
          <button type="button" onClick={() => setOpenMenu((value) => (value === "brands" ? null : "brands"))} className="flex h-full items-center gap-1 whitespace-nowrap border-b-[3px] border-transparent px-2.5 py-4 text-[10px] font-extrabold uppercase tracking-[0.03em] hover:border-primary hover:bg-primary/90 2xl:px-3 2xl:text-[11px] 2xl:tracking-[0.04em]">
            Shop By Brand <ChevronDown size={12} />
          </button>
          {openMenu === "brands" && (
            <div className="absolute left-1/2 top-full w-[min(1120px,calc(100vw-32px))] -translate-x-1/2 rounded-md border border-t-0 border-border bg-popover p-6 text-popover-foreground shadow-xl">
              <div className="mb-4 flex items-center justify-between border-b border-primary/25 pb-3">
                <h2 className="text-sm font-black uppercase tracking-[0.12em] text-primary">Shop By Brand</h2>
                <Link href="/brands" onClick={() => setOpenMenu(null)} className="text-xs font-bold text-primary">View all brands</Link>
              </div>
              <div className="grid grid-cols-6 gap-3">
                {brands.slice(0, 12).map((brand) => (
                  <Link key={brand.id} href={`/brand/${brand.id}`} onClick={() => setOpenMenu(null)} className="flex min-h-24 flex-col items-center justify-center rounded-md border border-border p-3 text-center text-xs font-bold text-foreground no-underline hover:border-primary hover:bg-background">
                    {brand.image ? <span className="relative mb-2 h-12 w-full"><Image src={brand.image} alt="" fill sizes="130px" className="object-contain" unoptimized /></span> : <span className="mb-2 text-xl font-black text-primary">{brand.name.slice(0, 2)}</span>}
                    {brand.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        <Link href="/sale" className="flex items-center whitespace-nowrap border-b-[3px] border-transparent px-2.5 py-4 text-[10px] font-black uppercase tracking-[0.03em] text-red-400 no-underline hover:border-primary hover:bg-primary/90 hover:text-white 2xl:px-3 2xl:text-[11px]">Clearance</Link>
        <Link href="/shop" className="flex items-center whitespace-nowrap border-b-[3px] border-transparent px-2.5 py-4 text-[10px] font-black uppercase tracking-[0.03em] text-white no-underline hover:border-primary hover:bg-primary/90 2xl:px-3 2xl:text-[11px]">Shop All</Link>
      </div>

      <div className="flex items-center justify-between px-4 py-3 xl:hidden">
        <Sheet open={mobileOpen} onOpenChange={(open) => { setMobileOpen(open); if (!open) setMobileSection(null); }}>
          <SheetTrigger className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider" aria-label="Open category menu">
            <Menu size={22} /> Menu
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(88vw,360px)] gap-0 p-0">
            <SheetHeader className="h-16 flex-row items-center border-b border-border px-5 py-0">
              {mobileSection ? (
                <button type="button" onClick={() => setMobileSection(null)} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">← Back</button>
              ) : (
                <SheetTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categories</SheetTitle>
              )}
            </SheetHeader>
            <div className="flex-1 overflow-y-auto py-2 text-sm">
              {activeMobileGroup ? (
                <>
                  <Link href={activeMobileGroup.href} onClick={() => setMobileOpen(false)} className="block border-b border-border px-5 py-4 font-black uppercase text-foreground no-underline">Shop all {activeMobileGroup.label}</Link>
                  {activeMobileGroup.items.map((category) => (
                    <Link key={category.id} href={`/category/${category.id}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 border-b border-border px-5 py-3 text-foreground no-underline hover:bg-muted">
                      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-muted">{category.image && <Image src={category.image} alt="" fill sizes="36px" className="object-contain" unoptimized />}</span>{category.name}
                    </Link>
                  ))}
                </>
              ) : (
                <>
                  {groups.map((group) => <button key={group.label} type="button" onClick={() => setMobileSection(group.label)} className="flex w-full items-center justify-between border-b border-border px-5 py-4 text-left font-bold uppercase tracking-wide text-foreground hover:bg-muted">{group.label}<ChevronRight size={17} className="text-muted-foreground" /></button>)}
                  <Link href="/brands" onClick={() => setMobileOpen(false)} className="flex items-center justify-between border-b border-border px-5 py-4 font-bold uppercase text-foreground no-underline hover:bg-muted">Shop By Brand<ChevronRight size={17} className="text-muted-foreground" /></Link>
                  <Link href="/sale" onClick={() => setMobileOpen(false)} className="block border-b border-border px-5 py-4 font-black uppercase text-destructive no-underline hover:bg-muted">Clearance</Link>
                  <Link href="/shop" onClick={() => setMobileOpen(false)} className="block px-5 py-4 font-black uppercase text-foreground no-underline hover:bg-muted">Shop All</Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/sale" className="text-xs font-black uppercase tracking-wider text-red-400 no-underline">Clearance</Link>
      </div>
    </nav>
  );
}
