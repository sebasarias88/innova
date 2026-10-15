import "server-only";
import { z } from "zod";

// Built-in validation messages in Spanish (the admins read them).
z.config(z.locales.es());

/** Result returned by every admin Server Action (consumed by `useActionState`). */
export type ActionResult = { ok: true; message?: string } | { ok: false; error: string } | undefined;

export const ok = (message?: string): ActionResult => ({ ok: true, message });
export const fail = (error: string): ActionResult => ({ ok: false, error });

/** First validation message in Spanish-friendly form. */
export function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Revisa los datos del formulario.";
}

/** Maps Postgres errors to messages the admin can act on. */
export function dbError(error: { code?: string; message: string } | null, fallback = "No se pudo guardar. Inténtalo de nuevo.") {
  if (!error) return fallback;
  if (error.code === "23505") return "Ya existe un registro con ese identificador (slug o SKU). Usa otro.";
  if (error.code === "23503") return "No se puede eliminar porque otros registros dependen de este.";
  if (error.code === "23514") return "Algún valor no es válido. Revisa precios, textos y formatos.";
  if (error.code === "42501") return "No tienes permiso para esta acción. Vuelve a iniciar sesión.";
  console.error("[admin]", error.code, error.message);
  return fallback;
}

// ── Reusable field parsers for FormData (empty strings → null) ──────────
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres.`)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

export const requiredText = (label: string, min: number, max: number) =>
  z
    .string({ error: `${label} es obligatorio.` })
    .trim()
    .min(min, `${label}: mínimo ${min} caracteres.`)
    .max(max, `${label}: máximo ${max} caracteres.`);

export const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "El slug solo puede tener letras minúsculas, números y guiones.")
  .max(150);

/** "1.250.000" / "1250000" → 1250000 ; "" → null */
export const money = z
  .string()
  .trim()
  .transform((v) => v.replace(/[^\d]/g, ""))
  .transform((v) => (v === "" ? null : Number(v)))
  .refine((v) => v === null || (Number.isSafeInteger(v) && v >= 0 && v <= 1_000_000_000), "Precio no válido.");

// Unchecked checkboxes are absent from FormData, so the key must be optional (Zod 4).
export const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.null()])
  .optional()
  .transform((v) => v === "on" || v === "true");

/** Repeated fields (e.g. spec rows) as an array; absent when there are no rows. */
export const repeated = z
  .unknown()
  .optional()
  .transform((v) => (v == null ? [] : Array.isArray(v) ? v : [v]).map((x) => String(x)));

export const intField = (min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? 0 : Number(v)))
    .refine((v) => Number.isInteger(v) && v >= min && v <= max, `Debe ser un número entre ${min} y ${max}.`);

export const uuid = z.uuid("Identificador no válido.");

/** Turns FormData into a plain object (repeated keys become arrays). */
export function formToObject(formData: FormData) {
  const out: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION")) continue;
    if (key in out) {
      const prev = out[key];
      out[key] = Array.isArray(prev) ? [...prev, value] : [prev, value];
    } else out[key] = value;
  }
  return out;
}
