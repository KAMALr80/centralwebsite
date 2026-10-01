import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const isDev = process.env.NODE_ENV !== "production";

// Lets phones/tablets on the same network open the dev server via this machine's LAN IP.
const lanHosts = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net && net.family === "IPv4" && !net.internal)
  .map((net) => net!.address);
const devHosts = ["localhost", "127.0.0.1", ...lanHosts];

const nextConfig: NextConfig = {
  allowedDevOrigins: devHosts,
  experimental: {
    instantInsights: {
      validationLevel: "warning",
    },
  },
  images: {
    // Local Laravel storage is served from a private address during development.
    dangerouslyAllowLocalIP: isDev,
    remotePatterns: [
      // Live product images are served directly from the ERP's media host.
      { protocol: "https", hostname: "erp.centralsmokedistro.com", pathname: "/**" },
      ...(isDev ? devHosts.map((hostname) => ({ protocol: "http" as const, hostname, pathname: "/**" })) : []),
      ...(process.env.IMAGE_CDN_URL ? [new URL(process.env.IMAGE_CDN_URL)] : []),
    ],
  },
};

export default nextConfig;
