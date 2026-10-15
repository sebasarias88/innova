"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { checkbox, dbError, fail, firstIssue, formToObject, intField, money, ok, optionalText, requiredText, uuid, type ActionResult } from "@/lib/admin/actions";

const schema = z.object({
  name: requiredText("El nombre", 2, 80),
  description: optionalText(280),
  price_mode: z.enum(["free", "fixed", "agreed"]),
  price: money,
  is_pickup: checkbox,
  is_active: checkbox,
  sort_order: intField(-9999, 9999),
});

export async function saveZone(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse(formToObject(formData));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const { price_mode, price, ...data } = parsed.data;

  // free → 0 · fixed → amount · agreed ("a convenir") → NULL
  let finalPrice: number | null = null;
  if (price_mode === "free") finalPrice = 0;
  if (price_mode === "fixed") {
    if (!price) return fail("Escribe el valor del envío.");
    if (price > 10_000_000) return fail("El valor del envío es demasiado alto.");
    finalPrice = price;
  }

  const supabase = await createClient();
  const row = { ...data, price: finalPrice };
  const { error } = id ? await supabase.from("shipping_zones").update(row).eq("id", id) : await supabase.from("shipping_zones").insert(row);
  if (error) return fail(dbError(error));

  revalidatePath("/admin/shipping");
  return ok(id ? "Zona actualizada." : "Zona creada.");
}

export async function deleteZone(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Identificador no válido.");
  const supabase = await createClient();
  // Orders keep a snapshot of the zone name and cost, so deleting is safe.
  const { error } = await supabase.from("shipping_zones").delete().eq("id", id);
  if (error) return fail(dbError(error, "No se pudo eliminar."));
  revalidatePath("/admin/shipping");
  return ok();
}
