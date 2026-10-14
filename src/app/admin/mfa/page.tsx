import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { AuthCard } from "@/components/admin/AuthCard";
import { signOut } from "../actions";
import { EnrollTotp } from "./EnrollTotp";
import { VerifyTotpForm } from "./VerifyTotpForm";

export const metadata: Metadata = { title: "Verificación en dos pasos" };

export default async function MfaPage() {
  const session = await getAdminSession();
  if (session.status === "ok") redirect("/admin");
  if (session.status !== "needs-mfa") redirect("/admin/login");

  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.listFactors();
  const factor = data?.totp.find((f) => f.status === "verified");

  return (
    <AuthCard
      title={factor ? "Verificación en dos pasos" : "Protege tu cuenta"}
      subtitle={
        factor
          ? "Abre tu app autenticadora (Google Authenticator, Microsoft Authenticator, 1Password…) e ingresa el código de 6 dígitos."
          : "Por seguridad, el panel exige un segundo factor. Escanea el código QR con una app autenticadora en el celular de los administradores."
      }
    >
      {factor ? <VerifyTotpForm factorId={factor.id} /> : <EnrollTotp />}
      <form action={signOut} className="mt-4 text-center">
        <button type="submit" className="text-xs font-semibold text-white/50 underline-offset-4 hover:text-white hover:underline">
          Cerrar sesión
        </button>
      </form>
    </AuthCard>
  );
}
