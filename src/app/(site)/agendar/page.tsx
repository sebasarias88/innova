import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { getAvailableSlots } from "@/lib/bookings/slots";
import { services } from "@/lib/services";
import { getSiteSettings } from "@/lib/shop/queries";
import { site } from "@/lib/site";
import { BookingFlow } from "./BookingFlow";

export const metadata: Metadata = {
  title: "Agendar visita técnica",
  description:
    "Agenda en línea tu visita técnica de cámaras de seguridad, energía solar, automatización de puertas, domótica, UPS o soporte informático en Armenia y el Eje Cafetero.",
  alternates: { canonical: "/agendar" },
};

// Free slots change every time someone books.
export const dynamic = "force-dynamic";

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ servicio?: string }> }) {
  const { servicio } = await searchParams;
  const [slots, settings] = await Promise.all([getAvailableSlots(), getSiteSettings()]);
  const options = services.map((s) => ({ slug: s.slug, name: s.name, short: s.short, icon: s.icon }));
  const initialService = options.some((s) => s.slug === servicio) ? servicio! : null;

  return (
    <>
      <PageHero
        eyebrow="Agenda en línea"
        title={
          <>
            Agenda tu <span className="text-lime-400">visita técnica</span>
          </>
        }
        text="Elige el servicio, el día y la hora que mejor te quede entre los horarios libres. Apartamos tu espacio y te confirmamos la cita por WhatsApp."
      />
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <BookingFlow services={options} initialSlots={slots} initialService={initialService} whatsapp={settings?.whatsapp ?? site.phone.raw} />
        </div>
      </section>
    </>
  );
}
