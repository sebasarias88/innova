import { TablePageSkeleton } from "@/components/admin/skeletons";

export default function Loading() {
  return <TablePageSkeleton label="Cargando categorías…" action rows={6} />;
}
