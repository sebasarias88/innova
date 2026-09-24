"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { services } from "@/lib/services";
import { waLink } from "@/lib/site";

/** DEMO: el formulario abre WhatsApp. Al aprobar el proyecto se conecta a Supabase + correo. */
export function ContactForm() {
  const [f, setF] = useState({ name: "", phone: "", city: "Armenia", service: services[0].name, msg: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hola INNOVA 👋\n\n👤 ${f.name}\n📞 ${f.phone}\n📍 ${f.city}\n🔧 Servicio: ${f.service}\n\n${f.msg}`;
    window.open(waLink(text), "_blank");
  };

  const input = "mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/35 focus:border-lime-400 focus:outline-none";
  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      <label className="block">
        <Lbl>Nombre</Lbl>
        <input required value={f.name} onChange={set("name")} placeholder="Tu nombre" className={input} />
      </label>
      <label className="block">
        <Lbl>Teléfono</Lbl>
        <input required value={f.phone} onChange={set("phone")} placeholder="300 000 0000" inputMode="tel" className={input} />
      </label>
      <label className="block">
        <Lbl>Ciudad</Lbl>
        <input value={f.city} onChange={set("city")} className={input} />
      </label>
      <label className="block">
        <Lbl>Servicio de interés</Lbl>
        <select value={f.service} onChange={set("service")} className={input + " appearance-none"}>
          {services.map((s) => (
            <option key={s.slug} className="bg-navy-900">
              {s.name}
            </option>
          ))}
          <option className="bg-navy-900">Varios servicios</option>
        </select>
      </label>
      <label className="block sm:col-span-2">
        <Lbl>¿Cómo te podemos ayudar?</Lbl>
        <textarea value={f.msg} onChange={set("msg")} rows={5} placeholder="Cuéntanos sobre tu proyecto…" className={input + " resize-none"} />
      </label>
      <button type="submit" className="flex items-center justify-center gap-2 rounded-full bg-lime-400 px-8 py-4 font-semibold text-navy-900 transition-colors hover:bg-white sm:col-span-2 sm:justify-self-start">
        Enviar solicitud <Send className="size-4" />
      </button>
    </form>
  );
}
function Lbl({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">{children}</span>;
}
