"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";

/** Comparador día / visión nocturna IR */
export function NightVision({ src }: { src: string }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const move = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={ref}
      className="relative aspect-[16/10] cursor-ew-resize select-none overflow-hidden rounded-[2rem] border border-white/10"
      onPointerMove={(e) => e.buttons === 1 && move(e.clientX)}
      onPointerDown={(e) => move(e.clientX)}
    >
      <Image src={src} alt="Vista diurna" fill sizes="(max-width:1024px) 100vw, 60vw" className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <Image src={src} alt="Vista con visión nocturna" fill sizes="(max-width:1024px) 100vw, 60vw" className="object-cover [filter:grayscale(1)_brightness(1.05)_contrast(1.35)_sepia(0.5)_hue-rotate(45deg)_saturate(1.4)]" />
        <div className="scanlines absolute inset-0 opacity-80" />
        <div className="grain absolute inset-0 overflow-hidden" />
      </div>
      <div className="absolute inset-y-0 w-0.5 bg-lime-400" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lime-400 text-navy-900 shadow-xl">
          <MoveHorizontal className="size-5" />
        </span>
      </div>
      <span className="absolute left-4 top-4 rounded bg-black/50 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white">Día · Color</span>
      <span className="absolute right-4 top-4 rounded bg-black/50 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-lime-400">Noche · IR 40 m</span>
    </div>
  );
}
