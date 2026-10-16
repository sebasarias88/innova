import "server-only";

/**
 * Public base URL of this deployment (used for the payment return URL).
 * Set SITE_URL once the final domain exists; until then Vercel's own URLs are used.
 */
export function siteUrl(): string {
  const explicit = process.env.SITE_URL?.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  if (explicit && /^https?:\/\/[a-z0-9.-]+(:\d+)?$/i.test(explicit)) return explicit;
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
