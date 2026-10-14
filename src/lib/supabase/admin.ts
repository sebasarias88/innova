import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseUrl } from "./env";

/**
 * Privileged client (secret key). Bypasses RLS — use ONLY on the server for the
 * RPCs reserved to `service_role` (create_order, apply_payment_event,
 * create_booking, check_rate_limit). Never import this from a Client Component.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("Missing environment variable: SUPABASE_SECRET_KEY");

  return createClient<Database>(supabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
