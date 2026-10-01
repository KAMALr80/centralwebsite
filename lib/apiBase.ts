const CONFIGURED_API_ROOT = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

// When the API is configured as localhost but the site is opened from another device
// (e.g. a tablet on the LAN), "localhost" would point at that device, so swap in the page's host.
function remappedOrigin(): { from: string[]; to: string } | null {
  if (typeof window === "undefined") return null;
  let configured: URL;
  try {
    configured = new URL(CONFIGURED_API_ROOT);
  } catch {
    return null;
  }
  if (!LOOPBACK_HOSTS.has(configured.hostname) || LOOPBACK_HOSTS.has(window.location.hostname)) return null;

  const port = configured.port ? `:${configured.port}` : "";
  const to = `${configured.protocol}//${window.location.hostname}${port}`;
  const from = [...LOOPBACK_HOSTS].map((host) => `${configured.protocol}//${host}${port}`);
  return { from, to };
}

export function apiRoot(): string {
  const remap = remappedOrigin();
  return remap ? CONFIGURED_API_ROOT.replace(/^https?:\/\/[^/]+/, remap.to) : CONFIGURED_API_ROOT;
}

/** Rewrites loopback API URLs (e.g. storage image links) inside an API payload so they load on LAN devices. */
export function remapLoopbackUrls<T>(payload: T): T {
  const remap = remappedOrigin();
  if (!remap) return payload;

  const visit = (value: unknown): unknown => {
    if (typeof value === "string") {
      const prefix = remap.from.find((origin) => value.startsWith(origin));
      return prefix ? remap.to + value.slice(prefix.length) : value;
    }
    if (Array.isArray(value)) return value.map(visit);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, visit(inner)]));
    }
    return value;
  };

  return visit(payload) as T;
}
