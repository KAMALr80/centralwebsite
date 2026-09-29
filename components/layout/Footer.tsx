"use client";

import { Mail, MapPin, Phone, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { Logo } from "./Logo";

/** Used only until the admin panel's footer settings have been configured. */
const DEFAULT_COLUMNS = [
  {
    title: "Find It Fast",
    links: [
      { label: "Cigar Accessories", url: "/shop?search=cigar%20accessories" },
      { label: "Cleaning Products", url: "/shop?search=cleaning" },
      { label: "Detox Supplements", url: "/shop?search=detox" },
      { label: "Category Directory", url: "/shop" },
    ],
  },
  {
    title: "Customer Support",
    links: [
      { label: "My Account", url: "/account/profile" },
      { label: "Track your Order", url: "/orders" },
      { label: "Category Directory", url: "/shop" },
      { label: "Contact Us", url: "mailto:support@centralsmokedistro.com" },
    ],
  },
];

const DEFAULT_BUSINESS_HOURS = [
  "Monday: 9:00 AM - 7:00 PM",
  "Tuesday: 9:00 AM - 7:00 PM",
  "Wednesday: 9:00 AM - 7:00 PM",
  "Thursday: 9:00 AM - 7:00 PM",
  "Friday: 9:00 AM - 7:00 PM",
  "Saturday: 10:00 AM - 5:00 PM",
];

const headingClass =
  "mb-5 text-[19px] font-bold leading-tight tracking-[-0.02em] text-foreground";
const linkClass =
  "text-muted-foreground no-underline transition-colors hover:text-primary focus-visible:text-primary";

export function Footer() {
  const { site } = useSiteConfig();
  const year = new Date().getFullYear();

  const companyName = site.site_name || "Central Smoke Distro";
  const tagline = site.footer_tagline || "A wholesale marketplace built for independent retailers. 600+ vetted brands, one invoice, sixty-day terms.";
  const assistanceTitle = site.footer_assistance_title || "Need Assistance?";
  const phone = site.phone || "+1 (914) 539-5580";
  const email = site.email || "info@centralsmokedistro.com";
  const supportEmail = site.support_email || "support@centralsmokedistro.com";
  const address = site.address || "Brooklyn - Portland - Chicago";
  const columns = site.footer_columns?.length ? site.footer_columns : DEFAULT_COLUMNS;
  const businessHoursTitle = site.business_hours_title || "Business Hours";
  const businessHours = site.business_hours?.length ? site.business_hours : DEFAULT_BUSINESS_HOURS;
  const newsletterEnabled = site.newsletter_enabled ?? true;
  const newsletterTitle = site.newsletter_title || "Sign up to Newsletter";
  const newsletterPlaceholder = site.newsletter_placeholder || "Enter your email address";
  const newsletterButtonText = site.newsletter_button_text || "Sign up";
  const footerCopyright = site.footer_copyright || `${companyName} Wholesale Inc.`;
  const footerLegalNotice = site.footer_legal_notice || "Free freight over $500 - Net-60 terms available";

  return (
    <footer className="border-t border-border bg-card text-foreground">
      {newsletterEnabled && (
        <div className="border-b border-white/10 bg-foreground px-6 py-4 text-white lg:px-10">
          <div className="mx-auto flex max-w-[1768px] flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 text-[20px] font-bold tracking-[-0.02em]">
              <Send size={26} className="shrink-0 text-primary" />
              {newsletterTitle}
            </div>
            <form className="flex w-full max-w-[620px] gap-2">
              <Input
                type="email"
                placeholder={newsletterPlaceholder}
                className="h-11 flex-1 border-background/20 bg-background/10 px-4 text-background placeholder:text-background/50 md:text-sm"
              />
              <Button type="submit" size="lg" className="h-11 px-6 text-sm">
                {newsletterButtonText}
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[1760px] gap-x-10 gap-y-10 px-6 py-10 sm:grid-cols-2 lg:grid-cols-3 lg:px-10 lg:py-11 xl:grid-cols-[1fr_1.45fr_0.9fr_1fr_1.35fr] 2xl:grid-cols-[210px_340px_230px_250px_330px] 2xl:justify-between">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo size={110} />
          <p className="mt-5 max-w-[230px] text-[15px] leading-7 text-muted-foreground">
            {tagline}
          </p>
        </div>

        <div>
          <h2 className={headingClass}>{assistanceTitle}</h2>
          <address className="not-italic">
            <ul className="space-y-3.5 text-[15px] leading-6 text-muted-foreground">
              <li className="flex gap-3">
                <Phone size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-foreground" />
                <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className={linkClass}>{phone}</a>
              </li>
              <li className="flex gap-3">
                <Mail size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-foreground" />
                <a href={`mailto:${email}`} className={`${linkClass} min-w-0 break-words`}>{email}</a>
              </li>
              <li className="flex gap-3">
                <Mail size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-foreground" />
                <a href={`mailto:${supportEmail}`} className={`${linkClass} min-w-0 break-words`}>{supportEmail}</a>
              </li>
              <li className="flex gap-3">
                <MapPin size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-foreground" />
                <span>{address}</span>
              </li>
            </ul>
          </address>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h2 className={headingClass}>{column.title}</h2>
            <ul className="space-y-3.5 text-[15px] leading-6">
              {column.links.map((item) => (
                <li key={item.label}>
                  <Link href={item.url} className={linkClass}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className={headingClass}>{businessHoursTitle}</h2>
          <ul className="space-y-2 text-[15px] leading-6 text-muted-foreground">
            {businessHours.map((entry) => {
              const [day, hours] = entry.includes(":") ? [entry.slice(0, entry.indexOf(":")), entry.slice(entry.indexOf(":") + 1).trim()] : [entry, ""];
              return (
                <li key={entry} className="grid grid-cols-[90px_1fr] gap-3">
                  <span>{day}</span>
                  <span className="whitespace-nowrap">{hours}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-border bg-muted/40 px-6 py-4 lg:px-10">
        <div className="mx-auto flex max-w-[1680px] flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} {footerCopyright}</span>
          <span>{footerLegalNotice}</span>
        </div>
      </div>
    </footer>
  );
}
