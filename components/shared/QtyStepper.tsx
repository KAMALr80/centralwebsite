"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QtyStepperProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QtyStepper({
  value,
  onChange,
  min = 0,
  max,
  disabled = false,
}: QtyStepperProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => {
    if (max !== undefined && value >= max) return;
    onChange(value + 1);
  };

  return (
    <div className="inline-flex h-8 items-center rounded-md border border-border bg-card p-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={decrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <Minus />
      </Button>
      <span className="flex w-9 select-none items-center justify-center font-mono text-[13px] text-foreground">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={increment}
        disabled={disabled || (max !== undefined && value >= max)}
        aria-label="Increase quantity"
      >
        <Plus />
      </Button>
    </div>
  );
}
