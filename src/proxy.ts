import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * 1. Maintenance mode: with MAINTENANCE_MODE=true (Vercel variable + redeploy)
 *    every public page shows /mantenimiento (503, no database). The admin
 *    panel, the payment webhooks and the API keep working.
 * 2. Admin: refreshes the Supabase session (the public site needs none).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return updateSession(request);
  if (process.env.MAINTENANCE_MODE === "true") {
    return NextResponse.rewrite(new URL("/mantenimiento", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Pages only: never static files, images, the API or the fallback pages themselves.
  matcher: ["/((?!_next/|api/|mantenimiento|offline|sw\\.js|brand/|img/|fonts/|.*\\.[a-z0-9]+$).*)"],
};
