import { TablePageSkeleton } from "@/components/admin/skeletons";

export default function Loading() {
  return <TablePageSkeleton label="Cargando proyectos…" action rows={6} />;
}
