import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    instantInsights: {
      validationLevel: "warning",
    },
  },
  images: {
    remotePatterns: [
      // Live product images are served directly from the ERP's media host.
      { protocol: "https", hostname: "erp.centralsmokedistro.com", pathname: "/**" },
      ...(process.env.IMAGE_CDN_URL ? [new URL(process.env.IMAGE_CDN_URL)] : []),
    ],
  },
};

export default nextConfig;
