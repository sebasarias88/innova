import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { legal } from "@/lib/legal";

/** Shared layout for legal documents: hero, table of contents and readable prose. */
export function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: { id: string; title: string; body: React.ReactNode }[];
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} text={intro} />
      <section className="pb-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[240px_1fr]">
          <nav aria-label="Contenido" className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime-400">Contenido</p>
            <ol className="mt-4 space-y-2 text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex gap-2 text-white/60 transition-colors hover:text-white">
                    <span className="font-mono text-white/35">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-xs text-white/40">Última actualización: {legal.updatedAt}</p>
          </nav>

          <article className="legal-prose min-w-0 space-y-12">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="flex items-baseline gap-3 text-2xl font-bold tracking-tight text-white">
                  <span className="font-mono text-base text-lime-400">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                <div className="mt-4 space-y-4 text-pretty leading-relaxed text-white/75">{s.body}</div>
              </section>
            ))}
            <p className="border-t border-white/10 pt-6 text-sm text-white/45">
              ¿Dudas sobre este documento? Escríbenos a{" "}
              <a href={`mailto:${legal.email}`} className="text-lime-400 hover:text-white">
                {legal.email}
              </a>{" "}
              o revisa también nuestra{" "}
              <Link href="/politica-de-privacidad" className="text-lime-400 hover:text-white">
                política de datos
              </Link>{" "}
              y los{" "}
              <Link href="/terminos-y-condiciones" className="text-lime-400 hover:text-white">
                términos y condiciones
              </Link>
              .
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

/** Bulleted list with the site's styling. */
export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-lime-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-white">{children}</strong>;
}
