import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { Logo } from "@/components/brand/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { signOut } from "../actions";

export default async function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 z-30 border-b border-white/10 bg-navy-950/95 px-4 pb-3 pt-4 lg:h-dvh lg:border-b-0 lg:border-r lg:p-5">
        <div className="flex items-center justify-between lg:block">
          <Link href="/admin" className="block">
            <Logo className="h-7 w-auto" priority />
          </Link>
          <form action={signOut} className="lg:hidden">
            <button type="submit" aria-label="Cerrar sesión" className="grid size-9 place-items-center rounded-full border border-white/10 text-white/70">
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
        <div className="mt-4 lg:mt-8">
          <AdminNav />
        </div>
        <div className="mt-8 hidden space-y-1 border-t border-white/10 pt-5 lg:block">
          <p className="truncate px-3 text-sm font-semibold">{admin.displayName}</p>
          <p className="truncate px-3 text-xs text-white/45">{admin.email}</p>
          <Link href="/" target="_blank" className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white">
            <ExternalLink className="size-4" /> Ver sitio
          </Link>
          <form action={signOut}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white">
              <LogOut className="size-4" /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-6 sm:px-8 lg:py-10">{children}</div>
    </div>
  );
}
