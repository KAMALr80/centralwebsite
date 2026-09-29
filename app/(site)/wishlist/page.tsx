"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, ImageIcon, X } from "lucide-react";
import { useRequireAuth } from "@/components/auth/withAuth";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { StockDot } from "@/components/shared/StockDot";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

const TH = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

function WishlistTable() {
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth();
  const { data: items, isLoading, isError, refetch } = useWishlist();
  const { toggle, isPending } = useToggleWishlist();

  if (authLoading || !isAuthenticated || isLoading) {
    return (
      <Card className="gap-0 py-0">
        <Table>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 5 }).map((__, j) => (
                  <TableCell key={j} className="px-4 py-3">
                    <Skeleton className="h-4" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="items-center py-12 text-center">
        <p className="text-sm text-muted-foreground">Your wishlist could not be loaded.</p>
        <Button type="button" onClick={() => refetch()}>Try again</Button>
      </Card>
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <Card className="items-center py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Heart className="size-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Your wishlist is empty.</p>
        <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "h-9 px-4 no-underline")}>
          Browse products
        </Link>
      </Card>
    );
  }

  return (
    <Card className="gap-0 py-0">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-14 pl-4" />
            <TableHead className={TH}>Product</TableHead>
            <TableHead className={TH}>SKU</TableHead>
            <TableHead className={TH}>Stock</TableHead>
            <TableHead className={TH}>Added</TableHead>
            <TableHead className={TH}>Price</TableHead>
            <TableHead className="w-10 pr-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="text-[12.5px]">
              <TableCell className="py-3 pl-4">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                      <ImageIcon className="size-4" />
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell className="whitespace-normal">
                <Link
                  href={`/product/${item.product_id}`}
                  className="font-medium text-foreground transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
              </TableCell>

              <TableCell className="font-mono text-[11.5px] text-muted-foreground">
                {item.sku}
              </TableCell>

              <TableCell>
                <StockDot inStock={item.in_stock} stockQuantity={item.stock_quantity} />
              </TableCell>

              <TableCell className="font-mono text-muted-foreground">
                {new Date(item.added_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TableCell>

              <TableCell>
                <Link
                  href={`/product/${item.product_id}`}
                  className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
                >
                  See price <ArrowRight data-icon="inline-end" />
                </Link>
              </TableCell>

              <TableCell className="pr-4 text-center">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => toggle(item.product_id)}
                  disabled={isPending}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove from wishlist"
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
}

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        crumbs={[{ label: "Wishlist" }]}
        title="Wishlist"
      />
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8">
        <Suspense>
          <WishlistTable />
        </Suspense>
      </div>
    </div>
  );
}
