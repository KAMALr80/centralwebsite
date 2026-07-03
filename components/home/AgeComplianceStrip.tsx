export function AgeComplianceStrip() {
  return (
    <div className="bg-brand-ink text-white px-4 sm:px-8 md:px-16 py-2.5 flex items-center justify-center gap-2">
      <span className="font-mono text-[10px] tracking-[0.1em] uppercase">
        Wholesale accounts only
      </span>
      <span className="w-1 h-1 rounded-full bg-brand-orange shrink-0" />
      <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-brand-orange">
        21+ Only
      </span>
    </div>
  );
}
