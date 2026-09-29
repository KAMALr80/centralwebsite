"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteConfig } from "@/context/SiteConfigContext";

interface LogoProps {
  size?: number;
}

export function Logo({ size = 72 }: LogoProps) {
  const { site } = useSiteConfig();
  const name = site.site_name || "Central Smoke Distro";

  return (
    <Link href="/" className="shrink-0 no-underline" aria-label={`${name} home`}>
      <Image
        src={site.logo_url || "/central-smoke-distro-logo.gif"}
        alt={name}
        width={size}
        height={size}
        className="block object-contain"
        unoptimized
        priority
      />
    </Link>
  );
}
