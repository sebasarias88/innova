import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="grid min-h-[80vh] place-items-center px-4 pt-24 text-center">
      <div>
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-lime-400">● Señal perdida · Error 404</p>
        <h1 className="mt-6 text-6xl font-bold tracking-tight text-white sm:text-8xl">Sin imagen</h1>
        <p className="mx-auto mt-4 max-w-md text-white/60">Esta cámara no está transmitiendo. La página que buscas no existe o fue movida.</p>
        <Button href="/" className="mt-10">Volver al inicio</Button>
      </div>
    </section>
  );
}
