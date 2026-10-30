import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { waLink } from "@/lib/site";
import { newTab } from "@/lib/whatsapp";

export default function NotFound() {
  return (
    <section className="grid min-h-[80vh] place-items-center px-4 pt-24 text-center">
      <div>
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-lime-400">● Señal perdida · Error 404</p>
        <h1 className="mt-6 text-6xl font-bold tracking-tight text-white sm:text-8xl">Sin imagen</h1>
        <p className="mx-auto mt-4 max-w-md text-white/60">Esta cámara no está transmitiendo. La página que buscas no existe o fue movida.</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/">Volver al inicio</Button>
          <a
            href={waLink("Hola, INNOVA 👋 No encontré lo que buscaba en la página. ¿Me pueden ayudar?")}
            {...newTab}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-[#25D366] hover:text-[#25D366]"
          >
            <WhatsAppIcon className="size-4" /> Pedir por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
