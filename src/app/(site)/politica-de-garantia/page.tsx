import type { Metadata } from "next";
import Link from "next/link";
import { Bullets, LegalPage, Strong } from "@/components/legal/LegalPage";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de garantía de equipos e instalaciones",
  description:
    "Garantía de 3 meses en instalaciones y de 1 año (según fabricante) en equipos de INNOVA Seguridad y Sistemas: qué cubre, exclusiones y cómo solicitarla.",
  alternates: { canonical: "/politica-de-garantia" },
};

const mail = (
  <a href={`mailto:${legal.email}`} className="text-lime-400 hover:text-white">
    {legal.email}
  </a>
);

export default function WarrantyPage() {
  return (
    <LegalPage
      eyebrow="Garantía y postventa"
      title="Política de garantía de equipos e instalaciones"
      intro="Respaldamos los equipos que suministramos y los trabajos que hace nuestro personal. Aquí te contamos qué cubre la garantía, por cuánto tiempo y cómo solicitarla."
      sections={[
        {
          id: "plazos",
          title: "Plazos de garantía",
          body: (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-lime-400/30 bg-lime-400/5 p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime-400">Instalación</p>
                  <p className="mt-2 text-3xl font-bold text-white">3 meses</p>
                  <p className="mt-2 text-sm text-white/65">
                    Garantía comercial sobre los trabajos de instalación, conexión, montaje y configuración, contados desde la entrega del servicio.
                  </p>
                </div>
                <div className="rounded-2xl border border-royal-400/30 bg-royal-500/10 p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-royal-300">Equipos</p>
                  <p className="mt-2 text-3xl font-bold text-white">1 año</p>
                  <p className="mt-2 text-sm text-white/65">Normalmente, sujeto al plazo informado por el fabricante o proveedor y a la garantía legal correspondiente.</p>
                </div>
              </div>
              <p>
                Ambas garantías son <Strong>independientes</Strong> y cubren únicamente las fallas que correspondan a su respectivo alcance, sin perjuicio de los plazos y derechos de
                garantía legal aplicables (Ley 1480 de 2011).
              </p>
            </>
          ),
        },
        {
          id: "alcance",
          title: "Objetivo y alcance",
          body: (
            <>
              <p>
                {legal.tradeName} garantiza los equipos suministrados y los trabajos de instalación, conexión, montaje y configuración realizados directamente por su personal,
                conforme a esta política y a la legislación colombiana vigente.
              </p>
              <p>La garantía no cubre equipos, materiales o instalaciones preexistentes que no hayan sido suministrados o intervenidos por la empresa.</p>
            </>
          ),
        },
        {
          id: "terceros",
          title: "Intervención de terceros",
          body: (
            <>
              <p>
                La garantía sobre los componentes o trabajos afectados podrá excluirse cuando se compruebe que terceros ajenos a la empresa realizaron modificaciones, reparaciones o
                manipulaciones que causaron o contribuyeron a la falla.
              </p>
              <p>
                Esta exclusión requiere sustento técnico y no afecta automáticamente los componentes o trabajos no relacionados con la intervención, ni los derechos legales del
                cliente.
              </p>
            </>
          ),
        },
        {
          id: "electricos",
          title: "Daños eléctricos",
          body: (
            <>
              <p>
                No se cubrirán daños causados por cortocircuitos externos, rayos, sobretensiones, variaciones de voltaje, fallas de puesta a tierra, conexiones incorrectas o
                alimentación fuera de las especificaciones del fabricante, cuando se determine técnicamente su relación con la falla y legalmente proceda la exclusión.
              </p>
              <p>Esto no excluye defectos de fabricación ni fallas atribuibles a instalaciones incorrectas realizadas por la empresa.</p>
            </>
          ),
        },
        {
          id: "exclusiones",
          title: "Otras exclusiones",
          body: (
            <>
              <p>La garantía no cubre daños atribuibles a:</p>
              <Bullets
                items={[
                  "Golpes, caídas, vandalismo, robo o manipulación indebida.",
                  "Humedad, inundaciones, corrosión o condiciones ambientales fuera de las especificaciones del equipo.",
                  "Uso inadecuado, sobrecargas o incumplimiento de las instrucciones del fabricante.",
                  "Modificaciones de cableado, software o configuración realizadas por terceros que causen la falla.",
                  "Fallas de equipos, redes, servicios o accesorios ajenos al alcance contratado.",
                  "Desgaste normal de consumibles, como baterías y fusibles, cuando no exista un defecto cubierto.",
                ]}
              />
              <p>Las exclusiones se aplicarán según las circunstancias verificadas y la normativa vigente.</p>
            </>
          ),
        },
        {
          id: "equipos-cliente",
          title: "Equipos suministrados por el cliente",
          body: (
            <>
              <p>
                La empresa garantiza la correcta ejecución de los procedimientos que realice, pero no asume la garantía de fabricación ni los defectos preexistentes de equipos
                suministrados por el cliente, sin perjuicio de las responsabilidades legales aplicables.
              </p>
              <p>Cualquier incompatibilidad o defecto detectado será informado al cliente.</p>
            </>
          ),
        },
        {
          id: "solicitud",
          title: "Cómo solicitar la garantía",
          body: (
            <>
              <p>
                Contáctanos por WhatsApp al {legal.whatsappLabel} o al correo {mail}, identifica el servicio o equipo (con tu código de pedido o factura si lo tienes) y describe la
                falla. Podremos pedirte fotografías, videos o una inspección técnica para determinar su causa.
              </p>
              <p>
                Si la falla está cubierta, procederemos conforme a las obligaciones aplicables (reparación, cambio o devolución del dinero, según la ley). Si no está cubierta, te
                informaremos el diagnóstico y te presentaremos una cotización para la reparación cuando corresponda.
              </p>
            </>
          ),
        },
        {
          id: "visitas",
          title: "Visitas técnicas y desplazamientos",
          body: (
            <p>
              Si se determina que la falla no está cubierta, los trabajos correctivos y desplazamientos podrán cotizarse por separado, informándote previamente y obteniendo tu
              aceptación cuando corresponda. Se respetarán las obligaciones legales relacionadas con la atención de garantías.
            </p>
          ),
        },
        {
          id: "mantenimiento",
          title: "Mantenimiento y recomendaciones",
          body: (
            <>
              <p>
                El cliente deberá utilizar los equipos correctamente, seguir las recomendaciones del fabricante y mantener condiciones adecuadas de funcionamiento. Recomendamos
                realizar mantenimientos preventivos y disponer de protecciones eléctricas apropiadas (reguladores, UPS, polo a tierra).
              </p>
              <p>La falta de mantenimiento o de protecciones no anula automáticamente la garantía; se evaluará su relación con la falla presentada.</p>
              <p>
                ¿Necesitas un mantenimiento preventivo?{" "}
                <Link href="/agendar" className="text-lime-400 hover:text-white">
                  Agenda una visita técnica
                </Link>
                .
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
