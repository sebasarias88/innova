import { brandOg, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Calculadora solar de INNOVA: cuántos paneles necesitas y cuánto ahorras";

export default function Image() {
  return brandOg({
    eyebrow: "Calculadora solar",
    title: "¿Cuántos paneles solares necesitas?",
    subtitle: "Calcula tu sistema y tu ahorro en la factura de energía en el Eje Cafetero.",
  });
}
