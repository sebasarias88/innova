import { HeroCCTV } from "@/components/home/HeroCCTV";
import { Stats } from "@/components/home/Stats";
import { Ecosystem } from "@/components/home/Ecosystem";
import { ServicesBento } from "@/components/home/ServicesBento";
import { Audience } from "@/components/home/Audience";
import { Process } from "@/components/home/Process";
import { SolarTeaser } from "@/components/home/SolarTeaser";
import { ProjectsRail } from "@/components/home/ProjectsRail";
import { WhyUs } from "@/components/home/WhyUs";
import { Coverage } from "@/components/home/Coverage";
import { CtaBand } from "@/components/layout/CtaBand";
import { Faq } from "@/components/ui/Faq";
import { Eyebrow } from "@/components/ui/Eyebrow";

const faqs = [
  { q: "¿La visita técnica tiene costo?", a: "La visita de diagnóstico para proyectos en Armenia y el área metropolitana no tiene costo. Evaluamos tu espacio y te entregamos una propuesta clara." },
  { q: "¿Trabajan fuera del Quindío?", a: "Sí. Tenemos disponibilidad a nivel nacional y atendemos proyectos en todo el Eje Cafetero y otras ciudades de Colombia." },
  { q: "¿Ofrecen garantía?", a: "Todos nuestros productos e instalaciones tienen respaldo en garantía y servicio postventa, además de planes de mantenimiento preventivo." },
  { q: "¿Puedo integrar varios servicios en un solo proyecto?", a: "Esa es nuestra especialidad: cámaras, puertas, domótica, solar, red y UPS diseñados para funcionar juntos, con un solo proveedor responsable." },
  { q: "¿Cómo solicito una cotización?", a: "Escríbenos por WhatsApp, usa la herramienta Arma tu sistema o llena el formulario de contacto. Te respondemos el mismo día." },
];

export default function Home() {
  return (
    <>
      <HeroCCTV />
      <Stats />
      <Ecosystem />
      <ServicesBento />
      <Audience />
      <Process />
      <SolarTeaser />
      <ProjectsRail />
      <WhyUs />
      <Coverage />
      <section className="bg-ice-50 py-16 text-navy-900 sm:py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <Eyebrow dark>Preguntas frecuentes</Eyebrow>
            <h2 className="mt-5 text-balance text-4xl font-bold leading-[1] tracking-tight sm:text-5xl">Resolvemos tus dudas.</h2>
          </div>
          <Faq items={faqs} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
