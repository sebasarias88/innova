import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

/** Best-effort client IP (Vercel sets x-forwarded-for / x-real-ip). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "unknown";
}

/**
 * Fixed-window rate limit stored in Postgres. Returns true when allowed.
 * Fails closed: if the check itself errors, the request is rejected.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    const { data, error } = await createAdminClient().rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) throw new Error(error.message);
    return data === true;
  } catch (e) {
    console.error("[rate-limit]", e instanceof Error ? e.message : e);
    return false;
  }
}
