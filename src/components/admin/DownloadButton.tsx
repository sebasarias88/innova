"use client";

import { useState } from "react";
import clsx from "clsx";
import { toast } from "sonner";
import { BusyContent } from "@/components/ui/Busy";

/**
 * Downloads a generated file (Excel/PDF) showing a spinner while the server
 * builds it, and an error message if it fails (a plain link would look frozen).
 */
export function DownloadButton({
  href,
  children,
  className,
  onDownloaded,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onDownloaded?: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const res = await fetch(href, { cache: "no-store" });
      if (!res.ok) throw new Error((await res.text()) || "No se pudo generar el archivo.");
      const blob = await res.blob();
      const name = /filename="([^"]+)"/.exec(res.headers.get("content-disposition") ?? "")?.[1] ?? "descarga";
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), { href: url, download: name });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      onDownloaded?.();
    } catch (e) {
      toast.error(e instanceof Error && e.message.length < 160 ? e.message : "No se pudo generar el archivo. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={download} disabled={busy} aria-busy={busy} className={clsx("relative disabled:cursor-wait", className)}>
      <BusyContent busy={busy}>{children}</BusyContent>
    </button>
  );
}
