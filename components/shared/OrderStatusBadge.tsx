import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/hooks/useOrders";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  processing: "bg-amber-100 text-amber-800",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-destructive/10 text-destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={cn("font-mono capitalize", STATUS_STYLES[status] ?? "bg-muted text-muted-foreground")}>
      {status}
    </Badge>
  );
}
