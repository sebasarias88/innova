export const site = {
  name: "INNOVA Seguridad y Sistemas",
  shortName: "INNOVA",
  slogan: "Tecnología que protege, conecta y transforma",
  description:
    "Cámaras de seguridad (CCTV), energía solar, automatización de puertas, domótica, UPS y soporte informático en Armenia, Quindío y todo Colombia.",
  url: "https://innovaseguridad.co", // TODO: confirmar dominio
  city: "Armenia, Quindío",
  address: "Carrera 19A # 9-06, Armenia, Quindío",
  email: "ventasinnovaseguridad@gmail.com",
  phone: { label: "321 853 9336", raw: "573218539336" },
  instagram: { handle: "@innova_safesys", url: "https://instagram.com/innova_safesys" },
  tiktok: { handle: "@innova.seguridad2", url: "https://www.tiktok.com/@innova.seguridad2" },
  hours: "Lun – Sáb · 7:00 a. m. – 6:00 p. m.", // TODO: confirmar horario
  mapsQuery: "Carrera 19A 9-06 Armenia Quindío Colombia",
};

/** Construye un link de WhatsApp con mensaje prellenado. */
export function waLink(message: string, phone = site.phone.raw) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Destino del botón "Agendar servicio".
 * Temporal: abre WhatsApp. Cuando exista el módulo de agenda pasa a "/agendar".
 */
export const booking = {
  label: "Agendar servicio",
  href: waLink("Hola INNOVA 👋 Quiero agendar un servicio. ¿Qué disponibilidad tienen?"),
  external: true,
};

export const nav = [
  { label: "Servicios", href: "/servicios" },
  { label: "Calculadora solar", href: "/calculadora-solar" },
  { label: "Proyectos", href: "/proyectos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];

/** Cifras confirmadas por el cliente. */
export const stats = [
  { value: 5, suffix: "+", label: "Años de experiencia" },
  { value: 300, suffix: "+", label: "Proyectos instalados" },
  { value: 1000, suffix: "+", label: "Cámaras en operación" },
  { value: 24, suffix: "/7", label: "Soporte y monitoreo" },
];

export const whyUs = [
  {
    title: "Equipo técnico certificado",
    text: "Técnicos con experiencia real en campo, formados en seguridad electrónica, energía y redes.",
    icon: "BadgeCheck",
  },
  {
    title: "Atención personalizada",
    text: "Visitamos tu espacio, escuchamos tu necesidad y diseñamos la solución a tu medida.",
    icon: "Handshake",
  },
  {
    title: "Garantía y postventa",
    text: "Respaldo en garantía, mantenimiento preventivo y soporte cuando lo necesites.",
    icon: "ShieldCheck",
  },
  {
    title: "Cobertura nacional",
    text: "Desde Armenia para el Eje Cafetero y todo Colombia. Llegamos donde está tu proyecto.",
    icon: "MapPin",
  },
] as const;

export const process = [
  {
    step: "01",
    title: "Diagnóstico",
    text: "Visitamos tu hogar o empresa, identificamos riesgos, consumos y puntos críticos.",
  },
  {
    step: "02",
    title: "Diseño a medida",
    text: "Proponemos la solución exacta: equipos, ubicación, cableado y presupuesto claro.",
  },
  {
    step: "03",
    title: "Instalación profesional",
    text: "Ejecutamos con técnicos certificados, orden, normativa y cero improvisación.",
  },
  {
    step: "04",
    title: "Soporte continuo",
    text: "Capacitación, garantía, mantenimiento preventivo y diagnóstico remoto.",
  },
];
