import {
  CalendarDays, FolderTree, Images, LayoutDashboard, Package, Settings, ShoppingBag, Truck, type LucideIcon,
} from "lucide-react";

export type AdminNavItem = { href: string; label: string; icon: LucideIcon; soon?: boolean };

// `soon` items are built in the next branches (feature/admin-panel, feature/bookings…).
export const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingBag, soon: true },
  { href: "/admin/bookings", label: "Agenda", icon: CalendarDays, soon: true },
  { href: "/admin/products", label: "Productos", icon: Package, soon: true },
  { href: "/admin/categories", label: "Categorías", icon: FolderTree, soon: true },
  { href: "/admin/projects", label: "Proyectos", icon: Images, soon: true },
  { href: "/admin/shipping", label: "Envíos", icon: Truck, soon: true },
  { href: "/admin/settings", label: "Configuración", icon: Settings, soon: true },
];

/** Supabase plan limits shown in the dashboard (Free plan; update if the plan changes). */
export const planLimits = {
  name: "Free",
  databaseBytes: 500 * 1024 ** 2,
  storageBytes: 1024 ** 3,
};
