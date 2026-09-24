import Link from "next/link";
import clsx from "clsx";
import type { ReactNode } from "react";

type Variant = "lime" | "royal" | "ghost" | "light" | "dark";

const styles: Record<Variant, string> = {
  lime: "bg-lime-400 text-navy-900 hover:bg-white",
  royal: "bg-royal-500 text-white hover:bg-royal-400",
  ghost: "border border-white/20 text-white hover:border-lime-400 hover:text-lime-400 backdrop-blur",
  light: "bg-white text-navy-900 hover:bg-lime-400",
  dark: "bg-navy-900 text-white hover:bg-royal-500",
};

type Props = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
  icon?: ReactNode;
};

export function Button({ href, children, variant = "lime", className, external, icon }: Props) {
  const cls = clsx(
    "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-6 py-3.5 text-sm font-semibold tracking-tight transition-colors duration-300",
    styles[variant],
    className,
  );
  const inner = (
    <>
      <span className="relative z-10 flex items-center gap-2.5">{children}</span>
      {icon && (
        <span className="relative z-10 grid size-6 place-items-center rounded-full bg-current/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-rotate-45">
          {icon}
        </span>
      )}
    </>
  );
  if (external)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
