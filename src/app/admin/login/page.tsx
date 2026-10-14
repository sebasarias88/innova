import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { AuthCard } from "@/components/admin/AuthCard";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  const session = await getAdminSession();
  if (session.status === "ok") redirect("/admin");
  if (session.status === "needs-mfa") redirect("/admin/mfa");

  return (
    <AuthCard title="Panel administrativo" subtitle="Ingresa con la cuenta de administrador de INNOVA.">
      <LoginForm />
    </AuthCard>
  );
}
