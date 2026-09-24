import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { SystemBuilder } from "@/components/tools/SystemBuilder";

export const metadata: Metadata = {
  title: "Arma tu sistema",
  description: "Diseña en 60 segundos tu sistema de seguridad, energía solar y automatización y recibe una cotización por WhatsApp.",
};

export default function ArmaTuSistemaPage() {
  return (
    <>
      <PageHero
        eyebrow="Herramienta interactiva"
        title={
          <>
            Arma tu sistema <span className="text-lime-400">en 60 segundos.</span>
          </>
        }
        text="Responde 3 preguntas y te mostramos una propuesta con equipos y cantidades. Luego la envías a un asesor por WhatsApp con un clic."
      />
      <section className="pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Suspense>
            <SystemBuilder />
          </Suspense>
        </div>
      </section>
    </>
  );
}
