import * as L from "lucide-react";
import type { IconName } from "@/lib/services";

export function Icon({ name, className }: { name: IconName | string; className?: string }) {
  const Cmp = (L as unknown as Record<string, L.LucideIcon>)[name] ?? L.Circle;
  return <Cmp className={className} strokeWidth={1.6} aria-hidden />;
}
