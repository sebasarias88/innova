import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

export type Slot = { start: string; end: string };

const bogotaDate = (offsetDays = 0) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date(Date.now() + offsetDays * 86_400_000));

/** Free slots for the next month (the DB also applies lead time, max days and closed days). */
export async function getAvailableSlots(): Promise<Slot[]> {
  const { data, error } = await createPublicClient().rpc("get_available_slots", { p_from: bogotaDate(), p_to: bogotaDate(31) });
  if (error) console.error("[bookings] slots query failed:", error.message);
  return (data ?? []).map((s) => ({ start: new Date(s.starts_at).toISOString(), end: new Date(s.ends_at).toISOString() }));
}
