import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { services } from "@/lib/services";
import { cities } from "@/lib/cities";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = ["", "/servicios", "/arma-tu-sistema", "/calculadora-solar", "/proyectos", "/nosotros", "/contacto"];
  return [
    ...base.map((p) => ({ url: site.url + p })),
    ...services.map((s) => ({ url: `${site.url}/servicios/${s.slug}` })),
    ...cities.map((c) => ({ url: `${site.url}/cobertura/${c.slug}` })),
  ];
}
