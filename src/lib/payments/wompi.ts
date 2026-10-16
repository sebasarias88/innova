import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";

/**
 * Wompi (Bancolombia) integration — Web Checkout by redirect.
 *
 * Environment variables (server-only):
 *   WOMPI_ENV               sandbox | production
 *   WOMPI_PUBLIC_KEY        pub_test_… / pub_prod_…
 *   WOMPI_INTEGRITY_SECRET  test_integrity_… / prod_integrity_…
 *   WOMPI_EVENTS_SECRET     test_events_… / prod_events_…
 *
 * The private key is not needed: we never create transactions from the server,
 * we only sign the checkout and read public transaction data.
 */

export type WompiConfig = {
  env: "sandbox" | "production";
  publicKey: string;
  integritySecret: string;
  eventsSecret: string;
  apiBase: string;
};

const clean = (v: string | undefined) => v?.trim().replace(/^["']|["']$/g, "").trim() || undefined;

let warned = false;

/** Returns the config, or null when online payments are not (correctly) configured. */
export function wompiConfig(): WompiConfig | null {
  const env = clean(process.env.WOMPI_ENV);
  const publicKey = clean(process.env.WOMPI_PUBLIC_KEY);
  const integritySecret = clean(process.env.WOMPI_INTEGRITY_SECRET);
  const eventsSecret = clean(process.env.WOMPI_EVENTS_SECRET);
  if (!env || !publicKey || !integritySecret || !eventsSecret) return null;

  const problem = (() => {
    if (env !== "sandbox" && env !== "production") return "WOMPI_ENV must be 'sandbox' or 'production'.";
    const tag = env === "sandbox" ? "test" : "prod";
    if (!publicKey.startsWith(`pub_${tag}_`)) return `WOMPI_PUBLIC_KEY must start with pub_${tag}_ for WOMPI_ENV=${env}.`;
    if (!integritySecret.startsWith(`${tag}_integrity_`)) return `WOMPI_INTEGRITY_SECRET must start with ${tag}_integrity_ for WOMPI_ENV=${env}.`;
    if (!eventsSecret.startsWith(`${tag}_events_`)) return `WOMPI_EVENTS_SECRET must start with ${tag}_events_ for WOMPI_ENV=${env}.`;
    return null;
  })();
  if (problem) {
    // Never log the values: only which variable is wrong. Online payments stay off.
    if (!warned) console.error("[wompi] disabled:", problem);
    warned = true;
    return null;
  }

  return {
    env: env as WompiConfig["env"],
    publicKey,
    integritySecret,
    eventsSecret,
    apiBase: env === "production" ? "https://production.wompi.co/v1" : "https://sandbox.wompi.co/v1",
  };
}

const sha256 = (value: string) => createHash("sha256").update(value, "utf8").digest("hex");

function safeEqualHex(a: string, b: string) {
  const ab = Buffer.from(a.toLowerCase(), "utf8");
  const bb = Buffer.from(b.toLowerCase(), "utf8");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** URL of Wompi's hosted checkout for an order. Amount and reference are signed server-side. */
export function checkoutUrl(config: WompiConfig, order: { reference: string; amountInCents: number; redirectUrl: string }) {
  const currency = "COP";
  const signature = sha256(`${order.reference}${order.amountInCents}${currency}${config.integritySecret}`);
  const url = new URL("https://checkout.wompi.co/p/");
  url.searchParams.set("public-key", config.publicKey);
  url.searchParams.set("currency", currency);
  url.searchParams.set("amount-in-cents", String(order.amountInCents));
  url.searchParams.set("reference", order.reference);
  url.searchParams.set("signature:integrity", signature);
  url.searchParams.set("redirect-url", order.redirectUrl);
  // No customer data in the URL on purpose: Wompi asks for it on its own page.
  return url.toString();
}

// ── Transactions ────────────────────────────────────────────────────────

export const transactionSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9-]{5,80}$/),
  status: z.string().max(30),
  reference: z.string().max(40),
  amount_in_cents: z.number().int().nonnegative(),
  currency: z.string().max(5),
});
export type WompiTransaction = z.infer<typeof transactionSchema>;

export const isTransactionId = (id: unknown): id is string => typeof id === "string" && /^[A-Za-z0-9-]{5,80}$/.test(id);

/** Reads a transaction straight from Wompi's API (source of truth, never the URL). */
export async function fetchTransaction(config: WompiConfig, id: string): Promise<{ tx: WompiTransaction; raw: unknown } | null> {
  if (!isTransactionId(id)) return null;
  try {
    const res = await fetch(`${config.apiBase}/transactions/${encodeURIComponent(id)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: unknown };
    const parsed = transactionSchema.safeParse(body.data);
    return parsed.success ? { tx: parsed.data, raw: body.data } : null;
  } catch (e) {
    console.error("[wompi] transaction lookup failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

// ── Events (webhook) ────────────────────────────────────────────────────

const eventSchema = z.object({
  event: z.string().max(60),
  data: z.record(z.string(), z.unknown()),
  signature: z.object({
    properties: z.array(z.string().max(80)).min(1).max(20),
    checksum: z.string().max(128),
  }),
  timestamp: z.number().int(),
});
export type WompiEvent = z.infer<typeof eventSchema>;

function readPath(data: Record<string, unknown>, path: string): string {
  let current: unknown = data;
  for (const key of path.split(".")) {
    if (current === null || typeof current !== "object" || !Object.hasOwn(current, key)) return "";
    current = (current as Record<string, unknown>)[key];
  }
  return current === null || current === undefined ? "" : String(current);
}

/**
 * Verifies an event exactly as Wompi documents it:
 * SHA256(values of signature.properties in order + timestamp + events secret).
 */
export function verifyEvent(config: WompiConfig, body: unknown, headerChecksum: string | null): WompiEvent | null {
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return null;
  const event = parsed.data;
  const values = event.signature.properties.map((p) => readPath(event.data, p)).join("");
  const expected = sha256(`${values}${event.timestamp}${config.eventsSecret}`);
  const received = headerChecksum?.trim() || event.signature.checksum;
  if (!safeEqualHex(expected, received)) return null;
  if (headerChecksum && !safeEqualHex(headerChecksum.trim(), event.signature.checksum)) return null;
  return event;
}
