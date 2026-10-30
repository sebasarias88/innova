import { fallbackHtml } from "@/lib/fallback/page";

// Built once: the service worker stores it and shows it when there is no internet.
export const dynamic = "force-static";

export function GET() {
  return new Response(
    fallbackHtml({
      title: "Sin conexión a internet",
      text: "Revisa tus datos o tu WiFi e inténtalo de nuevo. Si tienes señal para WhatsApp, también puedes escribirnos por ahí.",
      retry: true,
    }),
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}
