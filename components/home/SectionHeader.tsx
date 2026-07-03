import Link from "next/link";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  dark?: boolean;
  action?: React.ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "VIEW ALL →",
  dark = false,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap justify-between items-end gap-3 mb-8">
      <div>
        <div
          className={`font-mono text-[11px] tracking-[0.1em] uppercase mb-2 ${
            dark ? "text-brand-orange" : "text-brand-muted"
          }`}
        >
          {eyebrow}
        </div>
        <h2
          className={`font-serif text-[28px] sm:text-[36px] md:text-[44px] font-normal tracking-tight m-0 ${
            dark ? "text-white" : "text-brand-ink"
          }`}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={`font-mono text-[11px] tracking-[0.04em] mt-2 ${
              dark ? "text-[#9DAAC2]" : "text-brand-muted"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {action}
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className={`font-mono text-[11px] tracking-[0.06em] uppercase no-underline transition-colors ${
              dark
                ? "text-[#9DAAC2] hover:text-white"
                : "text-brand-muted hover:text-brand-ink"
            }`}
          >
            {viewAllLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
