import { SHIELD, WORDMARK, TAGLINE } from "./logo-paths";

type Props = { className?: string; variant?: "full" | "mark"; accent?: boolean };

/** Logo INNOVA vectorizado. Hereda el color con `currentColor`. */
export function Logo({ className, variant = "full", accent }: Props) {
  if (variant === "mark") {
    return (
      <svg viewBox="0 0 1220 1360" className={className} role="img" aria-label="INNOVA">
        <path d={SHIELD} fill="currentColor" fillRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 4720 1360" className={className} role="img" aria-label="INNOVA Seguridad y Sistemas">
      <path d={SHIELD} fill={accent ? "var(--color-royal-400)" : "currentColor"} fillRule="evenodd" />
      <path d={WORDMARK} transform="translate(1380 200)" fill="currentColor" fillRule="evenodd" />
      <path d={TAGLINE} transform="translate(1420 980)" fill="currentColor" fillRule="evenodd" opacity={0.75} />
    </svg>
  );
}
