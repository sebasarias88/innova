import type { MetadataRoute } from "next";
import { services } from "@/lib/services";
import { cities } from "@/lib/cities";
import { siteUrl } from "@/lib/site-url";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

async function productUrls(base: string): Promise<MetadataRoute.Sitemap> {
  try {
    // RLS only returns published products.
    const { data } = await createPublicClient().from("products").select("slug, updated_at").limit(5000);
    return (data ?? []).map((p) => ({ url: `${base}/tienda/${p.slug}`, lastModified: p.updated_at, changeFrequency: "weekly", priority: 0.6 }));
  } catch {
    return []; // the sitemap must never fail because of the database
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const pages: [string, number][] = [
    ["", 1],
    ["/servicios", 0.9],
    ["/tienda", 0.9],
    ["/agendar", 0.8],
    ["/calculadora-solar", 0.7],
    ["/proyectos", 0.6],
    ["/nosotros", 0.5],
    ["/contacto", 0.7],
    ["/terminos-y-condiciones", 0.2],
    ["/politica-de-privacidad", 0.2],
    ["/politica-de-garantia", 0.3],
  ];
  return [
    ...pages.map(([p, priority]) => ({ url: base + p, priority })),
    ...services.map((s) => ({ url: `${base}/servicios/${s.slug}`, priority: 0.9 })),
    ...cities.map((c) => ({ url: `${base}/cobertura/${c.slug}`, priority: 0.7 })),
    ...(await productUrls(base)),
  ];
}
