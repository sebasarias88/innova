import {
  CalendarDays, FolderTree, Images, LayoutDashboard, Package, Settings, ShoppingBag, Truck, type LucideIcon,
} from "lucide-react";

export type AdminNavItem = { href: string; label: string; icon: LucideIcon; soon?: boolean };

// `soon: true` shows an item as disabled ("Pronto") until its module exists.
export const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/bookings", label: "Agenda", icon: CalendarDays },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/categories", label: "Categorías", icon: FolderTree },
  { href: "/admin/projects", label: "Proyectos", icon: Images },
  { href: "/admin/shipping", label: "Envíos", icon: Truck },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
];

/** Supabase plan limits shown in the dashboard (Free plan; update if the plan changes). */
export const planLimits = {
  name: "Free",
  databaseBytes: 500 * 1024 ** 2,
  storageBytes: 1024 ** 3,
};
