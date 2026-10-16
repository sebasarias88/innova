import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/lib/site";
import { isIndexable, siteUrl } from "@/lib/site-url";

// Fuentes autoalojadas con next/font: se precargan y el texto no "salta" al cargar
const sora = localFont({
  src: "./fonts/sora.woff2",
  variable: "--font-sora",
  weight: "100 800",
  display: "swap",
  adjustFontFallback: "Arial",
});
const mono = localFont({
  src: "./fonts/jetbrains-mono.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
});

const baseUrl = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Cámaras de seguridad, energía solar y automatización en Armenia · INNOVA Seguridad y Sistemas",
    template: "%s · INNOVA Seguridad y Sistemas",
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "cámaras de seguridad Armenia",
    "instalación de cámaras de seguridad Quindío",
    "CCTV Armenia",
    "energía solar Armenia",
    "paneles solares Quindío",
    "motores para puertas Armenia",
    "automatización de puertas",
    "alarmas de seguridad Armenia",
    "domótica",
    "UPS Armenia",
  ],
  // Only the final domain is indexed (see isIndexable): never the temporary vercel.app URL.
  robots: isIndexable() ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } } : { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: site.name,
    title: "INNOVA Seguridad y Sistemas",
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: "INNOVA Seguridad y Sistemas", description: site.description },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#020817",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "Store"],
      "@id": `${baseUrl}/#negocio`,
      name: site.name,
      description: site.description,
      url: baseUrl,
      logo: `${baseUrl}/brand/logo-navy.svg`,
      image: `${baseUrl}/img/cctv-domo.webp`,
      telephone: "+57 321 853 9336",
      email: site.email,
      priceRange: "$$",
      currenciesAccepted: "COP",
      paymentAccepted: "Efectivo, transferencia, Nequi, tarjeta de crédito y débito, PSE",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Carrera 19A # 9-06",
        addressLocality: "Armenia",
        addressRegion: "Quindío",
        addressCountry: "CO",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "08:00",
          closes: "17:00",
        },
      ],
      areaServed: [
        { "@type": "City", name: "Armenia" },
        { "@type": "AdministrativeArea", name: "Quindío" },
        { "@type": "AdministrativeArea", name: "Eje Cafetero" },
        { "@type": "Country", name: "Colombia" },
      ],
      sameAs: [site.instagram.url, site.tiktok.url],
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#sitio`,
      url: baseUrl,
      name: site.name,
      inLanguage: "es-CO",
      publisher: { "@id": `${baseUrl}/#negocio` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${baseUrl}/tienda?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={`${sora.variable} ${mono.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        {children}
      </body>
    </html>
  );
}
