import { StatsPageSkeleton } from "@/components/admin/skeletons";

export default function Loading() {
  return <StatsPageSkeleton label="Cargando el almacenamiento…" picker={false} />;
}
