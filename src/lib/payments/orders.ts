import "server-only";
import type { Json } from "@/lib/supabase/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import type { WompiTransaction } from "./wompi";

export type ApplyResult = "ok" | "duplicate" | "order_not_found" | "amount_mismatch" | "already_paid" | "invalid_currency" | "db_error";

/**
 * Records a payment update for an order. Idempotent (the DB ignores repeats of the
 * same transaction + status) and the DB checks the amount against the order total.
 */
export async function applyTransaction(tx: WompiTransaction, event: string, payload: unknown): Promise<ApplyResult> {
  if (tx.currency !== "COP") return "invalid_currency";
  const { data, error } = await createAdminClient().rpc("apply_payment_event", {
    p_event: event,
    p_transaction_id: tx.id,
    p_reference: tx.reference,
    p_status: tx.status,
    p_amount_in_cents: tx.amount_in_cents,
    p_payload: payload as Json,
  });
  if (error) {
    console.error("[payments] apply_payment_event failed:", error.code, error.message);
    return "db_error";
  }
  return data as ApplyResult;
}

export type PublicOrder = {
  reference: string;
  status: string;
  payment_method: string;
  payment_status: string;
  customer_name: string;
  shipping_zone_name: string;
  shipping_cost: number | null;
  subtotal: number;
  total: number;
  created_at: string;
  items: { name: string; quantity: number; unit_price: number; line_total: number }[];
};

export async function getOrderByReference(reference: string): Promise<PublicOrder | null> {
  if (!/^INN-[A-Z0-9]{12}$/.test(reference)) return null;
  const { data, error } = await createAdminClient().rpc("get_order_by_reference", { p_reference: reference });
  if (error) console.error("[payments] order lookup failed:", error.message);
  return (data as PublicOrder | null) ?? null;
}
