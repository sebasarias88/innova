import { getService, services } from "@/lib/services";
import { brandOg, ogSize } from "@/lib/og";

// Built once at deploy time (no file reads at request time).
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Servicio de INNOVA Seguridad y Sistemas en Armenia y el Eje Cafetero";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const s = getService((await params).slug);
  return brandOg({
    eyebrow: "Servicio profesional",
    title: s?.name ?? "Seguridad y sistemas",
    subtitle: s?.short,
  });
}
