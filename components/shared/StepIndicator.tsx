import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Cart", "Checkout", "Confirmation"];

export function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-1">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <li key={label} className="flex items-center gap-1">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
                  active && "bg-primary text-primary-foreground",
                  done && "bg-foreground text-background",
                  !active && !done && "bg-muted text-muted-foreground ring-1 ring-border"
                )}
              >
                {done ? <Check className="size-3" /> : n}
              </span>
              <span className={cn("font-mono text-xs uppercase tracking-wide", active ? "font-medium text-foreground" : "text-muted-foreground")}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight className="size-3.5 text-muted-foreground/50" />}
          </li>
        );
      })}
    </ol>
  );
}
