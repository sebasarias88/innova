import type { Metadata } from "next";
import { Store, Truck } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { formatCop } from "@/lib/admin/format";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/fields";
import { ZoneForm } from "./ZoneForm";
import { deleteZone, saveZone } from "./actions";

export const metadata: Metadata = { title: "Envíos" };

export default async function ShippingPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: zones } = await supabase.from("shipping_zones").select("*").order("sort_order").order("name");

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Envíos" description="Opciones de entrega que el cliente elige en el carrito. El costo se suma al total del pedido." />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {!zones?.length && <EmptyState title="No hay zonas de envío" description="Crea al menos una para que el carrito funcione." />}
          {zones?.map((z) => (
            <details key={z.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 hover:bg-white/5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/5 text-royal-300">
                  {z.is_pickup ? <Store className="size-5" /> : <Truck className="size-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{z.name}</span>
                  {z.description && <span className="block truncate text-xs text-white/45">{z.description}</span>}
                </span>
                <span className="text-right">
                  <span className="block font-mono text-sm">{z.price === 0 ? "Gratis" : formatCop(z.price)}</span>
                  {!z.is_active && <Badge>Inactiva</Badge>}
                </span>
              </summary>
              <div className="border-t border-white/10 p-4 sm:p-5">
                <ZoneForm action={saveZone.bind(null, z.id)} zone={z} submitLabel="Guardar zona" />
                <div className="mt-4 flex justify-end border-t border-white/5 pt-4">
                  <ConfirmButton action={deleteZone.bind(null, z.id)} confirmText={`¿Eliminar la zona "${z.name}"?`}>
                    Eliminar zona
                  </ConfirmButton>
                </div>
              </div>
            </details>
          ))}
        </div>
        <Card title="Nueva zona" className="lg:sticky lg:top-6">
          <ZoneForm action={saveZone.bind(null, null)} submitLabel="Crear zona" />
        </Card>
      </div>
    </div>
  );
}
