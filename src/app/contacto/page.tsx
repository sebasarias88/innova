import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/components/tools/ContactForm";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { site, waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contáctanos para una asesoría personalizada. WhatsApp 304 355 0891 · Carrera 19A # 9-06, Armenia, Quindío.",
};

export default function ContactoPage() {
  return (
    <>
      <PageHero
        eyebrow="Contáctanos hoy mismo"
        title={
          <>
            ¿Necesitas <span className="text-lime-400">asesoría personalizada?</span>
          </>
        }
        text="En INNOVA Seguridad y Sistemas tu tranquilidad es nuestra prioridad. Escríbenos y un técnico te responde el mismo día."
      />

      <section className="pb-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {site.phones.map((p, i) => (
              <a
                key={p.raw}
                href={waLink("Hola INNOVA 👋 Quiero una asesoría personalizada.", p.raw)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-[#25D366]/60"
              >
                <span className="grid size-14 place-items-center rounded-2xl bg-[#25D366] text-white">
                  <WhatsAppIcon className="size-7" />
                </span>
                <span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">WhatsApp {i === 0 ? "ventas" : "soporte"}</span>
                  <span className="block text-2xl font-bold tracking-tight text-white">{p.label}</span>
                </span>
              </a>
            ))}
            <Card icon={<Mail className="size-6" />} label="Correo" value={site.email} href={`mailto:${site.email}`} />
            <Card icon={<InstagramIcon className="size-6" />} label="Instagram" value={site.instagram.handle} href={site.instagram.url} />
            <Card icon={<MapPin className="size-6" />} label="Dirección" value={site.address} />
            <Card icon={<Clock className="size-6" />} label="Horario" value={site.hours} />
            <Card icon={<Phone className="size-6" />} label="Llámanos" value={site.phones[0].label} href={`tel:+${site.phones[0].raw}`} />
          </div>

          <div className="min-w-0 space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-navy-900/60 p-6 backdrop-blur-xl sm:p-10">
              <h2 className="text-3xl font-bold tracking-tight text-white">Escríbenos</h2>
              <p className="mt-2 mb-8 text-white/55">Completa el formulario y continúa la conversación por WhatsApp.</p>
              <ContactForm />
            </div>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10">
              <iframe
                title="Ubicación INNOVA"
                src={`https://www.google.com/maps?q=${encodeURIComponent(site.mapsQuery)}&output=embed`}
                className="h-80 w-full grayscale invert-[.92] hue-rotate-180"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Card({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const inner = (
    <>
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-royal-500 text-white">{icon}</span>
      <span className="min-w-0">
        <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</span>
        <span className="block break-all text-base font-semibold text-white sm:text-lg">{value}</span>
      </span>
    </>
  );
  const cls = "flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-lime-400/50 sm:gap-5 sm:p-6";
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
