import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { SHOP_TAG } from "@/lib/shop/queries";

/** Refresh the public shop (cached catalog data, catalog, product pages and home) after an admin change. */
export function revalidateShop() {
  revalidateTag(SHOP_TAG, { expire: 0 });
  revalidatePath("/tienda", "layout");
  revalidatePath("/");
}
