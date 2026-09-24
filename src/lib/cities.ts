export type City = { slug: string; name: string; dept: string; hub?: boolean; blurb: string; x: number; y: number };

/** Ciudades para páginas SEO de cobertura. x/y = posición en el mapa estilizado (0-100). */
export const cities: City[] = [
  { slug: "armenia", name: "Armenia", dept: "Quindío", hub: true, x: 50, y: 56, blurb: "Nuestra sede principal. Atención inmediata, visitas técnicas el mismo día y soporte local." },
  { slug: "calarca", name: "Calarcá", dept: "Quindío", x: 66, y: 62, blurb: "A minutos de nuestra sede: instalaciones y mantenimiento con respuesta rápida." },
  { slug: "montenegro", name: "Montenegro", dept: "Quindío", x: 34, y: 49, blurb: "Seguridad y energía solar para hogares, fincas y hoteles turísticos." },
  { slug: "pereira", name: "Pereira", dept: "Risaralda", x: 42, y: 32, blurb: "Proyectos residenciales, comerciales e industriales en el área metropolitana." },
  { slug: "manizales", name: "Manizales", dept: "Caldas", x: 56, y: 14, blurb: "Soluciones integrales para empresas, conjuntos y comercio." },
  { slug: "cali", name: "Cali", dept: "Valle del Cauca", x: 24, y: 88, blurb: "Proyectos corporativos e industriales con la misma calidad INNOVA." },
];

export const getCity = (slug: string) => cities.find((c) => c.slug === slug);
