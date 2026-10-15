import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Categories for selects, with the parent name for subcategories. */
export async function getCategoryOptions() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id, name, parent_id").order("sort_order").order("name");
  const all = data ?? [];
  const names = new Map(all.map((c) => [c.id, c.name]));
  const parentsFirst = all.filter((c) => !c.parent_id).flatMap((root) => [root, ...all.filter((c) => c.parent_id === root.id)]);
  return parentsFirst.map((c) => ({ id: c.id, name: c.name, parent: c.parent_id ? (names.get(c.parent_id) ?? null) : null }));
}
