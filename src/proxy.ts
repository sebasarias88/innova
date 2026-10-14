import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Only the admin area needs a session; the public site stays fully static.
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
