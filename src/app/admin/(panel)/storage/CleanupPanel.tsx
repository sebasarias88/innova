"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import clsx from "clsx";
import { ActionForm, FormFeedback, SaveButton } from "@/components/admin/fields";
import { purgeHistory } from "./actions";
import { DownloadButton } from "@/components/admin/DownloadButton";

/**
 * Step 1: download the backup (Excel/PDF) of everything before a date.
 * Step 2: clean that history (only allowed after step 1, checked by the database).
 */
export function CleanupPanel({ maxCutoff, defaultCutoff }: { maxCutoff: string; defaultCutoff: string }) {
  const [cutoff, setCutoff] = useState(defaultCutoff);
  const [downloaded, setDownloaded] = useState<string | null>(null);
  const href = (format: "xlsx" | "pdf") => `/admin/storage/export?${new URLSearchParams({ cutoff, format })}`;
  const ready = downloaded === cutoff;

  return (
    <div className="space-y-6">
      <label className="block max-w-xs text-sm font-semibold text-white/80">
        Historial anterior a
        <input
          type="date"
          value={cutoff}
          max={maxCutoff}
          required
          onChange={(e) => setCutoff(e.target.value)}
          className="mt-1.5 block w-full rounded-xl border border-white/10 bg-navy-950/60 px-3.5 py-2.5 text-sm text-white [color-scheme:dark]"
        />
        <span className="mt-1 block text-xs font-normal text-white/45">Debe ser de hace más de 30 días.</span>
      </label>

      <div className="rounded-2xl border border-white/10 p-4">
        <p className="flex items-center gap-2 text-sm font-bold">
          <Download className="size-4 text-lime-400" /> 1. Descarga el respaldo
        </p>
        <p className="mt-1 text-xs text-white/50">
          El Excel trae todo el detalle (pedidos, productos, datos de clientes, citas, pagos y visitas). El PDF es un resumen para imprimir o archivar. Guárdalo en un lugar
          seguro: contiene datos personales de los clientes.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <DownloadButton
            href={href("xlsx")}
            onDownloaded={() => setDownloaded(cutoff)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold hover:border-lime-400 hover:text-lime-300"
          >
            <FileSpreadsheet className="size-4" /> Descargar Excel
          </DownloadButton>
          <DownloadButton
            href={href("pdf")}
            onDownloaded={() => setDownloaded(cutoff)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold hover:border-lime-400 hover:text-lime-300"
          >
            <FileText className="size-4" /> Descargar PDF
          </DownloadButton>
        </div>
      </div>

      <div className={clsx("rounded-2xl border p-4 transition-opacity", ready ? "border-red-400/30 bg-red-500/[0.05]" : "border-white/10 opacity-50")}>
        <p className="flex items-center gap-2 text-sm font-bold">
          <Trash2 className="size-4 text-red-300" /> 2. Limpia el historial
        </p>
        <p className="mt-1 text-xs text-white/55">
          Borra los pedidos <b>entregados o cancelados</b>, las citas realizadas o canceladas, sus pagos, el registro de cambios y el detalle de visitas anteriores a esa
          fecha. <b>No se borran</b> productos, categorías, proyectos, configuración, pedidos abiertos ni citas futuras. No se puede deshacer.
        </p>
        <ActionForm action={purgeHistory} inlineFeedback className="mt-3 flex flex-wrap items-end gap-3">
          <input type="hidden" name="cutoff" value={cutoff} />
          <label className="text-xs font-semibold text-white/70">
            Escribe BORRAR para confirmar
            <input
              name="confirm"
              disabled={!ready}
              autoComplete="off"
              placeholder="BORRAR"
              className="mt-1 block rounded-lg border border-white/10 bg-navy-950/60 px-3 py-2 text-sm uppercase text-white outline-none focus:border-red-400/70 disabled:opacity-50"
            />
          </label>
          <SaveButton className="bg-red-400 hover:bg-red-300">Limpiar historial</SaveButton>
          <div className="w-full">
            <FormFeedback />
          </div>
        </ActionForm>
        {!ready && <p className="mt-2 text-xs text-white/45">Se habilita después de descargar el respaldo de esta fecha.</p>}
      </div>
    </div>
  );
}
