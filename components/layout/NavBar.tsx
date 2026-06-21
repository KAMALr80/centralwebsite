"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "@/context/CartContext";
import api from "@/lib/axios";

type SearchSuggestion = {
  id: number;
  name: string;
  sku: string;
  brand?: { name: string } | null;
};

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Brands", href: "/brands" },
  { label: "New Arrivals", href: "/new" },
  { label: "Sale", href: "/sale" },
  { label: "Curated", href: "/new" },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target as Node)
      ) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length >= 3) {
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await api.get<{ data: SearchSuggestion[] }>("/products", {
            params: { search: value.trim(), per_page: 6 },
          });
          setSuggestions(res.data.data);
          setSuggestionsOpen(true);
        } catch {
          // ignore autocomplete errors
        }
      }, 300);
    } else {
      setSuggestions([]);
      setSuggestionsOpen(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      setSuggestionsOpen(false);
      router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setSuggestions([]);
      setMobileMenuOpen(false);
    }
  }

  function handleSuggestionClick() {
    setSearch("");
    setSuggestions([]);
    setSuggestionsOpen(false);
    setMobileMenuOpen(false);
  }

  function isActive(href: string) {
    if (href === "/shop") return pathname === "/shop" || pathname.startsWith("/category") || pathname.startsWith("/product");
    if (href === "/brands") return pathname === "/brands" || pathname.startsWith("/brand");
    return pathname.startsWith(href);
  }

  return (
    <nav className="bg-brand-bg border-b border-brand-line">
      {/* Main bar */}
      <div className="px-4 sm:px-6 md:px-8 py-4 md:py-5 flex items-center gap-4 md:gap-10">
        <Logo />

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                isActive(href)
                  ? "text-brand-ink border-brand-orange"
                  : "text-brand-muted border-transparent hover:text-brand-ink"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop: Search + Cart */}
        <div className="hidden md:flex ml-auto items-center gap-4">
          <div ref={desktopSearchRef} className="relative">
            <form onSubmit={handleSearch}>
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
                placeholder="Search 12,400+ products"
                className="w-80 h-[38px] pl-8 pr-3 border border-brand-line bg-brand-white text-[13px] text-brand-muted placeholder:text-brand-muted focus:outline-none focus:border-brand-blue rounded-[var(--brand-radius)]"
              />
            </form>

            {suggestionsOpen && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-brand-white border border-brand-line shadow-lg z-50 max-h-[320px] overflow-y-auto rounded-[var(--brand-radius)]">
                {suggestions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/product/${s.id}`}
                    onClick={handleSuggestionClick}
                    className="flex items-start gap-3 px-3 py-2.5 hover:bg-brand-bg-alt transition-colors border-b border-brand-line last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] text-brand-ink truncate">{s.name}</div>
                      <div className="font-mono text-[10px] text-brand-muted">
                        {s.sku}
                        {s.brand?.name ? ` · ${s.brand.name}` : ""}
                      </div>
                    </div>
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setSuggestionsOpen(false);
                    if (search.trim()) {
                      router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
                      setSearch("");
                      setSuggestions([]);
                    }
                  }}
                  className="block w-full px-3 py-2.5 text-left font-mono text-[10.5px] text-brand-blue hover:text-brand-blue-deep tracking-[0.04em] uppercase border-t border-brand-line bg-brand-bg-alt"
                >
                  See all results →
                </button>
              </div>
            )}
          </div>

          <Link
            href="/cart"
            className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.06em] uppercase text-brand-ink hover:text-brand-blue transition-colors"
          >
            {itemCount > 0 && (
              <span className="bg-brand-orange text-brand-white text-[10px] font-mono px-1.5 py-0.5 rounded-[var(--brand-radius)] leading-none">
                {itemCount}
              </span>
            )}
            <ShoppingCart size={16} />
            CART
          </Link>
        </div>

        {/* Mobile: Cart + Hamburger */}
        <div className="md:hidden ml-auto flex items-center gap-4">
          <Link
            href="/cart"
            className="relative flex items-center text-brand-ink"
            aria-label="Cart"
          >
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-orange text-brand-white text-[9px] font-mono min-w-[16px] h-4 flex items-center justify-center rounded-full leading-none px-1">
                {itemCount}
              </span>
            )}
            <ShoppingCart size={20} />
          </Link>
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="text-brand-ink"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-line bg-brand-bg">
          <div className="px-4 pt-3 pb-2">
            <form onSubmit={handleSearch} className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search products…"
                className="w-full h-[38px] pl-8 pr-3 border border-brand-line bg-brand-white text-[13px] text-brand-muted placeholder:text-brand-muted focus:outline-none focus:border-brand-blue rounded-[var(--brand-radius)]"
              />
            </form>

            {suggestionsOpen && suggestions.length > 0 && (
              <div className="mt-1 border border-brand-line bg-brand-white rounded-[var(--brand-radius)] overflow-hidden">
                {suggestions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/product/${s.id}`}
                    onClick={handleSuggestionClick}
                    className="flex items-center px-3 py-2.5 hover:bg-brand-bg-alt transition-colors border-b border-brand-line last:border-0"
                  >
                    <div>
                      <div className="text-[12.5px] text-brand-ink">{s.name}</div>
                      <div className="font-mono text-[10px] text-brand-muted">{s.sku}</div>
                    </div>
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setSuggestionsOpen(false);
                    if (search.trim()) {
                      router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
                      setSearch("");
                      setSuggestions([]);
                      setMobileMenuOpen(false);
                    }
                  }}
                  className="block w-full px-3 py-2.5 text-left font-mono text-[10.5px] text-brand-blue hover:text-brand-blue-deep tracking-[0.04em] uppercase border-t border-brand-line bg-brand-bg-alt"
                >
                  See all results →
                </button>
              </div>
            )}
          </div>
          <div className="px-4 pb-4 flex flex-col">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 text-[14px] font-medium border-b border-brand-line last:border-0 transition-colors ${
                  isActive(href) ? "text-brand-ink" : "text-brand-muted hover:text-brand-ink"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
