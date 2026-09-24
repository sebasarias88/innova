"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { waLink } from "@/lib/site";

export function WhatsAppFab() {
  const [bubble, setBubble] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBubble(true), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed bottom-7 right-7 z-40 hidden items-end gap-3 sm:flex">
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="relative mb-2 hidden max-w-[240px] rounded-2xl rounded-br-sm bg-white p-4 text-sm text-navy-900 shadow-2xl sm:block"
          >
            <button onClick={() => setBubble(false)} className="absolute right-2 top-2 text-navy-900/40 hover:text-navy-900" aria-label="Cerrar">
              <X className="size-4" />
            </button>
            <p className="font-semibold">¿Necesitas asesoría?</p>
            <p className="mt-1 text-navy-900/70">Un técnico te responde por WhatsApp en minutos.</p>
          </motion.div>
        )}
      </AnimatePresence>
      <a
        href={waLink("Hola INNOVA 👋 Quiero una asesoría personalizada.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="relative grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-transform hover:scale-105"
      >
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-[#25D366]" />
        <WhatsAppIcon className="relative size-7" />
      </a>
    </div>
  );
}
