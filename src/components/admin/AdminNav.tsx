"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { adminNav } from "@/lib/admin/nav";
import { useLinkStatus } from "next/link";
import { LoaderCircle, type LucideIcon } from "lucide-react";

/** The section icon turns into a spinner while that page loads. */
function NavIcon({ icon: Icon }: { icon: LucideIcon }) {
  const { pending } = useLinkStatus();
  return pending ? <LoaderCircle aria-label="Cargando…" className="size-4 motion-safe:animate-spin" /> : <Icon className="size-4" />;
}

/** Vertical list on desktop, horizontal scroller on mobile. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Panel" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
      <ul className="flex gap-1.5 lg:flex-col">
        {adminNav.map(({ href, label, icon: Icon, soon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          const cls = clsx(
            "flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            active ? "bg-lime-400 text-navy-900" : "text-white/70 hover:bg-white/5 hover:text-white",
            soon && "pointer-events-none opacity-45",
          );
          return (
            <li key={href} className="shrink-0">
              {soon ? (
                <span className={cls} aria-disabled>
                  <Icon className="size-4" /> {label}
                  <span className="ml-auto rounded-full border border-white/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider">Pronto</span>
                </span>
              ) : (
                <Link href={href} className={cls} aria-current={active ? "page" : undefined}>
                  <NavIcon icon={Icon} /> {label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
