import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { supabasePublishableKey } from "@/lib/supabase/env";
import { mediaUrl, storageUploadBase } from "@/lib/admin/storage";
import { uuid } from "@/lib/admin/actions";
import { Card, PageHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/fields";
import { ImageManager } from "@/components/admin/ImageManager";
import { ProductForm, type ProductFormValues } from "../ProductForm";
import { deleteProduct, saveProduct } from "../actions";
import { getCategoryOptions } from "../categoryOptions";

export const metadata: Metadata = { title: "Editar producto" };

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requireAdmin();
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  if (!uuid.safeParse(id).success) notFound();

  const supabase = await createClient();
  const [{ data: product }, { data: images }, categories] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("product_images").select("id, path, alt").eq("product_id", id).order("sort_order").order("created_at"),
    getCategoryOptions(),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={product.name}
        back={{ href: "/admin/products", label: "Productos" }}
        actions={<ConfirmButton action={deleteProduct.bind(null, id)} confirmText={`¿Eliminar "${product.name}" y sus imágenes? Esta acción no se puede deshacer.`} />}
      />
      {created && (
        <p className="mb-6 flex items-center gap-2 rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 py-3 text-sm text-lime-200">
          <CheckCircle2 className="size-4" /> Producto creado. Ahora agrega sus imágenes y publícalo cuando esté listo.
        </p>
      )}
      <Card title="Imágenes" description="La primera imagen es la principal. Puedes reordenarlas con las flechas." className="mb-6">
        <ImageManager
          kind="product"
          ownerId={id}
          images={(images ?? []).map((img) => ({ ...img, url: mediaUrl(img.path)! }))}
          uploadBase={storageUploadBase()}
          apiKey={supabasePublishableKey()}
        />
      </Card>
      <ProductForm action={saveProduct.bind(null, id)} product={product as unknown as ProductFormValues} categories={categories} />
    </div>
  );
}
