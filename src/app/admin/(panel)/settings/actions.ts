"use server";

import { revalidatePath } from "next/cache";
import { createClient as createStatelessClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";
import { rateLimit } from "@/lib/security/rate-limit";
import { checkbox, dbError, fail, firstIssue, formToObject, ok, optionalText, requiredText, type ActionResult } from "@/lib/admin/actions";
import { digitsOnly } from "@/lib/admin/format";

const url = optionalText(200).refine((v) => v === null || /^https:\/\/[^\s]+$/.test(v), "Los enlaces deben empezar por https://");
const email = optionalText(160).refine((v) => v === null || z.email().safeParse(v).success, "Correo no válido.");
const phoneDigits = (label: string) =>
  z
    .string()
    .transform((v) => {
      const d = digitsOnly(v);
      return d.length === 10 ? `57${d}` : d;
    })
    .refine((v) => /^[0-9]{10,15}$/.test(v), `${label}: escribe un número válido (ej: 321 853 9336).`);

const siteSchema = z.object({
  company_name: requiredText("El nombre", 2, 120),
  whatsapp: phoneDigits("WhatsApp"),
  phone_label: requiredText("El teléfono visible", 7, 30),
  email,
  address: optionalText(200),
  city: optionalText(80),
  business_hours: optionalText(160),
  instagram_url: url,
  tiktok_url: url,
  facebook_url: url,
});

export async function saveSiteSettings(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = siteSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").update(parsed.data).eq("id", 1);
  if (error) return fail(dbError(error));
  revalidatePath("/", "layout");
  return ok("Datos de la empresa guardados.");
}

const notificationsSchema = z.object({
  notification_email: email,
  notification_whatsapp: z
    .string()
    .optional()
    .transform((v) => (v && digitsOnly(v) ? v : null))
    .pipe(phoneDigits("WhatsApp de avisos").nullable()),
  notify_new_orders: checkbox,
  notify_new_bookings: checkbox,
});

export async function saveNotifications(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = notificationsSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const supabase = await createClient();
  const { error } = await supabase.from("admin_settings").update(parsed.data).eq("id", 1);
  if (error) return fail(dbError(error));
  revalidatePath("/admin/settings");
  return ok("Preferencias de avisos guardadas.");
}

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Escribe tu contraseña actual."),
    new_password: z
      .string()
      .min(12, "La nueva contraseña debe tener mínimo 12 caracteres.")
      .max(200)
      .refine((v) => /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v), "Usa mayúsculas, minúsculas y números."),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, "Las contraseñas nuevas no coinciden.")
  .refine((d) => d.new_password !== d.current_password, "La nueva contraseña debe ser diferente a la actual.");

export async function changePassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!(await rateLimit(`password:user:${admin.userId}`, 5, 15 * 60))) return fail("Demasiados intentos. Espera unos minutos.");
  const parsed = passwordSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  if (!admin.email) return fail("La cuenta no tiene correo.");

  // Verify the current password with a throwaway client so the admin session is untouched.
  const verifier = createStatelessClient(supabaseUrl(), supabasePublishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error: wrong } = await verifier.auth.signInWithPassword({ email: admin.email, password: parsed.data.current_password });
  if (wrong) return fail("La contraseña actual no es correcta.");
  await verifier.auth.signOut({ scope: "local" });

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.new_password });
  if (error) {
    if (error.code === "weak_password") return fail("Esa contraseña es muy débil o aparece en filtraciones conocidas. Elige otra.");
    return fail("No se pudo cambiar la contraseña. Inténtalo de nuevo.");
  }
  return ok("Contraseña actualizada. Compártela con el otro administrador por un medio seguro.");
}
