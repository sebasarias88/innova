import type { BadgeTone } from "@/components/admin/ui";

export const ORDER_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  pending: { label: "Nuevo", tone: "amber" },
  awaiting_payment: { label: "Esperando pago", tone: "amber" },
  paid: { label: "Pagado", tone: "lime" },
  confirmed: { label: "Confirmado", tone: "blue" },
  shipped: { label: "Enviado", tone: "blue" },
  delivered: { label: "Entregado", tone: "lime" },
  cancelled: { label: "Cancelado", tone: "red" },
};

export const PAYMENT_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  pending: { label: "Pendiente", tone: "amber" },
  approved: { label: "Aprobado", tone: "lime" },
  declined: { label: "Rechazado", tone: "red" },
  voided: { label: "Anulado", tone: "red" },
  error: { label: "Error", tone: "red" },
  not_applicable: { label: "Contra entrega / acordado", tone: "gray" },
};

export const PAYMENT_METHOD: Record<string, string> = {
  wompi: "Pago en línea (Wompi)",
  whatsapp: "Pedido por WhatsApp",
};

export const BOOKING_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  pending: { label: "Por confirmar", tone: "amber" },
  confirmed: { label: "Confirmada", tone: "blue" },
  completed: { label: "Realizada", tone: "lime" },
  cancelled: { label: "Cancelada", tone: "red" },
};
