"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import clsx from "clsx";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { nav, site, waLink } from "@/lib/site";
import { services } from "@/lib/services";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Cierra menús al cambiar de ruta
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
    setMega(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled || mega ? "bg-navy-950/80 py-3 backdrop-blur-xl" : "py-5",
        )}
        onMouseLeave={() => setMega(false)}
      >
        <div
          className={clsx(
            "absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent transition-opacity",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
          <Link href="/" aria-label="INNOVA inicio" className="relative z-10 shrink-0 text-white">
            <Logo className="h-9 w-auto sm:h-10" accent />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item) =>
              item.href === "/servicios" ? (
                <button
                  key={item.href}
                  onMouseEnter={() => setMega(true)}
                  onClick={() => setMega((v) => !v)}
                  className={clsx(
                    "flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    pathname.startsWith("/servicios") || mega ? "text-lime-400" : "text-white/80 hover:text-white",
                  )}
                >
                  {item.label}
                  <ChevronDown className={clsx("size-4 transition-transform", mega && "rotate-180")} />
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setMega(false)}
                  className={clsx(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    pathname === item.href ? "text-lime-400" : "text-white/80 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={waLink("Hola INNOVA 👋 Quiero una asesoría personalizada.")}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-white sm:flex"
            >
              <WhatsAppIcon className="size-4" />
              Cotizar ahora
            </a>
            <button
              onClick={() => setOpen(true)}
              className="grid size-11 place-items-center rounded-full border border-white/15 text-white lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>

        {/* Mega menú de servicios */}
        <AnimatePresence>
          {mega && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-x-0 top-full hidden lg:block"
            >
              <div className="mx-auto max-w-7xl px-6 pt-2">
                <div className="grid grid-cols-[1fr_300px] gap-2 rounded-3xl border border-white/10 bg-navy-900/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {services.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/servicios/${s.slug}`}
                        className="group flex items-start gap-4 rounded-2xl p-4 transition-colors hover:bg-white/5"
                      >
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-royal-500/15 text-royal-300 transition-colors group-hover:bg-lime-400 group-hover:text-navy-900">
                          <Icon name={s.icon} className="size-5" />
                        </span>
                        <span>
                          <span className="block font-semibold text-white">{s.name}</span>
                          <span className="mt-0.5 block text-sm leading-snug text-white/55">{s.short}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/arma-tu-sistema"
                    className="group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-royal-500 p-6"
                  >
                    <div className="grid-bg absolute inset-0 opacity-40" />
                    <span className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-lime-400">
                      Nuevo · Herramienta
                    </span>
                    <span className="relative mt-2 text-2xl font-bold leading-tight text-white">
                      Arma tu sistema en 60 segundos
                    </span>
                    <span className="relative mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
                      Empezar <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Menú móvil */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-navy-950 lg:hidden"
            initial={{ clipPath: "circle(0% at 95% 4%)" }}
            animate={{ clipPath: "circle(150% at 95% 4%)" }}
            exit={{ clipPath: "circle(0% at 95% 4%)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid-bg absolute inset-0 opacity-50" />
            <div className="relative flex items-center justify-between px-4 py-5 sm:px-6">
              <Logo className="h-9 w-auto text-white" accent />
              <button
                onClick={() => setOpen(false)}
                className="grid size-11 place-items-center rounded-full border border-white/15 text-white"
                aria-label="Cerrar menú"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="relative flex flex-1 flex-col gap-1 overflow-y-auto px-4 pb-8 sm:px-6">
              {[{ label: "Inicio", href: "/" }, ...nav].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center justify-between border-b border-white/10 py-4 text-3xl font-semibold tracking-tight text-white"
                  >
                    {item.label}
                    <ArrowUpRight className="size-6 text-lime-400" />
                  </Link>
                </motion.div>
              ))}
              <div className="mt-auto grid gap-3 pt-8">
                <a
                  href={waLink("Hola INNOVA 👋 Quiero una asesoría personalizada.")}
                  className="flex items-center justify-center gap-2 rounded-full bg-lime-400 py-4 font-semibold text-navy-900"
                >
                  <WhatsAppIcon className="size-5" /> Escríbenos por WhatsApp
                </a>
                <p className="text-center font-mono text-xs text-white/50">{site.address}</p>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
