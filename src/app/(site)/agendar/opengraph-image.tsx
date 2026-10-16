import { brandOg, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Agenda en línea tu visita técnica con INNOVA Seguridad y Sistemas";

export default function Image() {
  return brandOg({
    eyebrow: "Agenda en línea",
    title: "Agenda tu visita técnica",
    subtitle: "Elige el día y la hora entre los horarios libres. Te confirmamos por WhatsApp.",
  });
}
