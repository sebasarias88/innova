import {
  Activity, BadgeCheck, BatteryCharging, Building, Building2, Cable, Cctv, Circle, Cloud, Cpu, DoorOpen,
  Factory, Gauge, Handshake, Headset, Home, Hospital, Hotel, HousePlug, Laptop, Layers, Leaf, Lightbulb,
  Lock, MapPin, Music, Network, PlugZap, Radio, Router, ScanEye, Server, Settings, ShieldCheck, Smartphone,
  Store, Sun, Thermometer, Trees, Warehouse, Wrench, Zap, type LucideIcon,
} from "lucide-react";

/**
 * Importación explícita: solo se empaquetan los íconos que usa el sitio.
 * (Importar `* as` desde lucide-react metía ~2.000 íconos / 900 KB al bundle.)
 * Si necesitas uno nuevo, impórtalo arriba y agrégalo al mapa.
 */
const ICONS: Record<string, LucideIcon> = {
  Activity, BadgeCheck, BatteryCharging, Building, Building2, Cable, Cctv, Cloud, Cpu, DoorOpen,
  Factory, Gauge, Handshake, Headset, Home, Hospital, Hotel, HousePlug, Laptop, Layers, Leaf, Lightbulb,
  Lock, MapPin, Music, Network, PlugZap, Radio, Router, ScanEye, Server, Settings, ShieldCheck, Smartphone,
  Store, Sun, Thermometer, Trees, Warehouse, Wrench, Zap,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? Circle;
  return <Cmp className={className} strokeWidth={1.6} aria-hidden />;
}
