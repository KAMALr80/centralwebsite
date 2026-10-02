"use client";

import { ChevronDown, ChevronUp, Mail, MessageCircle, Phone, Send } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { Logo } from "./Logo";

/** Used only until the admin panel's footer settings have been configured. */
const DEFAULT_COLUMNS = [
  {
    title: "Find It Fast",
    links: [
      { label: "Nicotine Products and Alternatives", url: "/category/6" },
      { label: "CBD & Hemp Wellness", url: "/category/73" },
      { label: "Cigar Accessories", url: "/category/67" },
      { label: "Cleaning Products", url: "/category/4?sub_cat=69" },
      { label: "Detox Supplements and Health", url: "/category/32" },
      { label: "E-Juice Flavors and Blends", url: "/category/48" },
    ],
  },
  {
    title: "Navigation",
    links: [{ label: "Wishlist", url: "/wishlist" }],
  },
  {
    title: "Customer Support",
    links: [
      { label: "My Account", url: "/account/profile" },
      { label: "Track your Order", url: "/orders" },
      { label: "Return/Exchange", url: "mailto:support@centralsmokedistro.com?subject=Return%2FExchange" },
      { label: "Category Directory", url: "/shop" },
      { label: "Contact Us", url: "mailto:support@centralsmokedistro.com" },
    ],
  },
];

function FacebookIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} aria-hidden="true">
      <path d="M13.5 22v-8.5H16l.5-3.5h-3V7.7c0-1 .3-1.7 1.7-1.7H16.6V2.8C16.3 2.8 15.3 2.7 14.2 2.7c-2.4 0-4.1 1.5-4.1 4.2v2.1H7.5V13H10v9h3.5z" />
    </svg>
  );
}

function InstagramIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={props.className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsappIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1s-.6.8-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3a2.7 2.7 0 0 0-.9 2 4.7 4.7 0 0 0 1 2.5 10.7 10.7 0 0 0 4.5 4c.6.2 1.1.4 1.5.5a3.5 3.5 0 0 0 1.6.1c.5-.1 1.4-.6 1.6-1.1s.2-1 .1-1.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

const DEFAULT_BUSINESS_HOURS = [
  "Monday: 9:00 AM - 7:00 PM",
  "Tuesday: 9:00 AM - 7:00 PM",
  "Wednesday: 9:00 AM - 7:00 PM",
  "Thursday: 9:00 AM - 7:00 PM",
  "Friday: 9:00 AM - 7:00 PM",
  "Saturday: 10:00 AM - 5:00 PM",
  "Sunday: Closed",
];

const headingClass =
  "mb-4 text-[17px] font-bold leading-tight tracking-[-0.01em] text-foreground";
const linkClass =
  "text-muted-foreground no-underline transition-colors hover:text-primary focus-visible:text-primary";
const mobileLinkClass =
  "text-primary no-underline transition-colors hover:underline focus-visible:underline";
const summaryClass =
  "flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 text-[15px] font-bold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/40 [&::-webkit-details-marker]:hidden";
const chevronClass =
  "size-4 shrink-0 text-foreground transition-transform group-open:rotate-180";

export function Footer() {
  const { site } = useSiteConfig();
  const year = new Date().getFullYear();

  const assistanceTitle = site.footer_assistance_title || "Need Assistance? Call us!";
  const phone = site.phone || "+1 (914) 539-5580";
  const email = site.email || "info@centralsmokedistro.com";
  const supportEmail = site.support_email || "support@centralsmokedistro.com";
  const whatsappNotice = site.footer_whatsapp_notice || "Text or Whatsapp Available 24/7!";
  const columns = site.footer_columns?.length ? site.footer_columns : DEFAULT_COLUMNS;
  const businessHoursTitle = site.business_hours_title || "Business Hours";
  const businessHours = site.business_hours?.length ? site.business_hours : DEFAULT_BUSINESS_HOURS;
  const newsletterEnabled = site.newsletter_enabled ?? true;
  const newsletterTitle = site.newsletter_title || "Sign up to Newsletter";
  const newsletterPlaceholder = site.newsletter_placeholder || "Enter your email address";
  const newsletterButtonText = site.newsletter_button_text || "Sign up";
  const footerCopyright = site.footer_copyright || "Central Smoke Distribution";
  const footerCredit = site.footer_legal_notice || "Proudly Powered by Brainbean Technolabs";
  const facebookUrl = site.social_facebook_url;
  const instagramUrl = site.social_instagram_url;
  const whatsappUrl = site.social_whatsapp_url;
  const hasSocial = Boolean(facebookUrl || instagramUrl || whatsappUrl);
  // Contact | one track per footer column (short columns stay narrow) | business hours.
  const desktopColumnTemplate = ["1.35fr", ...columns.map((column) => (column.links.length <= 2 ? "0.6fr" : "1fr")), "1.2fr"].join(" ");

  const contactList = (centered: boolean) => {
    const row = centered ? "flex items-center justify-center gap-2.5" : "flex gap-3";
    const icon = centered ? "shrink-0 text-foreground" : "mt-0.5 shrink-0 text-foreground";
    const link = centered ? mobileLinkClass : linkClass;
    return (
      <ul className={centered ? "space-y-3.5 text-[15px] leading-6 text-muted-foreground" : "space-y-2.5 text-[14px] leading-6 text-muted-foreground"}>
        <li className={row}>
          <Phone size={18} strokeWidth={1.8} className={icon} />
          <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className={link}>{phone}</a>
        </li>
        <li className={`${row} font-semibold text-foreground`}>
          <MessageCircle size={18} strokeWidth={1.8} className={icon} />
          <span>{whatsappNotice}</span>
        </li>
        <li className={row}>
          <Mail size={18} strokeWidth={1.8} className={icon} />
          <a href={`mailto:${email}`} className={`${link} min-w-0 break-all`}>{email}</a>
        </li>
        <li className={row}>
          <Mail size={18} strokeWidth={1.8} className={icon} />
          <a href={`mailto:${supportEmail}`} className={`${link} min-w-0 break-all`}>{supportEmail}</a>
        </li>
      </ul>
    );
  };

  return (
    <footer className="relative border-t-4 border-primary bg-card text-foreground">
      {newsletterEnabled && (
        <div className="hidden border-b border-white/10 bg-foreground px-10 py-4 text-white lg:block">
          <div className="mx-auto flex max-w-[1500px] flex-row items-center justify-between gap-5">
            <div className="flex items-center justify-center gap-4 text-[20px] font-bold tracking-[-0.02em] lg:justify-start">
              <Send size={26} className="shrink-0 text-primary" />
              {newsletterTitle}
            </div>
            <form className="mx-auto flex w-full max-w-[620px] gap-2 lg:mx-0">
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

      <div
        className="mx-auto hidden max-w-[1500px] gap-x-8 gap-y-6 px-10 py-9 lg:grid lg:[grid-template-columns:var(--footer-cols)] xl:[grid-template-columns:auto_var(--footer-cols)] xl:gap-x-10"
        style={{ "--footer-cols": desktopColumnTemplate } as CSSProperties}
      >
        <div className="lg:col-span-full xl:col-span-1">
          <Logo size={96} />
          {site.footer_tagline && (
            <p className="mt-5 max-w-[230px] text-[15px] leading-7 text-muted-foreground">
              {site.footer_tagline}
            </p>
          )}
        </div>

        <div>
          <h2 className={headingClass}>{assistanceTitle}</h2>
          <address className="not-italic">{contactList(false)}</address>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h2 className={headingClass}>{column.title}</h2>
            <ul className="space-y-2.5 text-[14px] leading-6">
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
          <ul className="space-y-1.5 text-[14px] leading-6 text-muted-foreground">
            {businessHours.map((entry) => {
              const [day, hours] = entry.includes(":") ? [entry.slice(0, entry.indexOf(":")), entry.slice(entry.indexOf(":") + 1).trim()] : [entry, ""];
              return (
                <li key={entry} className="grid grid-cols-[92px_1fr] gap-3">
                  <span>{day}</span>
                  <span className="whitespace-nowrap">{hours}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="lg:hidden">
        <div className="space-y-2.5 bg-muted px-4 py-4 sm:px-6">
          {columns.map((column) => (
            <details key={column.title} className="group rounded-lg bg-card px-5">
              <summary className={summaryClass}>
                {column.title}
                <ChevronDown className={chevronClass} strokeWidth={2.75} />
              </summary>
              <ul className="space-y-2.5 pb-4 text-[14px] leading-5">
                {column.links.map((item) => (
                  <li key={item.label}>
                    <Link href={item.url} className={mobileLinkClass}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
          <details className="group rounded-lg bg-card px-5">
            <summary className={summaryClass}>
              {businessHoursTitle}
              <ChevronDown className={chevronClass} strokeWidth={2.75} />
            </summary>
            <ul className="space-y-1.5 pb-4 text-[14px] leading-5 text-foreground/80">
              {businessHours.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </details>
        </div>

        {hasSocial && (
          <div className="flex justify-center gap-5 py-6">
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                <FacebookIcon className="size-4" />
              </a>
            )}
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                <WhatsappIcon className="size-4" />
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                <InstagramIcon className="size-4" />
              </a>
            )}
          </div>
        )}

        <div className="border-t border-border bg-muted/30 px-6 py-8 text-center">
          <div className="flex justify-center">
            <Logo size={90} />
          </div>
          <h2 className="mb-4 mt-5 text-[18px] font-bold leading-tight text-foreground">{assistanceTitle}</h2>
          <address className="not-italic">{contactList(true)}</address>
        </div>
      </div>

      <div className="border-t border-border bg-muted/40 px-6 py-4 lg:px-10">
        <div className="mx-auto max-w-[1680px] text-center text-[13px] text-muted-foreground">
          <span className="block sm:inline">© {footerCopyright} - {year} - All Rights Reserved</span>
          {footerCredit && <><span className="hidden sm:inline"> | </span><span className="block sm:inline">{footerCredit}</span></>}
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        className="absolute -top-6 right-6 flex size-11 items-center justify-center rounded-full bg-foreground/70 text-background shadow-md transition-colors hover:bg-foreground"
      >
        <ChevronUp size={22} />
      </button>
    </footer>
  );
}
