import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/admin/ui";
import { NotificationsForm, PasswordForm, SiteSettingsForm } from "./forms";

export const metadata: Metadata = { title: "Configuración" };

export default async function SettingsPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const [{ data: site }, { data: notifications }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase.from("admin_settings").select("*").eq("id", 1).single(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Configuración" description="Datos de la empresa, avisos y seguridad de la cuenta." />

      <Card title="Datos de la empresa" description="Se muestran en la web: contacto, pie de página y botón de WhatsApp.">
        {site && <SiteSettingsForm site={site} />}
      </Card>

      <Card
        title="Avisos"
        description="A dónde llegan los avisos de pedidos y citas nuevas. El envío automático se activa cuando la empresa tenga su dominio."
      >
        {notifications && <NotificationsForm settings={notifications} />}
      </Card>

      <Card title="Cuenta">
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-white/10 bg-navy-950/40 p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-lime-400" />
          <div className="text-sm">
            <p className="font-semibold">{admin.email}</p>
            <p className="mt-0.5 text-white/50">Protegida con verificación en dos pasos (app autenticadora).</p>
          </div>
        </div>
        <PasswordForm />
      </Card>
    </div>
  );
}
