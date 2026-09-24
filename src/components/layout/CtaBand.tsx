import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { Logo } from "@/components/brand/Logo";
import { waLink } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

export function CtaBand({
  title = "¿Listo para proteger lo que más te importa?",
  text = "Recibe una asesoría personalizada sin costo. Un técnico de INNOVA te visita, evalúa tu espacio y te entrega una propuesta a tu medida.",
  wa = "Hola INNOVA 👋 Quiero una asesoría personalizada.",
}: {
  title?: string;
  text?: string;
  wa?: string;
}) {
  return (
    <section className="relative px-4 py-14 sm:px-6 sm:py-24">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-royal-500 px-6 py-16 sm:px-14 sm:py-20">
        <div className="grid-bg absolute inset-0 opacity-50" />
        <Logo
          variant="mark"
          className="pointer-events-none absolute -right-16 -top-10 h-[130%] w-auto text-white/[0.07]"
        />
        <div className="relative max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-lime-400">Asesoría personalizada</p>
          <h2 className="mt-4 text-balance text-4xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl">
            {title}
          </h2>
          <p className="mt-6 text-pretty text-lg text-white/80">{text}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href={waLink(wa)} external variant="lime" icon={<WhatsAppIcon className="size-3.5" />}>
              Hablar por WhatsApp
            </Button>
            <Button href="/arma-tu-sistema" variant="ghost" icon={<ArrowRight className="size-3.5" />}>
              Arma tu sistema
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
