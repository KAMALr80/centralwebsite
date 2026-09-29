import { cn } from "@/lib/utils";

interface StockDotProps {
  inStock: boolean;
  stockQuantity: number | null;
}

export function StockDot({ inStock, stockQuantity }: StockDotProps) {
  let dotClass = "bg-emerald-600";
  let label = "In stock";
  let textClass = "text-muted-foreground";

  if (!inStock) {
    dotClass = "bg-muted-foreground";
    label = "Out of stock";
  } else if (stockQuantity !== null) {
    dotClass =
      stockQuantity < 100 ? "bg-destructive" : stockQuantity < 400 ? "bg-amber-500" : "bg-emerald-600";
    label = stockQuantity.toLocaleString();
    textClass = "text-foreground";
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-[11px]", textClass)}>
      <span className={cn("size-1.5 shrink-0 rounded-full", dotClass)} />
      {label}
    </span>
  );
}
