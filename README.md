# INNOVA Seguridad y Sistemas · Sitio web (demo)

Demo visual del sitio de **INNOVA Seguridad y Sistemas** (Armenia, Quindío).

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 (tokens de marca en `src/app/globals.css`)
- Motion (Framer Motion) + GSAP ScrollTrigger + Lenis (scroll suave)
- lucide-react (íconos) · fuentes Sora y JetBrains Mono (@fontsource)

## Correr en local
```bash
npm install
npm run dev
# http://localhost:3000
```

## Páginas
| Ruta | Qué es |
|---|---|
| `/` | Home: hero "monitor CCTV en vivo", edificio isométrico interactivo, bento de servicios, hogar/empresa/industria, proceso, mini calculadora solar, proyectos (scroll horizontal), por qué elegirnos, cobertura, FAQ |
| `/servicios` | Lista con previsualización de imagen que sigue al cursor |
| `/servicios/[slug]` | 7 páginas de servicio generadas desde `src/lib/services.ts` (CCTV incluye comparador visión nocturna, Solar incluye calculadora) |
| `/arma-tu-sistema` | Configurador en 4 pasos → propuesta con equipos y cantidades → WhatsApp |
| `/calculadora-solar` | Calculadora completa (kWp, paneles, ahorro, retorno, CO₂, gráfica) |
| `/proyectos` | Portafolio filtrable |
| `/nosotros`, `/contacto` | Empresa y contacto (formulario → WhatsApp, mapa) |
| `/cobertura/[ciudad]` | Páginas SEO por ciudad (Armenia, Calarcá, Montenegro, Pereira, Manizales, Cali) |

## Dónde se edita el contenido
- `src/lib/site.ts` → datos de contacto, WhatsApp, cifras, "por qué elegirnos", proceso
- `src/lib/services.ts` → los 7 servicios (textos, imágenes, FAQ, mensaje de WhatsApp)
- `src/lib/projects.ts` → proyectos
- `src/lib/cities.ts` → ciudades de cobertura
- `src/lib/solar.ts` → supuestos de la calculadora (HSP, tarifa, costo por kWp)
- `public/img/` → fotos (hoy recortadas del brochure)
- Logo vectorizado: `src/components/brand/` (y `public/brand-logo.svg`)

## ⚠️ Pendiente por confirmar con el cliente (marcado como DEMO/TODO)
- Cifras del home (años, proyectos, cámaras) → `site.ts > stats`
- Proyectos de ejemplo → reemplazar por proyectos y fotos reales
- Horario de atención y dominio definitivo
- Supuestos de la calculadora solar (tarifa, costo instalado por kWp)
- Fotos reales del equipo e instalaciones (las actuales son del brochure)
- Logo original en SVG (el actual fue vectorizado desde el PDF)

## Fase 2 (cuando aprueben)
- Supabase: guardar leads de contacto, "Arma tu sistema" y calculadora; CRUD de proyectos
- Resend: correo de notificación al equipo de ventas
- Portal de clientes: solicitudes de mantenimiento y garantías
