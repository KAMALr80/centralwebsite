"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { useRequireApproved } from "@/components/auth/withAuth";
import { useOrders, type PaymentStatus } from "@/hooks/useOrders";
import { Pagination } from "@/components/shared/Pagination";
import { PageHeader } from "@/components/shared/PageHeader";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
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

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  due: "text-muted-foreground",
  paid: "text-emerald-700",
  refunded: "text-primary",
};

const TH = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

function OrdersTable() {
  const { isLoading, isAuthenticated, isApproved } = useRequireApproved();
  const [page, setPage] = useState(1);
  const { data, isLoading: ordersLoading, isError, refetch } = useOrders(page);

  if (isLoading || !isAuthenticated || !isApproved || ordersLoading) {
    return (
      <Card className="gap-0 py-0">
        <Table>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
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
        <p className="text-sm text-muted-foreground">Orders could not be loaded.</p>
        <Button type="button" onClick={() => refetch()}>Try again</Button>
      </Card>
    );
  }

  const orders = data?.data ?? [];
  const meta = data?.meta;

  if (orders.length === 0) {
    return (
      <Card className="items-center py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Package className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No orders yet.</p>
        <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "h-9 px-4 no-underline")}>
          Browse products
        </Link>
      </Card>
    );
  }

  return (
    <>
      <Card className="gap-0 py-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn(TH, "pl-4")}>Invoice #</TableHead>
              <TableHead className={TH}>Date</TableHead>
              <TableHead className={TH}>Status</TableHead>
              <TableHead className={TH}>Payment</TableHead>
              <TableHead className={cn(TH, "pr-4 text-right")}>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="text-[12.5px]">
                <TableCell className="py-3 pl-4">
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-mono text-[12px] font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    {order.invoice_no}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "font-mono capitalize",
                      order.payment_status ? PAYMENT_STYLES[order.payment_status] : "text-muted-foreground"
                    )}
                  >
                    {order.payment_status ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="pr-4 text-right font-mono font-semibold">
                  ${order.total.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {meta && meta.last_page > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={setPage}
          />
        </div>
      )}
    </>
  );
}

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        crumbs={[{ label: "Orders" }]}
        title="Your orders"
      />
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8">
        <Suspense>
          <OrdersTable />
        </Suspense>
      </div>
    </div>
  );
}
