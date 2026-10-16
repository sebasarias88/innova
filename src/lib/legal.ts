import { site } from "@/lib/site";

/**
 * Data of the person responsible for the store and for the personal data
 * (taken from the RUT). Update `version` + `updatedAt` every time the policy
 * or the terms change: each order and booking stores the version accepted.
 */
export const legal = {
  version: "2026-10-16",
  updatedAt: "16 de octubre de 2026",
  owner: "Jhon Albert Arias Castro",
  idLabel: "C.C. / NIT 1.094.971.378-7",
  tradeName: "INNOVA Seguridad y Sistemas",
  personType: "Persona natural comerciante, no responsable de IVA",
  // Domicilio registrado en el RUT. TODO: confirmar con los dueños si cambió.
  registeredAddress: "Carrera 6 Norte # 3-40, Armenia, Quindío, Colombia",
  storeAddress: site.address,
  email: site.email,
  phones: ["321 853 9336", "316 373 4973", "320 676 1126"],
  whatsappLabel: site.phone.label,
  hours: site.hours,
  sic: { name: "Superintendencia de Industria y Comercio (SIC)", url: "https://www.sic.gov.co" },
} as const;

export const legalLinks = {
  privacy: "/politica-de-privacidad",
  terms: "/terminos-y-condiciones",
  cookies: "/politica-de-privacidad#cookies",
} as const;
