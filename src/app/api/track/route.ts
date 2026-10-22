import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Receives batches of anonymous analytics events from the public site.
 * No IP or personal data is stored: only the page, the action, where the visit
 * came from, the device type and the approximate city (from Vercel's edge).
 */
export const runtime = "nodejs";

const BOTS = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|headless|lighthouse|pingdom|uptime|curl|wget|python|node-fetch|axios|vercel-screenshot/i;
const text = (max: number) => z.string().trim().max(max).optional().transform((v) => v || undefined);

const schema = z.object({
  v: z.uuid(),
  s: z.uuid(),
  src: z.object({ source: z.string().trim().min(1).max(40), medium: text(40), campaign: text(80), ref: text(100) }),
  e: z
    .array(
      z.object({
        k: z.enum(["pageview", "click"]),
        p: z.string().trim().min(1).max(200).regex(/^\//),
        t: text(40),
        l: text(140),
      }),
    )
    .min(1)
    .max(20),
});

// Small per-instance limiter: enough to stop floods without a database call.
const hits = new Map<string, { count: number; reset: number }>();
function allowed(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    if (hits.size > 5000) hits.clear();
    hits.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= 30;
}

function device(ua: string) {
  if (/ipad|tablet|kindle|silk|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android/i.test(ua)) return "mobile";
  return "desktop";
}

const decode = (v: string | null, max: number) => {
  if (!v) return null;
  try {
    return decodeURIComponent(v).slice(0, max);
  } catch {
    return v.slice(0, max);
  }
};

const ok = () => new Response(null, { status: 204 });

export async function POST(request: Request) {
  // Same-site only (sendBeacon sends the Origin header).
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) return new Response(null, { status: 403 });

  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOTS.test(ua)) return ok();

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allowed(ip)) return ok();

  const raw = await request.text();
  if (raw.length > 16_000) return new Response(null, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return new Response(null, { status: 400 });

  const { v, s, src, e } = parsed.data;
  const geo = {
    country: request.headers.get("x-vercel-ip-country")?.slice(0, 2) ?? null,
    region: decode(request.headers.get("x-vercel-ip-country-region"), 60),
    city: decode(request.headers.get("x-vercel-ip-city"), 60),
  };
  const rows = e
    .filter((ev) => !ev.p.startsWith("/admin") && !ev.p.startsWith("/api"))
    .map((ev) => ({
      kind: ev.k,
      path: ev.p,
      target: ev.k === "click" ? (ev.t ?? "other") : null,
      label: ev.l ?? null,
      source: src.source.toLowerCase(),
      medium: src.medium ?? null,
      campaign: src.campaign ?? null,
      referrer_host: src.ref ?? null,
      device: device(ua),
      ...geo,
      visitor_id: v,
      session_id: s,
    }));
  if (!rows.length) return ok();

  const { error } = await createAdminClient().from("analytics_events").insert(rows);
  if (error) console.error("[track] insert failed:", error.code, error.message);
  return ok();
}
