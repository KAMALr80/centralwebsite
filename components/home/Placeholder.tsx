export function Placeholder({
  label,
  tone = "warm",
  className = "",
}: {
  label?: string;
  tone?: "warm" | "cool" | "orange";
  className?: string;
}) {
  const [a, b] =
    tone === "cool"
      ? ["#D6DEEC", "#C6D0E2"]
      : tone === "orange"
      ? ["#FFD9BD", "#FFC499"]
      : ["#E5DFD0", "#D9D3C5"];
  const fg =
    tone === "cool" ? "#3A4866" : tone === "orange" ? "#7A3B12" : "#5A5751";

  return (
    <div
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{
        background: `repeating-linear-gradient(135deg, ${a} 0 14px, ${b} 14px 28px)`,
      }}
    >
      {label && (
        <span
          className="font-mono text-[10px] tracking-[0.08em] uppercase px-2 py-1 rounded-[2px]"
          style={{ color: fg, background: "rgba(247,244,238,0.9)" }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
