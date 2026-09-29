"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface SiteSettings {
  site_name?: string;
  logo_url?: string | null;
  phone?: string;
  email?: string;
  support_email?: string;
  address?: string;
  search_placeholder?: string;
  login_text?: string;
  register_text?: string;
  wholesale_notice?: string;
  sale_label?: string;
  sale_url?: string;
  brand_menu_title?: string;
  brand_menu_link_label?: string;
  shop_all_label?: string;
  nav_featured_label?: string;
  nav_cta_label?: string;
  newsletter_enabled?: boolean;
  newsletter_title?: string;
  newsletter_placeholder?: string;
  newsletter_button_text?: string;
  seo_title?: string;
  seo_description?: string;
  homepage_heading?: string;
  catalog_background_logo_url?: string | null;
  footer_copyright?: string;
  footer_legal_notice?: string;
  footer_tagline?: string;
  footer_assistance_title?: string;
  business_hours_title?: string;
  view_all_label?: string;
  all_brands_label?: string;
  shop_by_category_title?: string;
  featured_brands_title?: string;
  new_arrivals_title?: string;
  sold_out_label?: string;
  login_to_buy_label?: string;
  wholesale_label?: string;
  price_unavailable_label?: string;
  currency_code?: string;
  nav_groups?: {
    label: string;
    keywords?: string[];
    url?: string;
    is_active?: boolean;
    children?: { label: string; url: string; is_active?: boolean }[];
    type?: "sections";
    sections?: { title: string; items: { label: string; href: string; img?: string }[] }[];
    promo?: { tag?: string; img?: string; name?: string; href?: string };
  }[];
  footer_columns?: { title: string; links: { label: string; url: string }[] }[];
  business_hours?: string[];
}

export interface HomepageItem {
  id: number;
  kind: "content" | "heading" | "slide" | "brand" | "catalog";
  title: string | null;
  desktop_image_url: string;
  mobile_image_url: string | null;
  video_url: string | null;
  pdf_url: string | null;
  alt_text: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface HomepageSection {
  id: number;
  type: "featured_category" | "banner" | "hero" | "product_carousel" | "brand_showcase" | "catalog_showcase";
  title: string;
  settings: Record<string, unknown>;
  data: { product_ids?: number[] } | null;
  items: HomepageItem[];
  sort_order: number;
  is_active: boolean;
}

export interface HomepagePayload {
  client: string;
  label: string;
  site: SiteSettings;
  sections: HomepageSection[];
}

interface SiteConfigValue {
  homepage: HomepagePayload | null;
  site: SiteSettings;
  loaded: boolean;
  error: string | null;
  reload: () => void;
}

const SiteConfigContext = createContext<SiteConfigValue>({ homepage: null, site: {}, loaded: false, error: null, reload: () => undefined });

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [homepage, setHomepage] = useState<HomepagePayload | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const reload = useCallback(() => {
    setLoaded(false);
    setError(null);
    setRequestVersion((value) => value + 1);
  }, []);

  useEffect(() => {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
    const client = process.env.NEXT_PUBLIC_HOMEPAGE_CLIENT || "central";
    const controller = new AbortController();
    fetch(`${apiUrl}/api/homepage?client=${encodeURIComponent(client)}`, { signal: controller.signal, headers: { Accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Homepage API returned ${response.status}`);
        return response.json() as Promise<HomepagePayload>;
      })
      .then((payload) => setHomepage(payload))
      .catch((error: unknown) => {
        if ((error as Error)?.name === "AbortError") return;
        setHomepage(null);
        setError((error as Error)?.message || "Homepage configuration could not be loaded.");
        if (process.env.NODE_ENV === "development") console.error("Site configuration could not be loaded", error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoaded(true);
      });
    return () => controller.abort();
  }, [requestVersion]);

  useEffect(() => {
    const settings = homepage?.site;
    if (!settings) return;
    if (settings.seo_title) document.title = settings.seo_title;
    if (settings.seo_description) {
      let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = settings.seo_description;
    }
  }, [homepage]);

  const value = useMemo(() => ({ homepage, site: homepage?.site ?? {}, loaded, error, reload }), [error, homepage, loaded, reload]);
  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
