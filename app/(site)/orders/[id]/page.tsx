"use client";

import { use, Suspense } from "react";
import Link from "next/link";
import { Check, ChevronLeft } from "lucide-react";
import { useOrder, type OrderStatus } from "@/hooks/useOrders";
import { useRequireApproved } from "@/components/auth/withAuth";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_STEPS: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

const TH = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

function StatusTracker({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <span className="size-2 rounded-full bg-destructive" />
        Order cancelled
      </div>
    );
  }

  const activeIndex = STATUS_STEPS.indexOf(status);

  return (
    <ol className="flex items-center">
      {STATUS_STEPS.map((step, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5 px-3">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
                  done && "bg-foreground text-background",
                  active && "bg-primary text-primary-foreground",
                  !done && !active && "bg-muted text-muted-foreground ring-1 ring-border"
                )}
              >
                {done ? <Check className="size-3" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[11px] capitalize",
                  active || done ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <span className={cn("mb-5 h-px w-8", i < activeIndex ? "bg-foreground" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function AddressBlock({ label, fields }: { label: string; fields: (string | null | undefined)[] }) {
  const lines = fields.filter(Boolean) as string[];
  if (lines.length === 0) return null;

  return (
    <div>
      <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-sm leading-relaxed text-foreground">
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}

function OrderDetail({ id }: { id: string }) {
  const { isLoading: authLoading, isAuthenticated, isApproved } = useRequireApproved();
  const { data: order, isLoading, isError } = useOrder(id);

  if (authLoading || !isAuthenticated || !isApproved || isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-8 sm:px-8">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Order not found.</p>
        <Link href="/orders" className={cn(buttonVariants({ variant: "outline" }), "no-underline")}>
          <ChevronLeft data-icon="inline-start" /> Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="border-b border-border bg-card px-4 py-6 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="space-y-2">
            <Breadcrumb
              items={[
                { label: "Orders", href: "/orders" },
                { label: order.invoice_no },
              ]}
            />
            <h1 className="font-heading text-3xl font-semibold leading-none text-foreground">
              {order.invoice_no}
            </h1>
            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.status} />
              <span className="font-mono text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
          <StatusTracker status={order.status} />
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-8">
        <Card>
          <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <AddressBlock
              label="Billing address"
              fields={[
                order.billing?.name,
                order.billing?.company,
                order.billing?.address_1,
                order.billing?.address_2,
                [order.billing?.city, order.billing?.state, order.billing?.postcode].filter(Boolean).join(", "),
                order.billing?.country,
              ]}
            />
            <AddressBlock
              label="Shipping address"
              fields={[
                order.shipping?.name,
                order.shipping?.company,
                order.shipping?.address_1,
                order.shipping?.address_2,
                [order.shipping?.city, order.shipping?.state, order.shipping?.postcode].filter(Boolean).join(", "),
                order.shipping?.country,
              ]}
            />
          </CardContent>
        </Card>

        <Card className="gap-0 pb-0">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle>Line items</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className={cn(TH, "pl-4")}>Product</TableHead>
                <TableHead className={cn(TH, "w-16 text-right")}>Qty</TableHead>
                <TableHead className={cn(TH, "w-24 text-right")}>Unit price</TableHead>
                <TableHead className={cn(TH, "w-24 pr-4 text-right")}>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(order.items ?? []).map((line) => (
                <TableRow key={line.id} className="text-[12.5px]">
                  <TableCell className="whitespace-normal py-3 pl-4">
                    <div className="text-foreground">{line.name}</div>
                    <div className="font-mono text-[10.5px] text-muted-foreground">{line.sku}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono">{line.quantity}</TableCell>
                  <TableCell className="text-right font-mono">${line.unit_price.toFixed(2)}</TableCell>
                  <TableCell className="pr-4 text-right font-mono font-semibold">
                    ${line.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="ml-auto w-full max-w-xs space-y-2 border-t border-border px-4 py-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Line total</span>
              <span className="font-mono text-foreground">${order.line_total.toFixed(2)}</span>
            </div>
            {order.shipping_total != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-mono text-foreground">${order.shipping_total.toFixed(2)}</span>
              </div>
            )}
            {order.total_tax != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-mono text-foreground">${order.total_tax.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base font-semibold text-foreground">
              <span>Total</span>
              <span className="font-mono">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {order.customer_note && (
          <Card>
            <CardHeader>
              <CardTitle>Order note</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm italic leading-relaxed text-foreground">{order.customer_note}</p>
            </CardContent>
          </Card>
        )}

        <Link href="/orders" className={cn(buttonVariants({ variant: "ghost" }), "no-underline")}>
          <ChevronLeft data-icon="inline-start" /> Back to orders
        </Link>
      </div>
    </div>
  );
}

export default function OrderDetailPage({ params }: Props) {
  const { id } = use(params);
  return (
    <Suspense>
      <OrderDetail id={id} />
    </Suspense>
  );
}
