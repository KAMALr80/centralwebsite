import Link from "next/link";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";

const QUICK_LINKS = [
  { label: "Cigar Accessories", href: "/shop" },
  { label: "Cleaning Products", href: "/shop" },
  { label: "Detox Supplements and Health", href: "/shop" },
];

const SUPPORT_LINKS = [
  { label: "My Account", href: "/account/profile" },
  { label: "Track your Order", href: "/orders" },
  { label: "Store Directory", href: "/brands" },
  { label: "Contact Us", href: "#" },
];

const BUSINESS_HOURS = [
  { day: "Mon - Fri", time: "9:00 AM - 7:00 PM" },
  { day: "Saturday", time: "10:00 AM - 5:00 PM" },
  { day: "Sunday", time: "Closed" },
];

export function Footer() {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Forge & Co.";
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-navy text-[#C8D2E5] px-4 sm:px-6 md:px-8 pt-10 md:pt-14 pb-7">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 max-w-7xl mx-auto">
        {/* Logo + tagline */}
        <div>
          <Logo color="#FFFFFF" />
          {/* <p className="text-[13px] leading-relaxed mt-4 text-[#9DAAC2] max-w-[280px]">
            A wholesale marketplace built for independent retailers. 600+ vetted brands,
            one invoice, sixty-day terms.
          </p> */}
        </div>

        {/* Contact / Need Assistance */}
        <div>
          <h4 className="font-mono text-[11px] tracking-[0.08em] uppercase text-brand-orange mb-3.5 font-medium">
            Need Assistance?
          </h4>
          <ul className="space-y-2.5 text-[13px]">
            <li className="flex items-center gap-2">
              <Phone size={13} className="shrink-0 text-[#6B7A95]" />
              <a href="tel:+19145395580" className="text-[#C8D2E5] hover:text-white transition-colors no-underline">
                +1 (914) 539-5580
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle size={13} className="shrink-0 text-[#6B7A95]" />
              <span>Text/WhatsApp - 24/7</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={13} className="shrink-0 text-[#6B7A95]" />
              <a href="mailto:info@centralsmokedistro.com" className="text-[#C8D2E5] hover:text-white transition-colors no-underline">
                info@centralsmokedistro.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={13} className="shrink-0 text-[#6B7A95]" />
              <a href="mailto:support@centralsmokedistro.com" className="text-[#C8D2E5] hover:text-white transition-colors no-underline">
                support@centralsmokedistro.com
              </a>
            </li>
          </ul>
        </div>

        {/* Find It Fast */}
        <div>
          <h4 className="font-mono text-[11px] tracking-[0.08em] uppercase text-brand-orange mb-3.5 font-medium">
            Find It Fast
          </h4>
          <ul className="space-y-2">
            {QUICK_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-[13px] text-[#C8D2E5] hover:text-white transition-colors no-underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h4 className="font-mono text-[11px] tracking-[0.08em] uppercase text-brand-orange mb-3.5 font-medium">
            Quick Links
          </h4>
          <ul className="space-y-2">
            {SUPPORT_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-[13px] text-[#C8D2E5] hover:text-white transition-colors no-underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Business Hours */}
        <div>
          <h4 className="font-mono text-[11px] tracking-[0.08em] uppercase text-brand-orange mb-3.5 font-medium">
            Business Hours
          </h4>
          <ul className="space-y-2">
            {BUSINESS_HOURS.map((row) => (
              <li key={row.day} className="flex justify-between gap-3 text-[13px]">
                <span className="text-[#C8D2E5]">{row.day}</span>
                <span className="text-[#9DAAC2]">{row.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-8 md:mt-12 pt-5 border-t border-[#1E3358] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 font-mono text-[10px] tracking-[0.06em] uppercase text-[#6B7A95] max-w-7xl mx-auto">
        <span>© {year} {companyName}</span>
        <a target="_blank" href="https://brainbean.us">Powered by Brainbean Technolabs</a>
      </div>
    </footer>
  );
}
