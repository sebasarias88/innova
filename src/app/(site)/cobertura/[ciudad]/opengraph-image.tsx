import { cities, getCity } from "@/lib/cities";
import { brandOg, ogSize } from "@/lib/og";

// Built once at deploy time (no file reads at request time).
export function generateStaticParams() {
  return cities.map((c) => ({ ciudad: c.slug }));
}

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Cámaras de seguridad, energía solar y automatización — INNOVA Seguridad y Sistemas";

export default async function Image({ params }: { params: Promise<{ ciudad: string }> }) {
  const c = getCity((await params).ciudad);
  return brandOg({
    eyebrow: "Cobertura local",
    title: c ? `Cámaras de seguridad en ${c.name}` : "Cámaras de seguridad en el Eje Cafetero",
    subtitle: "Instalación de CCTV, energía solar, puertas automáticas, domótica y UPS. Asesoría sin costo.",
  });
}
