import "server-only";
import { revalidatePath } from "next/cache";

/** Refresh the public shop pages (catalog, product pages and home) after an admin change. */
export function revalidateShop() {
  revalidatePath("/tienda", "layout");
  revalidatePath("/");
}
