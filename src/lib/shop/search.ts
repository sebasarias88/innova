/**
 * Turns what the customer typed into search words that match products.search_text
 * (lowercase, without accents): "Cámara  IP" → ["camara", "ip"]. Every word must
 * appear, in any order. Characters with meaning in PostgREST filters are removed.
 */
export function searchWords(q: string | undefined): string[] {
  if (!q) return [];
  return q
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[%_,()*\\"'.:]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6)
    .map((w) => w.slice(0, 40));
}
