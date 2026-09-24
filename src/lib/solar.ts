/**
 * Cálculo solar referencial. Supuestos editables (confirmar con INNOVA):
 * - HSP (horas sol pico) promedio Eje Cafetero ≈ 4.2
 * - Performance ratio 0.8, panel de 585 W, 2.6 m² por panel
 * - Costo instalado referencial por kWp (on-grid) y sobrecosto híbrido con baterías
 */
export const SOLAR = {
  hsp: 4.2,
  pr: 0.8,
  panelW: 585,
  panelM2: 2.6,
  costPerKwp: 3_900_000,
  hybridExtra: 1.45,
  co2PerKwh: 0.126, // kg CO₂/kWh (factor red Colombia, aprox.)
  treeKgYear: 22,
  defaultTariff: 920, // COP por kWh (aprox. residencial)
};

export type SolarType = "on-grid" | "hibrido" | "off-grid";

export function calcSolar(bill: number, tariff = SOLAR.defaultTariff, coverage = 0.9, type: SolarType = "on-grid") {
  const kwhMonth = bill / tariff;
  const target = kwhMonth * coverage;
  const kwp = target / (30 * SOLAR.hsp * SOLAR.pr);
  const panels = Math.max(1, Math.ceil((kwp * 1000) / SOLAR.panelW));
  const realKwp = (panels * SOLAR.panelW) / 1000;
  const genMonth = realKwp * SOLAR.hsp * 30 * SOLAR.pr;
  const savingMonth = Math.min(genMonth, kwhMonth) * tariff;
  const factor = type === "on-grid" ? 1 : type === "hibrido" ? SOLAR.hybridExtra : SOLAR.hybridExtra * 1.15;
  const investment = realKwp * SOLAR.costPerKwp * factor;
  const paybackYears = investment / (savingMonth * 12);
  const co2Year = genMonth * 12 * SOLAR.co2PerKwh;
  return {
    kwhMonth,
    kwp: realKwp,
    panels,
    area: panels * SOLAR.panelM2,
    genMonth,
    savingMonth,
    saving25: savingMonth * 12 * 25,
    investment,
    paybackYears,
    co2Year,
    trees: co2Year / SOLAR.treeKgYear,
  };
}

export const cop = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Math.round(n));
