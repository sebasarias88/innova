"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth/admin";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";

export type FormState = { error?: string; email?: string } | undefined;

const GENERIC_LOGIN_ERROR = "Correo o contraseña incorrectos.";
const TOO_MANY = "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";

const credentialsSchema = z.object({
  email: z.email().max(160).transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8).max(200),
});

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const typedEmail = String(formData.get("email") ?? "").slice(0, 160);
  if (!parsed.success) return { error: GENERIC_LOGIN_ERROR, email: typedEmail };
  const { email, password } = parsed.data;

  const ip = await getClientIp();
  const [ipOk, emailOk] = await Promise.all([
    rateLimit(`login:ip:${ip}`, 10, 15 * 60),
    rateLimit(`login:email:${email}`, 5, 15 * 60),
  ]);
  if (!ipOk || !emailOk) return { error: TOO_MANY, email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: GENERIC_LOGIN_ERROR, email };

  // Valid credentials but not an admin: end the session and show the same message.
  const { data: admin } = await supabase.from("admins").select("is_active").eq("user_id", data.user.id).maybeSingle();
  if (!admin?.is_active) {
    await supabase.auth.signOut();
    return { error: GENERIC_LOGIN_ERROR, email };
  }

  redirect("/admin/mfa");
}

export type EnrollmentState = { factorId: string; qrCode: string; secret: string } | { error: string } | undefined;

/** Starts TOTP enrollment (only when the admin has no verified factor yet). */
export async function startTotpEnrollment(): Promise<EnrollmentState> {
  const session = await getAdminSession();
  if (session.status !== "needs-mfa") return { error: "Sesión no válida. Vuelve a iniciar sesión." };

  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  if (factors?.totp.some((f) => f.status === "verified")) {
    return { error: "Ya tienes un autenticador configurado." };
  }
  // Clean up abandoned attempts so they don't pile up.
  for (const f of factors?.all ?? []) {
    if (f.factor_type === "totp" && f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `INNOVA Admin ${Date.now()}`,
    issuer: "INNOVA Admin",
  });
  if (error || !data) return { error: "No se pudo iniciar la configuración. Inténtalo de nuevo." };

  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

const codeSchema = z.object({
  factorId: z.uuid(),
  code: z.string().regex(/^\d{6}$/),
});

export async function verifyTotp(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getAdminSession();
  if (session.status === "ok") redirect("/admin");
  if (session.status !== "needs-mfa") redirect("/admin/login");

  const parsed = codeSchema.safeParse({
    factorId: formData.get("factorId"),
    code: String(formData.get("code") ?? "").replace(/\s/g, ""),
  });
  if (!parsed.success) return { error: "Ingresa el código de 6 dígitos." };

  if (!(await rateLimit(`mfa:user:${session.userId}`, 5, 5 * 60))) return { error: TOO_MANY };

  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: parsed.data.factorId,
    code: parsed.data.code,
  });
  if (error) return { error: "Código incorrecto o vencido." };

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
