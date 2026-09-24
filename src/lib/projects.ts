/**
 * DEMO: proyectos de ejemplo para mostrar el formato.
 * Reemplazar por proyectos reales de INNOVA (fotos + datos) antes de publicar.
 */
export type Project = {
  slug: string;
  title: string;
  place: string;
  category: string;
  service: string;
  image: string;
  metrics: { k: string; v: string }[];
  summary: string;
};

export const projects: Project[] = [
  {
    slug: "conjunto-residencial-norte",
    title: "Conjunto residencial",
    place: "Armenia, Quindío",
    category: "Residencial",
    service: "cctv",
    image: "/img/cctv-poste.jpg",
    metrics: [{ k: "Cámaras IP", v: "32" }, { k: "Almacenamiento", v: "30 días" }],
    summary: "Videovigilancia perimetral con cámaras IP 4K, detección de personas y monitoreo desde portería y app.",
  },
  {
    slug: "finca-hotel-solar",
    title: "Finca hotel sostenible",
    place: "Montenegro, Quindío",
    category: "Turismo",
    service: "energia-solar",
    image: "/img/solar-campo.jpg",
    metrics: [{ k: "Potencia", v: "12 kWp" }, { k: "Ahorro", v: "≈ 85%" }],
    summary: "Sistema solar híbrido con baterías para mantener la operación del hotel durante cortes de energía.",
  },
  {
    slug: "bodega-logistica",
    title: "Bodega logística",
    place: "La Tebaida, Quindío",
    category: "Industrial",
    service: "automatizacion-de-puertas",
    image: "/img/puertas-instalacion.jpg",
    metrics: [{ k: "Puertas", v: "6 seccionales" }, { k: "Control", v: "App + RFID" }],
    summary: "Automatización de puertas seccionales industriales con sensores de seguridad y control de acceso.",
  },
  {
    slug: "clinica-respaldo",
    title: "Clínica odontológica",
    place: "Pereira, Risaralda",
    category: "Salud",
    service: "ups",
    image: "/img/ups-tecnico.jpg",
    metrics: [{ k: "UPS online", v: "10 kVA" }, { k: "Autonomía", v: "2 h" }],
    summary: "Respaldo energético online para equipos médicos, servidores y sistema de seguridad.",
  },
  {
    slug: "oficinas-corporativas",
    title: "Oficinas corporativas",
    place: "Armenia, Quindío",
    category: "Corporativo",
    service: "cableado-estructurado",
    image: "/img/redes-tecnico.jpg",
    metrics: [{ k: "Puntos de red", v: "120 Cat 6A" }, { k: "Certificación", v: "100%" }],
    summary: "Red de datos y voz certificada con rack organizado, canalización y migración sin detener operación.",
  },
  {
    slug: "casa-inteligente",
    title: "Casa inteligente",
    place: "Circasia, Quindío",
    category: "Residencial",
    service: "domotica",
    image: "/img/domotica-tablet.jpg",
    metrics: [{ k: "Escenas", v: "18" }, { k: "Control", v: "App + voz" }],
    summary: "Iluminación, clima, cerraduras y cámaras integradas en una sola app con asistentes de voz.",
  },
];
