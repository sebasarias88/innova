import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { site } from "@/lib/site";

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
    images: ["/img/cctv-poste.jpg"],
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
    <html lang="es-CO">
      <body className="overflow-x-clip">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SmoothScroll>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppFab />
        </SmoothScroll>
      </body>
    </html>
  );
}
