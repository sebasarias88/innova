import "server-only";

/**
 * Public base URL of this deployment (payment return URL, canonical URLs,
 * sitemap). Set SITE_URL in Vercel once the final domain exists; until then
 * Vercel's own URLs are used.
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

/**
 * Search engines may index the site only on the production deployment with its
 * final domain (SITE_URL). Previews and the temporary *.vercel.app address stay
 * out of Google, so the real domain does not compete with a duplicate.
 */
export function isIndexable(): boolean {
  return Boolean(process.env.SITE_URL?.trim()) && process.env.VERCEL_ENV === "production";
}
