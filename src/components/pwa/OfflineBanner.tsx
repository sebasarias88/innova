"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";
import clsx from "clsx";

const subscribe = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};

/**
 * "Sin conexión" notice. While offline, links to other pages of the site are
 * blocked (they would fail half-way); the banner shakes to explain why.
 */
export function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  const [nudge, setNudge] = useState(0);

  useEffect(() => {
    if (online) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(a.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return; // same-page anchors still work
      e.preventDefault();
      e.stopPropagation();
      setNudge((n) => n + 1);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [online]);

  if (online) return null;
  return (
    <div role="status" aria-live="assertive" className="pointer-events-none fixed inset-x-3 top-3 z-[60] flex justify-center sm:top-4">
      <p
        key={nudge}
        className={clsx(
          "pointer-events-auto flex items-center gap-2.5 rounded-full border border-amber-300/40 bg-navy-950/95 px-4 py-2.5 text-sm text-white shadow-2xl backdrop-blur",
          nudge > 0 && "motion-safe:animate-shake",
        )}
      >
        <WifiOff className="size-4 shrink-0 text-amber-300" />
        <span>
          <b>Sin conexión.</b> Revisa tu internet para seguir navegando.
        </span>
      </p>
    </div>
  );
}
