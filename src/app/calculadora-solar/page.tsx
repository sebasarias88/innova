import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SolarCalculator } from "@/components/tools/SolarCalculator";
import { CtaBand } from "@/components/layout/CtaBand";

export const metadata: Metadata = {
  title: "Calculadora solar",
  description: "Calcula cuántos paneles solares necesitas y cuánto puedes ahorrar en tu factura de energía en Armenia y el Eje Cafetero.",
};

export default function CalculadoraSolarPage() {
  return (
    <>
      <PageHero
        eyebrow="Energía solar"
        image="/img/solar-campo.jpg"
        title={
          <>
            Calcula tu <span className="text-lime-400">ahorro solar.</span>
          </>
        }
        text="Ingresa el valor de tu factura y descubre cuántos paneles necesitas, cuánto ahorrarías y en cuánto tiempo recuperas tu inversión."
      />
      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SolarCalculator />
        </div>
      </section>
      <CtaBand title="Convierte este cálculo en un proyecto real." text="Agenda un estudio técnico sin costo: analizamos tu consumo, tu techo y te entregamos el diseño exacto." wa="Hola INNOVA ☀️ Quiero agendar un estudio solar sin costo." />
    </>
  );
}
