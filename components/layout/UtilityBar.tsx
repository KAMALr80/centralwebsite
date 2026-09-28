"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Heart, Mail, Phone, Search, ShoppingCart, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UserAccountMenu } from "./UserAccountMenu";
import { Logo } from "./Logo";

export function UtilityBar() {
  const { isAuthenticated, user } = useAuth();
  const { itemCount, subtotal } = useCart();
  const router = useRouter();
  const [search, setSearch] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = search.trim();
    if (!value) return;
    router.push(`/shop?search=${encodeURIComponent(value)}`);
    setSearch("");
  }

  if (!isAuthenticated) {
    return (
      <header className="border-t-[3px] border-primary bg-background">
        <div className="mx-auto flex min-h-[76px] max-w-[1500px] items-center gap-5 px-4 py-3 lg:px-10">
          <Logo size={70} />

          <div className="mx-auto hidden items-center gap-6 text-[12px] text-muted-foreground lg:flex">
            <a href="tel:+19145395580" className="inline-flex items-center gap-2 text-muted-foreground no-underline hover:text-primary">
              <Phone size={14} /> +1 (914) 539-5580
            </a>
            <a href="mailto:info@centralsmokedistro.com" className="hidden items-center gap-2 text-muted-foreground no-underline hover:text-primary xl:inline-flex">
              <Mail size={15} /> info@centralsmokedistro.com
            </a>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2.5">
            <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "h-10 px-5 no-underline")}>
              <UserRound /> Login
            </Link>
            <Link href="/register" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "hidden h-10 px-5 no-underline sm:inline-flex")}>
              Register for Wholesale
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-background">
      <div className="border-b border-border bg-muted px-4 py-2 text-[11px] text-muted-foreground lg:px-10">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <a href="tel:+19145395580" className="inline-flex items-center gap-1.5 text-muted-foreground no-underline hover:text-primary">
              <Phone size={12} /> +1 (914) 539-5580
            </a>
            <a href="mailto:info@centralsmokedistro.com" className="hidden items-center gap-1.5 text-muted-foreground no-underline hover:text-primary sm:inline-flex">
              <Mail size={13} /> info@centralsmokedistro.com
            </a>
          </div>
          {isAuthenticated ? (
            <nav className="hidden items-center gap-4 md:flex" aria-label="Account shortcuts">
              <span className="font-semibold text-foreground">Welcome, {user?.name}</span>
              <Link href="/orders" className="text-muted-foreground no-underline hover:text-primary">Orders</Link>
              <Link href="/account/addresses" className="text-muted-foreground no-underline hover:text-primary">Addresses</Link>
              <Link href="/account/profile" className="text-muted-foreground no-underline hover:text-primary">Account details</Link>
            </nav>
          ) : (
            <span className="hidden font-semibold uppercase tracking-[0.08em] sm:block">Wholesale accounts only</span>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-4 px-4 py-5 lg:flex-nowrap lg:gap-8 lg:px-10">
        <Logo size={82} />
        {isAuthenticated && (
          <form onSubmit={handleSearch} className="order-3 flex w-full gap-2 lg:order-none lg:mx-auto lg:max-w-[720px]">
            <label htmlFor="site-search" className="sr-only">Search products, brands, or categories</label>
            <Input id="site-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for products, brands or categories" className="h-11 flex-1 px-4 md:text-sm" />
            <Button type="submit" size="icon-lg" className="size-11" aria-label="Search"><Search className="size-5" /></Button>
          </form>
        )}

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/wishlist" className="hidden min-h-12 flex-col items-center justify-center gap-1 rounded-md px-3 text-[10px] font-bold uppercase text-muted-foreground no-underline transition-colors hover:bg-primary/10 hover:text-primary sm:flex"><Heart size={21} /><span>Wishlist</span></Link>
              <div className="rounded-md border border-foreground bg-foreground px-3 py-2.5 shadow-sm transition-colors hover:bg-primary/90"><UserAccountMenu /></div>
            </>
          ) : (
            <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "h-10 px-4 no-underline")}><UserRound /> Login</Link>
          )}
          {isAuthenticated && (
            <Link href="/cart" className="group relative flex min-h-12 items-center gap-3 rounded-md border border-border bg-muted px-3 text-foreground no-underline shadow-sm transition-all hover:border-primary hover:bg-background" aria-label={`${itemCount} items in cart`}>
              <span className="relative transition-colors group-hover:text-primary"><ShoppingCart size={26} />{itemCount > 0 && <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground">{itemCount}</span>}</span>
              <span className="hidden flex-col sm:flex"><span className="text-[10px] font-bold uppercase text-muted-foreground">Cart</span><span className="text-sm font-black text-foreground">${subtotal.toFixed(2)}</span></span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
