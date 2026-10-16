import { brandOg, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Tienda en línea de INNOVA: cámaras de seguridad, alarmas, UPS y más";

export default function Image() {
  return brandOg({
    eyebrow: "Tienda en línea",
    title: "Equipos de seguridad listos para llevar",
    subtitle: "Cámaras, alarmas, UPS, grabadores y motores. Envío gratis en Armenia y pago seguro.",
  });
}
