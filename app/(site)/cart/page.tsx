"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingCart, ImageIcon, ArrowRight, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/components/auth/withAuth";
import { QtyStepper } from "@/components/shared/QtyStepper";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const TH = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

export default function CartPage() {
  const { isLoading, isAuthenticated } = useRequireAuth();
  const { isApproved } = useAuth();
  const { items, itemCount, subtotal, updateQty, removeItem, refreshPrices } =
    useCart();
  const [pricesRefreshing, setPricesRefreshing] = useState(false);
  const attemptedPriceRefresh = useRef(false);
  const hasPendingPrices = items.some((item) => item.price_pending);

  useEffect(() => {
    if (
      !isAuthenticated ||
      !hasPendingPrices ||
      attemptedPriceRefresh.current
    ) {
      return;
    }

    attemptedPriceRefresh.current = true;
    setPricesRefreshing(true);
    refreshPrices().finally(() => setPricesRefreshing(false));
  }, [hasPendingPrices, isAuthenticated, refreshPrices]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  // Group items: if parent_id is set, group under the parent; otherwise standalone
  type Group = {
    parentId: number | null | undefined;
    parentName: string | null | undefined;
    items: typeof items;
  };

  const groupMap = new Map<string, Group>();

  items.forEach((item) => {
    const key = item.parent_id ? String(item.parent_id) : `simple-${item.product_id}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        parentId: item.parent_id ?? item.product_id,
        parentName: item.parent_name ?? item.name,
        items: [],
      });
    }
    groupMap.get(key)!.items.push(item);
  });

  const groups = Array.from(groupMap.values());

  const totalVariants = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalProducts = groups.length;

  const subtotalLabel = hasPendingPrices
    ? pricesRefreshing
      ? "Updating…"
      : "Price unavailable"
    : `$${subtotal.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="border-b border-border bg-card px-4 py-6 sm:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-semibold leading-none text-foreground">
              Cart · draft P.O.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {itemCount > 0
                ? `${totalProducts} product${totalProducts !== 1 ? "s" : ""} · ${totalVariants} line${totalVariants !== 1 ? "s" : ""}`
                : "Your cart is empty"}
            </p>
          </div>
          <StepIndicator step={1} />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex h-72 flex-col items-center justify-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No items in your cart yet.</p>
          <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "h-9 px-4 no-underline")}>
            Browse products <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
      ) : (
        <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-6 px-4 py-6 sm:px-8 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-4">
            {groups.map((group) => {
              const groupHasPendingPrices = group.items.some(
                (item) => item.price_pending
              );
              const groupTotal = group.items.reduce(
                (sum, i) => sum + i.price * i.quantity,
                0
              );
              const firstItem = group.items[0];
              const productId = group.parentId ?? firstItem.product_id;
              const productName = group.parentName ?? firstItem.name;

              return (
                <Card key={String(productId)} className="gap-0 py-0">
                  <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      {firstItem.image ? (
                        <Image
                          src={firstItem.image}
                          alt={productName ?? ""}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                          <ImageIcon className="size-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${productId}`}
                        className="block truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {productName}
                      </Link>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {group.items.length} line{group.items.length !== 1 ? "s" : ""}
                        {" · "}
                        <span className="font-mono font-medium text-foreground">
                          {groupHasPendingPrices
                            ? pricesRefreshing
                              ? "Updating…"
                              : "Price unavailable"
                            : `$${groupTotal.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Link
                        href={`/product/${productId}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "no-underline")}
                      >
                        <Plus data-icon="inline-start" /> Add variant
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => group.items.forEach((i) => removeItem(i.product_id))}
                      >
                        <Trash2 data-icon="inline-start" /> Remove
                      </Button>
                    </div>
                  </div>

                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className={cn(TH, "pl-4")}>SKU</TableHead>
                        <TableHead className={TH}>Variant</TableHead>
                        <TableHead className={cn(TH, "text-right")}>Unit price</TableHead>
                        <TableHead className={cn(TH, "text-right")}>Qty</TableHead>
                        <TableHead className={cn(TH, "text-right")}>Line total</TableHead>
                        <TableHead className="w-10 pr-4" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.items.map((item) => (
                        <TableRow key={item.product_id} className="text-[12.5px]">
                          <TableCell className="w-28 pl-4 font-mono text-[11px] text-muted-foreground">
                            {item.sku}
                          </TableCell>
                          <TableCell className="whitespace-normal text-foreground">{item.name}</TableCell>
                          <TableCell className="text-right font-mono">
                            {item.price_pending
                              ? pricesRefreshing
                                ? "Updating…"
                                : "Unavailable"
                              : `$${item.price.toFixed(2)}`}
                          </TableCell>
                          <TableCell className="text-right">
                            <QtyStepper
                              value={item.quantity}
                              onChange={(n) => updateQty(item.product_id, n)}
                            />
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {item.price_pending
                              ? "—"
                              : `$${(item.price * item.quantity).toFixed(2)}`}
                          </TableCell>
                          <TableCell className="w-10 pr-4 text-center">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeItem(item.product_id)}
                              className="text-muted-foreground hover:text-destructive"
                              aria-label="Remove item"
                            >
                              <X />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              );
            })}
          </div>

          <Card className="w-full shrink-0 lg:sticky lg:top-20 lg:w-[320px]">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono font-medium text-foreground">{subtotalLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">TBD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-muted-foreground">Net of tax</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold text-foreground">
                <span>Total</span>
                <span className="font-mono">{subtotalLabel}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3">
              {isApproved && !hasPendingPrices ? (
                <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "h-10 w-full text-sm no-underline")}>
                  Continue to checkout <ArrowRight data-icon="inline-end" />
                </Link>
              ) : hasPendingPrices ? (
                <div className="rounded-lg bg-muted px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    {pricesRefreshing
                      ? "Updating wholesale prices…"
                      : "Some prices are unavailable"}
                  </p>
                  {!pricesRefreshing && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setPricesRefreshing(true);
                        refreshPrices().finally(() => setPricesRefreshing(false));
                      }}
                    >
                      Retry prices
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-lg bg-muted px-4 py-3 text-center">
                  <p className="text-xs font-medium text-foreground">Account pending approval</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    You&apos;ll be notified when your account is approved.
                  </p>
                </div>
              )}

              <Link href="/shop" className={cn(buttonVariants({ variant: "ghost" }), "no-underline")}>
                <ChevronLeft data-icon="inline-start" /> Continue shopping
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
