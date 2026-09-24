/* eslint-disable @next/next/no-img-element */

type Tone = "light" | "white" | "navy";
type Props = { className?: string; variant?: "full" | "mark"; tone?: Tone; priority?: boolean };

/**
 * Logo INNOVA como archivo SVG estático (public/brand), optimizado con SVGO (~12 KB).
 * Se sirve una sola vez y queda en caché: no se repite dentro del HTML ni del JS.
 */
export function Logo({ className, variant = "full", tone = "light", priority }: Props) {
  const src =
    variant === "mark"
      ? tone === "navy" ? "/brand/mark-navy.svg" : "/brand/mark-white.svg"
      : `/brand/logo-${tone}.svg`;
  const [w, h] = variant === "mark" ? [1220, 1360] : [4720, 1360];
  return (
    <img
      src={src}
      width={w}
      height={h}
      alt={variant === "mark" ? "INNOVA" : "INNOVA Seguridad y Sistemas"}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      draggable={false}
    />
  );
}
