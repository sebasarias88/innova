import { fallbackHtml } from "@/lib/fallback/page";

// No database: works even when Supabase or anything else is down.
// Dynamic so the 503 status and headers are always sent as written.
export const dynamic = "force-dynamic";

export function GET() {
  return new Response(
    fallbackHtml({
      title: "Estamos haciendo mejoras",
      text: "La tienda vuelve en unos minutos. Mientras tanto te atendemos por WhatsApp: cotizaciones, pedidos y citas.",
      retry: true,
    }),
    {
      // 503 + Retry-After tells Google it is temporary (rankings are kept).
      status: 503,
      headers: { "content-type": "text/html; charset=utf-8", "retry-after": "3600", "cache-control": "no-store" },
    },
  );
}
