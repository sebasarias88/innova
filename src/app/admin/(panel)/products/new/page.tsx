import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "../ProductForm";
import { saveProduct } from "../actions";
import { getCategoryOptions } from "../categoryOptions";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await getCategoryOptions();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Nuevo producto" description="Después de crearlo podrás subir sus imágenes." back={{ href: "/admin/products", label: "Productos" }} />
      <ProductForm action={saveProduct.bind(null, null)} categories={categories} />
    </div>
  );
}
