"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Pausa las animaciones CSS de las secciones que no están en pantalla.
 * Marca cada <section> fuera de vista con [data-offscreen]; en globals.css
 * esas animaciones quedan en pausa, así el celular no gasta CPU/GPU en lo que no se ve.
 */
export function AnimationGate() {
  const pathname = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.removeAttribute("data-offscreen");
          else e.target.setAttribute("data-offscreen", "");
        }
      },
      { rootMargin: "150px 0px" },
    );
    const watch = () => document.querySelectorAll("main section, footer").forEach((el) => io.observe(el));
    watch();
    const mo = new MutationObserver(watch);
    const main = document.querySelector("main");
    if (main) mo.observe(main, { childList: true, subtree: false });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
  return null;
}
