import Image from "next/image";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HudCorners } from "@/components/ui/HudCorners";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  text?: string;
  image?: string;
  children?: React.ReactNode;
};

/** Encabezado de páginas internas */
export function PageHero({ eyebrow, title, text, image, children }: Props) {
  return (
    <section className="relative overflow-hidden pb-16 pt-36 sm:pb-24 sm:pt-44">
      {image && (
        <div className="absolute inset-0">
          <Image src={image} alt="" fill priority className="duotone object-cover opacity-30" sizes="100vw" />
          <div className="absolute inset-0 bg-royal-500/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 via-navy-950/70 to-navy-950" />
        </div>
      )}
      <div className="grid-bg absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-6 max-w-4xl text-balance text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-7xl">
          {title}
        </h1>
        {text && <p className="mt-6 max-w-2xl text-pretty text-lg text-white/70">{text}</p>}
        {children}
      </div>
      <HudCorners className="m-4 hidden text-white/15 sm:block" size={28} />
    </section>
  );
}
