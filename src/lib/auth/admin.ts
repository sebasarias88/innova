import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminSession =
  | { status: "anonymous" }
  | { status: "forbidden"; userId: string }
  | { status: "needs-mfa"; userId: string; email: string | null; displayName: string }
  | { status: "ok"; userId: string; email: string | null; displayName: string };

/**
 * Reads and verifies the session once per request. `getClaims()` validates the
 * JWT signature, so the claims can be trusted (unlike `getSession()`).
 */
export const getAdminSession = cache(async (): Promise<AdminSession> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return { status: "anonymous" };

  // RLS only lets a user read their own row in `admins`.
  const { data: admin } = await supabase
    .from("admins")
    .select("display_name, is_active")
    .eq("user_id", claims.sub)
    .maybeSingle();

  if (!admin?.is_active) return { status: "forbidden", userId: claims.sub };

  const base = {
    userId: claims.sub,
    email: (claims.email as string | undefined) ?? null,
    displayName: admin.display_name,
  };
  return claims.aal === "aal2" ? { status: "ok", ...base } : { status: "needs-mfa", ...base };
});

/** Guard for every admin page and Server Action. Redirects when not allowed. */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (session.status === "anonymous" || session.status === "forbidden") redirect("/admin/login");
  if (session.status === "needs-mfa") redirect("/admin/mfa");
  return session;
}
