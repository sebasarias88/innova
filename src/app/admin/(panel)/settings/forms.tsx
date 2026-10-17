"use client";

import { ActionForm, SaveButton, TextField, Toggle } from "@/components/admin/fields";
import { changePassword, saveNotifications, saveSiteSettings } from "./actions";

type Site = {
  company_name: string;
  whatsapp: string;
  phone_label: string;
  email: string | null;
  address: string | null;
  city: string | null;
  business_hours: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
};

export function SiteSettingsForm({ site }: { site: Site }) {
  return (
    <ActionForm action={saveSiteSettings} className="space-y-4">
      <TextField label="Nombre de la empresa" name="company_name" required maxLength={120} defaultValue={site.company_name} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="WhatsApp (pedidos y contacto)" name="whatsapp" required inputMode="tel" defaultValue={site.whatsapp} hint="Con o sin 57. Aquí llegan los pedidos." />
        <TextField label="Teléfono visible" name="phone_label" required maxLength={30} defaultValue={site.phone_label} placeholder="321 853 9336" />
        <TextField label="Correo de contacto" name="email" type="email" maxLength={160} defaultValue={site.email ?? ""} />
        <TextField label="Horario" name="business_hours" maxLength={160} defaultValue={site.business_hours ?? ""} placeholder="Lun a Sáb · 8:00 a. m. – 6:00 p. m." />
        <TextField label="Dirección" name="address" maxLength={200} defaultValue={site.address ?? ""} />
        <TextField label="Ciudad" name="city" maxLength={80} defaultValue={site.city ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField label="Instagram" name="instagram_url" type="url" maxLength={200} defaultValue={site.instagram_url ?? ""} placeholder="https://instagram.com/…" />
        <TextField label="TikTok" name="tiktok_url" type="url" maxLength={200} defaultValue={site.tiktok_url ?? ""} placeholder="https://tiktok.com/@…" />
        <TextField label="Facebook" name="facebook_url" type="url" maxLength={200} defaultValue={site.facebook_url ?? ""} placeholder="https://facebook.com/…" />
      </div>
      <SaveButton />
    </ActionForm>
  );
}

export function NotificationsForm({ settings }: { settings: { notification_email: string | null; notification_whatsapp: string | null; notify_new_orders: boolean; notify_new_bookings: boolean } }) {
  return (
    <ActionForm action={saveNotifications} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Correo para avisos"
          name="notification_email"
          type="email"
          maxLength={160}
          defaultValue={settings.notification_email ?? ""}
          hint="Aquí llega un correo con cada pedido, pago aprobado y cita. Si lo dejas vacío, llega al correo de la empresa."
        />
        <TextField
          label="WhatsApp para avisos"
          name="notification_whatsapp"
          inputMode="tel"
          defaultValue={settings.notification_whatsapp ?? ""}
          hint="Reservado para avisos por WhatsApp (próximamente). Por ahora los avisos llegan por correo."
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle label="Avisar pedidos nuevos" name="notify_new_orders" defaultChecked={settings.notify_new_orders} />
        <Toggle label="Avisar citas nuevas" name="notify_new_bookings" defaultChecked={settings.notify_new_bookings} />
      </div>
      <SaveButton />
    </ActionForm>
  );
}

export function PasswordForm() {
  return (
    <ActionForm action={changePassword} resetOnSuccess className="space-y-4">
      <TextField label="Contraseña actual" name="current_password" type="password" autoComplete="current-password" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Nueva contraseña" name="new_password" type="password" autoComplete="new-password" required minLength={12} maxLength={200} hint="Mínimo 12 caracteres, con mayúsculas, minúsculas y números." />
        <TextField label="Repite la nueva contraseña" name="confirm_password" type="password" autoComplete="new-password" required minLength={12} maxLength={200} />
      </div>
      <SaveButton>Cambiar contraseña</SaveButton>
    </ActionForm>
  );
}
