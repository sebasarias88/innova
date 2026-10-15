"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useTransition } from "react";
import { Copy, Check, LoaderCircle, QrCode } from "lucide-react";
import { startTotpEnrollment, type EnrollmentState } from "../actions";
import { toast } from "sonner";
import { FormError } from "@/components/admin/form";
import { VerifyTotpForm } from "./VerifyTotpForm";

export function EnrollTotp() {
  const [state, setState] = useState<EnrollmentState>();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const start = () => startTransition(async () => setState(await startTotpEnrollment()));

  if (state && "factorId" in state) {
    return (
      <div className="space-y-5">
        <ol className="space-y-1.5 text-sm text-white/70">
          <li>1. Escanea este código con tu app autenticadora.</li>
          <li>2. Escribe el código de 6 dígitos que aparece.</li>
        </ol>
        <div className="mx-auto w-fit rounded-2xl bg-white p-3">
          <img src={state.qrCode} alt="Código QR para la app autenticadora" width={180} height={180} />
        </div>
        <div>
          <p className="text-xs text-white/50">¿No puedes escanear? Ingresa esta clave manualmente:</p>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(state.secret).then(() => {
                setCopied(true);
                toast.success("Clave copiada.");
              });
            }}
            className="mt-1.5 flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-navy-950/60 px-3 py-2.5 text-left font-mono text-xs break-all text-lime-300"
          >
            {state.secret}
            {copied ? <Check className="size-4 shrink-0" /> : <Copy className="size-4 shrink-0 text-white/50" />}
          </button>
        </div>
        <VerifyTotpForm factorId={state.factorId} submitLabel="Activar y entrar" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormError message={state && "error" in state ? state.error : undefined} />
      <button
        type="button"
        onClick={start}
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-white disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <QrCode className="size-4" />}
        Configurar autenticador
      </button>
    </div>
  );
}
