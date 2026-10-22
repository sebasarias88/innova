"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { listenForExit, track, trackPageview } from "@/lib/analytics/client";

/** What kind of link was clicked (internal page links are already counted as visits). */
function classify(a: HTMLAnchorElement): { target: string; label?: string } | null {
  const href = a.getAttribute("href") ?? "";
  if (/^tel:/i.test(href)) return { target: "call" };
  if (/^mailto:/i.test(href)) return { target: "email" };
  let url: URL;
  try {
    url = new URL(a.href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "api.whatsapp.com" || host === "wa.me") return { target: "whatsapp" };
  if (/instagram\.com$/.test(host)) return { target: "instagram" };
  if (/facebook\.com$/.test(host)) return { target: "facebook" };
  if (/tiktok\.com$/.test(host)) return { target: "tiktok" };
  if (/google\.[a-z.]+$|goo\.gl$|maps\.app\.goo\.gl$/.test(host) && /maps/.test(url.href)) return { target: "maps" };
  if (host !== window.location.hostname.replace(/^www\./, "")) return { target: "external", label: host };
  return null;
}

/** Where on the page the link is: helps tell the floating WhatsApp button from the header one. */
function placement(el: Element) {
  const named = el.closest<HTMLElement>("[data-track-label]")?.dataset.trackLabel;
  if (named) return named;
  if (el.closest("header")) return "Encabezado";
  if (el.closest("footer")) return "Pie de página";
  const text = (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim();
  return text.slice(0, 80) || undefined;
}

/** Counts page visits and important clicks on the public site. */
export function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    listenForExit();
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("a, [data-track]");
      if (!el) return;
      const custom = (el as HTMLElement).dataset.track;
      if (custom) return track(custom, placement(el));
      if (el instanceof HTMLAnchorElement) {
        const kind = classify(el);
        if (kind) track(kind.target, kind.label ?? placement(el));
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    // Product pages: wait for the title so the report shows the product name.
    const id = setTimeout(() => {
      const query = new URLSearchParams(window.location.search).get("q");
      const label = pathname.startsWith("/tienda/")
        ? document.querySelector("h1")?.textContent ?? undefined
        : pathname === "/tienda" && query
          ? `Búsqueda: ${query.slice(0, 60)}`
          : undefined;
      trackPageview(pathname, label);
    }, 400);
    return () => clearTimeout(id);
  }, [pathname]);

  return null;
}
