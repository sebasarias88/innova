import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { SHOP_TAG } from "@/lib/shop/queries";
import { PROJECTS_TAG } from "@/lib/public-projects";

/** Refresh the public shop (cached catalog data, catalog, product pages and home) after an admin change. */
export function revalidateShop() {
  revalidateTag(SHOP_TAG, { expire: 0 });
  revalidatePath("/tienda", "layout");
  revalidatePath("/");
  revalidateProjects();
}

/** Refresh the public portfolio (/proyectos) after a project or one of its photos changes. */
export function revalidateProjects() {
  revalidateTag(PROJECTS_TAG, { expire: 0 });
  revalidatePath("/proyectos");
}
