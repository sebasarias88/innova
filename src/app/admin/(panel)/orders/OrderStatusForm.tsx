"use client";

import { ActionForm, MoneyField, SaveButton, SelectField, TextArea } from "@/components/admin/fields";
import type { ActionResult } from "@/lib/admin/actions";

export function OrderStatusForm({
  action,
  status,
  statuses,
  internalNotes,
  shippingCost,
  canEditShipping,
}: {
  action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  status: string;
  statuses: { value: string; label: string }[];
  internalNotes: string | null;
  shippingCost: number | null;
  canEditShipping: boolean;
}) {
  return (
    <ActionForm action={action} className="space-y-4">
      <SelectField label="Estado del pedido" name="status" defaultValue={status}>
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </SelectField>
      {canEditShipping && (
        <MoneyField
          label="Costo de envío acordado"
          name="shipping_cost"
          defaultValue={shippingCost}
          placeholder="A convenir"
          hint="Déjalo vacío si aún no se acuerda. El total se recalcula solo."
        />
      )}
      <TextArea label="Notas internas" name="internal_notes" rows={4} maxLength={1000} defaultValue={internalNotes ?? ""} hint="Solo las ven los administradores." />
      <SaveButton className="w-full">Actualizar pedido</SaveButton>
    </ActionForm>
  );
}
