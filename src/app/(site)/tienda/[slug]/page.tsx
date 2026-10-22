import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageCircle, ShieldCheck, Truck, Wrench } from "lucide-react";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductPurchase } from "@/components/shop/ProductPurchase";
import { getProductBySlug, getRelatedProducts } from "@/lib/shop/queries";
import { formatPrice } from "@/lib/shop/format";
import { site, waLink } from "@/lib/site";
import { siteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Producto no encontrado" };
  const description = product.shortDescription ?? `${product.name} en INNOVA Seguridad y Sistemas, Armenia, Quindío.`;
  return {
    title: product.brand ? `${product.name} · ${product.brand}` : product.name,
    description: (product.price > 0
      ? `${description} ${product.variants.length > 1 ? "Desde " : ""}${formatPrice(product.price)} en Armenia, Quindío.`
      : `${description} Cotiza por WhatsApp en Armenia, Quindío.`
    ).slice(0, 160),
    alternates: { canonical: `/tienda/${product.slug}` },
    openGraph: { title: product.name, description, images: product.images[0] ? [product.images[0].url] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id);

  const base = siteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
    image: product.images.map((i) => i.url),
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    sku: product.sku ?? undefined,
    // With variants: one offer per option (Google shows the price range).
    // No price yet ($0): no offer, so Google never shows the product as free.
    offers: product.price <= 0
      ? undefined
      : product.variants.length
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "COP",
          lowPrice: Math.min(...product.variants.map((v) => v.price)),
          highPrice: Math.max(...product.variants.map((v) => v.price)),
          offerCount: product.variants.length,
          offers: product.variants.map((v) => ({
            "@type": "Offer",
            name: v.name,
            sku: v.sku ?? undefined,
            priceCurrency: "COP",
            price: v.price,
            availability: v.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${base}/tienda/${product.slug}`,
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: site.name },
          })),
        }
      : {
          "@type": "Offer",
          priceCurrency: "COP",
          price: product.price,
          availability: product.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: `${base}/tienda/${product.slug}`,
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@type": "Organization", name: site.name },
        },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Inicio", item: base },
              { "@type": "ListItem", position: 2, name: "Tienda", item: `${base}/tienda` },
              ...(product.category ? [{ "@type": "ListItem", position: 3, name: product.category.name, item: `${base}/tienda?categoria=${product.category.slug}` }] : []),
              { "@type": "ListItem", position: product.category ? 4 : 3, name: product.name, item: `${base}/tienda/${product.slug}` },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
      <section className="pb-16 pt-28 sm:pb-24 sm:pt-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav aria-label="Ruta" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-white/50">
            <Link href="/tienda" className="hover:text-white">
              Tienda
            </Link>
            {product.category && (
              <>
                <ChevronRight className="size-3.5" />
                <Link href={`/tienda?categoria=${product.category.slug}`} className="hover:text-white">
                  {product.category.name}
                </Link>
              </>
            )}
          </nav>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
            <ProductGallery images={product.images} name={product.name} soldOut={!product.isAvailable} />

            <div>
              {product.brand && <p className="font-mono text-xs uppercase tracking-[0.2em] text-royal-300">{product.brand}</p>}
              <h1 className="mt-2 text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">{product.name}</h1>
              {product.shortDescription && <p className="mt-4 text-pretty text-lg leading-relaxed text-white/75">{product.shortDescription}</p>}

              <ProductPurchase
                variants={product.variants}
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  sku: product.sku,
                  price: product.price,
                  compareAtPrice: product.compareAtPrice,
                  isAvailable: product.isAvailable,
                  image: product.images[0]?.url ?? null,
                }}
              />

              <a
                href={waLink(`Hola, INNOVA 👋 Tengo una pregunta sobre el producto: ${product.name}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-lime-400"
              >
                <MessageCircle className="size-4" /> ¿Dudas? Pregúntanos por WhatsApp
              </a>

              <ul className="mt-8 grid gap-3 border-t border-white/10 pt-8 text-sm text-white/70 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <li className="flex items-start gap-2.5">
                  <Truck className="mt-0.5 size-4 shrink-0 text-lime-400" /> Envío gratis en Armenia
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-lime-400" />
                  <Link href="/politica-de-garantia" className="underline-offset-2 hover:text-white hover:underline">
                    Garantía de 1 año y postventa
                  </Link>
                </li>
                <li className="flex items-start gap-2.5">
                  <Wrench className="mt-0.5 size-4 shrink-0 text-lime-400" /> Instalación profesional disponible
                </li>
              </ul>
            </div>
          </div>

          {(product.specs.length > 0 || product.description) && (
            <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-14">
              {product.description && (
                <div>
                  <h2 className="text-2xl font-bold text-white">Descripción</h2>
                  <div className="mt-4 whitespace-pre-line text-pretty leading-relaxed text-white/70">{product.description}</div>
                </div>
              )}
              {product.specs.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white">Ficha técnica</h2>
                  <dl className="mt-4 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
                    {product.specs.map((s) => (
                      <div key={s.label} className="grid grid-cols-[40%_1fr] gap-4 px-4 py-3 text-sm odd:bg-white/[0.03]">
                        <dt className="text-white/50">{s.label}</dt>
                        <dd className="font-medium text-white">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl font-bold text-white">También te puede interesar</h2>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
