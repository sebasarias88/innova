import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { services } from "@/lib/services";
import { cities } from "@/lib/cities";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

async function productUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const { data } = await createPublicClient().from("products").select("slug, updated_at").limit(1000);
    return (data ?? []).map((p) => ({ url: `${site.url}/tienda/${p.slug}`, lastModified: p.updated_at }));
  } catch {
    return []; // the sitemap must never fail because of the database
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = ["", "/servicios", "/tienda", "/calculadora-solar", "/proyectos", "/nosotros", "/contacto", "/agendar"];
  return [
    ...base.map((p) => ({ url: site.url + p })),
    ...services.map((s) => ({ url: `${site.url}/servicios/${s.slug}` })),
    ...cities.map((c) => ({ url: `${site.url}/cobertura/${c.slug}` })),
    ...(await productUrls()),
  ];
}
