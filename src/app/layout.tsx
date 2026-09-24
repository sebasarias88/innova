import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { MobileDock } from "@/components/layout/MobileDock";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { AnimationGate } from "@/components/layout/AnimationGate";
import { site } from "@/lib/site";

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

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "INNOVA Seguridad y Sistemas · Cámaras de seguridad, energía solar y automatización en Armenia",
    template: "%s · INNOVA Seguridad y Sistemas",
  },
  description: site.description,
  keywords: [
    "cámaras de seguridad Armenia",
    "CCTV Quindío",
    "energía solar Armenia",
    "paneles solares Quindío",
    "automatización de puertas",
    "domótica",
    "cableado estructurado",
    "UPS",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: site.name,
    title: "INNOVA Seguridad y Sistemas",
    description: site.description,
    images: ["/img/cctv-poste.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#020817",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.name,
  description: site.description,
  telephone: "+57 304 355 0891",
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Carrera 19A # 9-06",
    addressLocality: "Armenia",
    addressRegion: "Quindío",
    addressCountry: "CO",
  },
  areaServed: ["Armenia", "Quindío", "Eje Cafetero", "Colombia"],
  sameAs: [site.instagram.url],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={`${sora.variable} ${mono.variable}`}>
      <body className="overflow-x-clip pb-[84px] sm:pb-0">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SmoothScroll>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppFab />
          <MobileDock />
          <AnimationGate />
        </SmoothScroll>
      </body>
    </html>
  );
}
