"use client";

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
    <div className="inline-flex h-8 items-stretch overflow-hidden border border-brand-line bg-brand-white">
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className="flex w-7 items-center justify-center border-r border-brand-line bg-brand-white text-[14px] text-brand-muted transition-colors hover:bg-brand-bg-alt disabled:cursor-not-allowed disabled:text-brand-line"
      >
        −
      </button>
      <span className="flex w-11 select-none items-center justify-center bg-brand-white font-mono text-[14px] text-brand-ink">
        {value}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={disabled || (max !== undefined && value >= max)}
        aria-label="Increase quantity"
        className="flex w-7 items-center justify-center border-l border-brand-line bg-brand-bg-alt text-[14px] text-brand-ink transition-colors hover:bg-brand-line disabled:cursor-not-allowed disabled:text-brand-muted/40"
      >
        +
      </button>
    </div>
  );
}
