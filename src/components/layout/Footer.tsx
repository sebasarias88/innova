import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { booking, nav, site, waLink } from "@/lib/site";
import { services } from "@/lib/services";
import { legal, legalLinks } from "@/lib/legal";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-navy-950">
      <div className="grid-bg absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.2fr_1fr_0.9fr_1.3fr] lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <Logo className="h-12 w-auto" />
            <p className="mt-6 max-w-sm text-pretty text-white/60">
              Soluciones integrales en seguridad electrónica, energía solar, automatización y redes. {site.slogan}
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
                href={site.tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="grid size-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-lime-400 hover:bg-lime-400 hover:text-navy-900"
              >
                <TikTokIcon className="size-5" />
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
            <FooterLink href={booking.href}>Agendar visita técnica</FooterLink>
          </FooterCol>

          <FooterCol title="Contacto" className="col-span-2 lg:col-span-1">
            <li className="flex gap-3 text-white/70">
              <MapPin className="mt-0.5 size-4 shrink-0 text-lime-400" />
              {site.address}
            </li>
            <li>
              <a href={`tel:+${site.phone.raw}`} className="flex gap-3 text-white/70 transition-colors hover:text-white">
                <Phone className="mt-0.5 size-4 shrink-0 text-lime-400" />
                {site.phone.label}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex gap-3 text-white/70 transition-colors [overflow-wrap:anywhere] hover:text-white">
                <Mail className="mt-0.5 size-4 shrink-0 text-lime-400" />
                {site.email}
              </a>
            </li>
            <li className="flex gap-3 text-white/70">
              <Clock className="mt-0.5 size-4 shrink-0 text-lime-400" />
              {site.hours}
            </li>
          </FooterCol>
        </div>

        {/* Wordmark gigante */}
        <div className="pointer-events-none mt-12 select-none sm:mt-16" aria-hidden>
          <Logo tone="white" className="h-auto w-full opacity-[0.04]" />
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-white/45 md:flex-row md:items-center md:justify-between md:pr-20">
          <p>
            © {new Date().getFullYear()} INNOVA Seguridad y Sistemas <span className="text-white/25">·</span> Armenia, Quindío
          </p>
          <nav aria-label="Información legal" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href={legalLinks.terms} className="transition-colors hover:text-white">
              Términos y condiciones
            </Link>
            <Link href={legalLinks.warranty} className="transition-colors hover:text-white">
              Garantías
            </Link>
            <Link href={legalLinks.privacy} className="transition-colors hover:text-white">
              Privacidad y cookies
            </Link>
            <a
              href={legal.sic.url}
              target="_blank"
              rel="noopener noreferrer"
              title={legal.sic.name}
              className="rounded-full border border-white/15 px-3 py-1 font-semibold text-white/60 transition-colors hover:border-white/40 hover:text-white"
            >
              SIC · Industria y Comercio
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime-400">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm sm:mt-5 sm:space-y-3">{children}</ul>
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
