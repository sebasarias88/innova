export type IconName =
  | "Cctv" | "Sun" | "DoorOpen" | "HousePlug" | "Cable" | "BatteryCharging" | "Laptop"
  | "Cloud" | "Smartphone" | "ScanEye" | "Wrench" | "Gauge" | "Leaf" | "Zap" | "Lightbulb"
  | "Thermometer" | "Lock" | "Music" | "Network" | "Server" | "BadgeCheck" | "PlugZap"
  | "Hospital" | "Building2" | "Cpu" | "ShieldCheck" | "Radio" | "Settings" | "Activity"
  | "Headset" | "Router" | "Layers" | "Factory" | "Home" | "Store" | "Warehouse";

export type Service = {
  slug: string;
  name: string;
  /** Título grande de la página, dividido en dos para estilizar */
  title: [string, string];
  kicker: string;
  short: string;
  description: string;
  image: string;
  icon: IconName;
  includes: string[];
  highlights: { title: string; text: string; icon: IconName }[];
  useCases: string[];
  faqs: { q: string; a: string }[];
  wa: string;
};

export const services: Service[] = [
  {
    slug: "cctv",
    name: "CCTV y videovigilancia",
    title: ["CCTV", "Circuito cerrado de televisión"],
    kicker: "Seguridad electrónica",
    short: "Vigilancia profesional con acceso remoto y almacenamiento en la nube.",
    description:
      "Diseñamos e instalamos sistemas de videovigilancia para hogares, comercios, conjuntos e industrias. Ve tus cámaras desde el celular en tiempo real, recibe alertas inteligentes y guarda tus grabaciones de forma segura en la nube.",
    image: "/img/cctv-poste.webp",
    icon: "Cctv",
    includes: [
      "Cámaras IP, analógicas y sistemas híbridos",
      "DVR, NVR y software de monitoreo",
      "Diagnóstico remoto",
      "Mantenimiento y servicio postventa",
    ],
    highlights: [
      { title: "Acceso remoto", text: "Mira todas tus cámaras en vivo desde tu celular, estés donde estés.", icon: "Smartphone" },
      { title: "Almacenamiento en la nube", text: "Tus grabaciones respaldadas fuera del sitio, aunque roben el grabador.", icon: "Cloud" },
      { title: "Detección inteligente", text: "Alertas por persona o vehículo, sin falsas alarmas por hojas o sombras.", icon: "ScanEye" },
      { title: "Diagnóstico remoto", text: "Revisamos tu sistema a distancia y resolvemos más rápido.", icon: "Activity" },
    ],
    useCases: ["Hogares", "Conjuntos residenciales", "Comercios", "Bodegas", "Industrias", "Fincas"],
    faqs: [
      { q: "¿Puedo ver las cámaras desde mi celular?", a: "Sí. Configuramos la aplicación en tu celular y te enseñamos a usarla: ves en vivo, revisas grabaciones y recibes alertas." },
      { q: "¿Cuántos días de grabación puedo guardar?", a: "Depende del número de cámaras, la resolución y el disco. Lo dimensionamos para que tengas desde 15 hasta 60 días o más, y opcionalmente respaldo en la nube." },
      { q: "¿Qué pasa si se va la luz?", a: "Podemos integrar una UPS para que el sistema siga grabando durante los cortes de energía." },
      { q: "¿Hacen mantenimiento a sistemas que instaló otra empresa?", a: "Sí. Hacemos diagnóstico, mantenimiento y actualización de sistemas existentes." },
    ],
    wa: "Hola INNOVA 👋 Quiero cotizar un sistema de cámaras de seguridad (CCTV).",
  },
  {
    slug: "energia-solar",
    name: "Energía solar",
    title: ["Energía", "Solar"],
    kicker: "Diseño, venta e instalación",
    short: "Soluciones solares fotovoltaicas personalizadas on-grid, off-grid e híbridas.",
    description:
      "Reduce tu factura de energía y gana independencia. Diseñamos sistemas fotovoltaicos a la medida de tu consumo, con estudio de dimensionamiento, equipos de calidad e instalación profesional.",
    image: "/img/solar-campo.webp",
    icon: "Sun",
    includes: [
      "Sistemas on-grid, off-grid e híbridos",
      "Estudios de dimensionamiento",
      "Paneles, inversores, baterías y controladores",
      "Instalación profesional y mantenimiento preventivo/correctivo",
    ],
    highlights: [
      { title: "Ahorro real", text: "Genera tu propia energía y reduce significativamente tu factura mensual.", icon: "Gauge" },
      { title: "Estudio a medida", text: "Analizamos tu consumo y tu techo para dimensionar el sistema exacto.", icon: "Settings" },
      { title: "Respaldo con baterías", text: "Sistemas híbridos que te mantienen con energía durante los cortes.", icon: "BatteryCharging" },
      { title: "Energía limpia", text: "Menos emisiones de CO₂ y un inmueble más valioso y sostenible.", icon: "Leaf" },
    ],
    useCases: ["Hogares", "Fincas", "Comercios", "Hoteles", "Industrias", "Zonas sin red"],
    faqs: [
      { q: "¿Cuál es la diferencia entre on-grid, off-grid e híbrido?", a: "On-grid se conecta a la red y reduce tu factura. Off-grid funciona con baterías, sin red eléctrica. Híbrido combina ambos: ahorro y respaldo ante cortes." },
      { q: "¿Cuánto puedo ahorrar?", a: "Depende de tu consumo y tu techo. Usa nuestra calculadora solar para una estimación y luego hacemos un estudio preciso sin costo." },
      { q: "¿Qué mantenimiento necesita?", a: "Muy poco: limpieza de paneles y revisión preventiva periódica. Nosotros lo hacemos por ti." },
    ],
    wa: "Hola INNOVA ☀️ Quiero información sobre un sistema de energía solar.",
  },
  {
    slug: "automatizacion-de-puertas",
    name: "Automatización de puertas",
    title: ["Automatización", "de puertas"],
    kicker: "Residenciales e industriales",
    short: "Puertas corredizas, batientes, seccionales y enrollables automatizadas.",
    description:
      "Comodidad y seguridad al entrar y salir. Automatizamos puertas de garaje, portones, bodegas y locales con motores, sensores y controles de alta durabilidad.",
    image: "/img/puertas-instalacion.webp",
    icon: "DoorOpen",
    includes: [
      "Motores, brazos hidráulicos y sensores",
      "Instalación y programación",
      "Reparaciones y upgrades",
      "Repuestos certificados",
    ],
    highlights: [
      { title: "Todo tipo de puerta", text: "Corredizas, batientes, seccionales y enrollables.", icon: "DoorOpen" },
      { title: "Control desde el celular", text: "Abre tu puerta con control remoto, app o integración con domótica.", icon: "Smartphone" },
      { title: "Sensores de seguridad", text: "Fotoceldas y sensores que evitan accidentes con personas y vehículos.", icon: "Radio" },
      { title: "Repuestos certificados", text: "Reparamos y actualizamos tu motor con repuestos originales.", icon: "Wrench" },
    ],
    useCases: ["Garajes", "Conjuntos", "Bodegas", "Parqueaderos", "Locales", "Fincas"],
    faqs: [
      { q: "¿Pueden automatizar la puerta que ya tengo?", a: "En la mayoría de casos sí. Evaluamos el peso, tipo y estado de la puerta y te recomendamos el motor adecuado." },
      { q: "¿Qué pasa si se va la luz?", a: "Los motores tienen desbloqueo manual y podemos instalar baterías de respaldo." },
    ],
    wa: "Hola INNOVA 🚪 Quiero automatizar una puerta.",
  },
  {
    slug: "domotica",
    name: "Domótica",
    title: ["Domótica", "Hogar y oficina inteligente"],
    kicker: "Control centralizado",
    short: "Controla iluminación, clima, seguridad y entretenimiento desde tu móvil.",
    description:
      "Convierte tu casa u oficina en un espacio inteligente. Automatiza escenas, controla todo desde una sola app y ahorra energía sin renunciar a la comodidad.",
    image: "/img/domotica-tablet.webp",
    icon: "HousePlug",
    includes: ["Iluminación", "Climatización", "Seguridad", "Entretenimiento"],
    highlights: [
      { title: "Iluminación", text: "Escenas, horarios y control de intensidad desde tu celular o por voz.", icon: "Lightbulb" },
      { title: "Climatización", text: "Temperatura ideal automática y ahorro de energía.", icon: "Thermometer" },
      { title: "Seguridad", text: "Cerraduras, cámaras y sensores integrados en una sola app.", icon: "Lock" },
      { title: "Entretenimiento", text: "Audio y video multi-ambiente con un toque.", icon: "Music" },
    ],
    useCases: ["Casas", "Apartamentos", "Oficinas", "Hoteles", "Salas de juntas", "Locales"],
    faqs: [
      { q: "¿Necesito remodelar para tener domótica?", a: "No necesariamente. Muchas soluciones son inalámbricas y se instalan sin romper paredes." },
      { q: "¿Funciona con Alexa o Google?", a: "Sí, integramos asistentes de voz y apps compatibles." },
    ],
    wa: "Hola INNOVA 🏠 Quiero hacer mi hogar/oficina inteligente (domótica).",
  },
  {
    slug: "cableado-estructurado",
    name: "Cableado estructurado",
    title: ["Cableado", "Estructurado"],
    kicker: "Redes de datos y voz",
    short: "Instalación de redes de datos y voz bajo normativas internacionales.",
    description:
      "La base de toda empresa conectada. Diseñamos e instalamos redes ordenadas, certificadas y listas para crecer, bajo normativas internacionales.",
    image: "/img/redes-tecnico.webp",
    icon: "Cable",
    includes: [
      "Categorías 5e, 6 y 6A",
      "Patch panels, racks y canalización",
      "Certificación y pruebas de red",
      "Migración de sistemas existentes",
    ],
    highlights: [
      { title: "Cat 5e, 6 y 6A", text: "La categoría correcta para la velocidad que tu negocio necesita.", icon: "Network" },
      { title: "Racks organizados", text: "Patch panels, gabinetes y canalización limpia y etiquetada.", icon: "Server" },
      { title: "Certificación", text: "Pruebas de cada punto de red con reporte técnico.", icon: "BadgeCheck" },
      { title: "Migraciones", text: "Actualizamos tu red existente sin detener tu operación.", icon: "Router" },
    ],
    useCases: ["Oficinas", "Colegios", "Clínicas", "Hoteles", "Industrias", "Centros de datos"],
    faqs: [
      { q: "¿Qué categoría de cable necesito?", a: "Para la mayoría de oficinas Cat 6 es ideal. Para alta velocidad o proyección futura recomendamos Cat 6A." },
      { q: "¿Entregan certificación?", a: "Sí, certificamos cada punto y entregamos el reporte de pruebas." },
    ],
    wa: "Hola INNOVA 🌐 Necesito una cotización de cableado estructurado.",
  },
  {
    slug: "ups",
    name: "Sistemas de respaldo UPS",
    title: ["UPS", "Sistemas de respaldo"],
    kicker: "Respaldo energético",
    short: "Continuidad eléctrica para oficinas, servidores, equipos médicos y seguridad.",
    description:
      "Un corte de energía no debería detener tu negocio. Instalamos UPS y bancos de baterías que protegen tus equipos y mantienen tu operación funcionando.",
    image: "/img/ups-tecnico.webp",
    icon: "BatteryCharging",
    includes: [
      "UPS online e interactivos",
      "Bancos de baterías",
      "Transferencias automáticas",
      "Diagnóstico e instalación",
    ],
    highlights: [
      { title: "Oficinas", text: "Tus equipos siguen trabajando y no se pierde información.", icon: "Building2" },
      { title: "Servidores", text: "Protección contra picos, bajones y cortes inesperados.", icon: "Server" },
      { title: "Equipos médicos", text: "Continuidad crítica para clínicas y consultorios.", icon: "Hospital" },
      { title: "Sistemas de seguridad", text: "Tus cámaras y alarmas nunca se apagan.", icon: "ShieldCheck" },
    ],
    useCases: ["Oficinas", "Servidores", "Clínicas", "Comercios", "Industrias", "Sistemas de seguridad"],
    faqs: [
      { q: "¿Qué diferencia hay entre una UPS online e interactiva?", a: "La online entrega energía totalmente regulada todo el tiempo (ideal para equipos críticos). La interactiva es más económica y adecuada para oficinas y equipos generales." },
      { q: "¿Cuánto tiempo de respaldo tendré?", a: "Depende de la carga conectada y las baterías. Dimensionamos el sistema según el tiempo que necesites." },
    ],
    wa: "Hola INNOVA 🔋 Necesito un sistema de respaldo UPS.",
  },
  {
    slug: "servicios-informaticos",
    name: "Servicios informáticos",
    title: ["Servicios", "Informáticos"],
    kicker: "Soporte técnico especializado",
    short: "Venta de equipos, reparación, software, antivirus y mantenimiento preventivo.",
    description:
      "Mantén tus equipos rápidos, seguros y funcionando. Soporte técnico para hogares y empresas, desde la venta del equipo hasta su mantenimiento.",
    image: "/img/informatica.webp",
    icon: "Laptop",
    includes: [
      "Venta de equipos y accesorios",
      "Reparación y actualización de hardware",
      "Instalación de software y antivirus",
      "Mantenimiento preventivo",
    ],
    highlights: [
      { title: "Venta de equipos", text: "Computadores, accesorios y periféricos con asesoría.", icon: "Laptop" },
      { title: "Reparación y upgrades", text: "Más memoria, discos SSD y reparación de hardware.", icon: "Cpu" },
      { title: "Software y antivirus", text: "Instalación licenciada y protección contra amenazas.", icon: "ShieldCheck" },
      { title: "Mantenimiento", text: "Planes preventivos para que tus equipos no fallen.", icon: "Wrench" },
    ],
    useCases: ["Hogares", "Oficinas", "Colegios", "Comercios", "Profesionales", "Empresas"],
    faqs: [
      { q: "¿Atienden empresas con planes de mantenimiento?", a: "Sí, ofrecemos planes periódicos de mantenimiento preventivo para empresas." },
      { q: "¿Van a domicilio?", a: "Sí, atendemos en sitio o recogemos el equipo según el caso." },
    ],
    wa: "Hola INNOVA 💻 Necesito soporte técnico / servicios informáticos.",
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
