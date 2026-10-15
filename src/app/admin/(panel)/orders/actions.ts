"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { dbError, fail, firstIssue, formToObject, money, ok, optionalText, uuid, type ActionResult } from "@/lib/admin/actions";

const schema = z.object({
  status: z.enum(["pending", "awaiting_payment", "paid", "confirmed", "shipped", "delivered", "cancelled"], "Estado no válido."),
  internal_notes: optionalText(1000),
  shipping_cost: money.optional(),
});

export async function updateOrder(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Identificador no válido.");
  const parsed = schema.safeParse(formToObject(formData));
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("payment_method, payment_status, shipping_cost").eq("id", id).maybeSingle();
  if (!order) return fail("El pedido no existe.");

  // "Pagado" for online payments is set only by the payment gateway webhook.
  if (parsed.data.status === "paid" && order.payment_method === "wompi" && order.payment_status !== "approved") {
    return fail("Un pago en línea solo se marca como pagado cuando Wompi lo aprueba.");
  }

  const update: { status: string; internal_notes: string | null; shipping_cost?: number | null } = {
    status: parsed.data.status,
    internal_notes: parsed.data.internal_notes,
  };
  // Shipping can only be agreed on WhatsApp orders (the DB recalculates the total).
  if (formData.has("shipping_cost") && order.payment_method === "whatsapp" && parsed.data.shipping_cost !== order.shipping_cost) {
    update.shipping_cost = parsed.data.shipping_cost ?? null;
  }

  const { error } = await supabase.from("orders").update(update).eq("id", id);
  if (error) return fail(dbError(error));
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return ok("Pedido actualizado.");
}
