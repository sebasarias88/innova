import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { nav, site, waLink } from "@/lib/site";
import { services } from "@/lib/services";
import { cities } from "@/lib/cities";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-navy-950">
      <div className="grid-bg absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo className="h-12 w-auto text-white" accent />
            <p className="mt-6 max-w-sm text-pretty text-white/60">
              Soluciones integrales en seguridad electrónica, energía solar, automatización y redes. {site.slogan}.
            </p>
            <div className="mt-6 flex gap-2">
              <a
                href={waLink("Hola INNOVA 👋")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="grid size-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-lime-400 hover:bg-lime-400 hover:text-navy-900"
              >
                <WhatsAppIcon className="size-5" />
              </a>
              <a
                href={site.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid size-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-lime-400 hover:bg-lime-400 hover:text-navy-900"
              >
                <InstagramIcon className="size-5" />
              </a>
              <a
                href={`mailto:${site.email}`}
                aria-label="Correo"
                className="grid size-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-lime-400 hover:bg-lime-400 hover:text-navy-900"
              >
                <Mail className="size-5" />
              </a>
            </div>
          </div>

          <FooterCol title="Servicios">
            {services.map((s) => (
              <FooterLink key={s.slug} href={`/servicios/${s.slug}`}>
                {s.name}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol title="Empresa">
            {nav.filter((n) => n.href !== "/servicios").map((n) => (
              <FooterLink key={n.href} href={n.href}>
                {n.label}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol title="Contacto">
            <li className="flex gap-3 text-white/70">
              <MapPin className="mt-0.5 size-4 shrink-0 text-lime-400" />
              {site.address}
            </li>
            {site.phones.map((p) => (
              <li key={p.raw}>
                <a href={`tel:+${p.raw}`} className="flex gap-3 text-white/70 transition-colors hover:text-white">
                  <Phone className="mt-0.5 size-4 shrink-0 text-lime-400" />
                  {p.label}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${site.email}`} className="flex gap-3 break-all text-white/70 transition-colors hover:text-white">
                <Mail className="mt-0.5 size-4 shrink-0 text-lime-400" />
                {site.email}
              </a>
            </li>
          </FooterCol>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Cobertura</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/55">
            {cities.map((c) => (
              <Link key={c.slug} href={`/cobertura/${c.slug}`} className="transition-colors hover:text-lime-400">
                Cámaras de seguridad en {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Wordmark gigante */}
        <div className="pointer-events-none mt-14 select-none text-white/[0.04]" aria-hidden>
          <Logo variant="full" className="w-full" />
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-white/40 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} INNOVA Seguridad y Sistemas. Todos los derechos reservados.</p>
          <p className="font-mono">Armenia · Quindío · Colombia</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime-400">{title}</p>
      <ul className="mt-5 space-y-3 text-sm">{children}</ul>
    </div>
  );
}
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-white/70 transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
