const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

export const formatPrice = (value: number) => cop.format(value);

/** Shipping label shown to customers. */
export function shippingLabel(price: number | null) {
  if (price === null) return "A convenir";
  if (price === 0) return "Gratis";
  return cop.format(price);
}
