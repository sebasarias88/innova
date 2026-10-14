"use client";

import { useActionState } from "react";
import { verifyTotp } from "../actions";
import { Field, FormError, SubmitButton } from "@/components/admin/form";

export function VerifyTotpForm({ factorId, submitLabel = "Verificar" }: { factorId: string; submitLabel?: string }) {
  const [state, action] = useActionState(verifyTotp, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="factorId" value={factorId} />
      <Field
        label="Código de verificación"
        id="code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9 ]{6,7}"
        maxLength={7}
        required
        autoFocus
        placeholder="000 000"
        className="text-center font-mono text-lg tracking-[0.4em]"
      />
      <FormError message={state?.error} />
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
