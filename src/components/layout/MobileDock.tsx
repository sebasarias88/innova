"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Phone, Sparkles } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { site, waLink } from "@/lib/site";

/** Barra de acciones fija en móvil (reemplaza el botón flotante) */
export function MobileDock() {
  const pathname = usePathname();
  if (pathname === "/arma-tu-sistema") return null;
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 1.2, type: "spring", bounce: 0.25 }}
      className="fixed inset-x-3 bottom-3 z-40 sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Acciones rápidas"
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-[1.4rem] border border-white/10 bg-navy-900/90 p-2 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <a
          href={`tel:+${site.phones[0].raw}`}
          aria-label="Llamar"
          className="grid size-12 place-items-center rounded-2xl bg-white/5 text-white active:scale-95"
        >
          <Phone className="size-5" />
        </a>
        <a
          href={waLink("Hola INNOVA 👋 Quiero una asesoría personalizada.")}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#25D366] font-semibold text-white active:scale-[0.98]"
        >
          <span className="absolute inset-0 -translate-x-full animate-[shine_3.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <WhatsAppIcon className="relative size-5" />
          <span className="relative">WhatsApp</span>
        </a>
        <Link
          href="/arma-tu-sistema"
          className="flex h-12 items-center gap-1.5 rounded-2xl bg-lime-400 px-4 text-sm font-semibold text-navy-900 active:scale-95"
        >
          <Sparkles className="size-4" /> Cotizar
        </Link>
      </div>
    </motion.nav>
  );
}
