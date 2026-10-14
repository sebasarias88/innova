"use client";

import { useActionState } from "react";
import { signIn } from "../actions";
import { Field, FormError, SubmitButton } from "@/components/admin/form";

export function LoginForm() {
  const [state, action] = useActionState(signIn, undefined);

  return (
    <form action={action} className="space-y-4">
      <Field label="Correo" id="email" name="email" type="email" autoComplete="username" defaultValue={state?.email} key={state?.email} required maxLength={160} />
      <Field label="Contraseña" id="password" name="password" type="password" autoComplete="current-password" required minLength={8} maxLength={200} />
      <FormError message={state?.error} />
      <SubmitButton>Continuar</SubmitButton>
    </form>
  );
}
