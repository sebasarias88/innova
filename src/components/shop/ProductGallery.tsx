"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { ImageOff } from "lucide-react";
import clsx from "clsx";

export function ProductGallery({ images, name, soldOut }: { images: { url: string; alt: string | null }[]; name: string; soldOut: boolean }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-white">
        {current ? (
          <img src={current.url} alt={current.alt || name} className={clsx("size-full object-contain p-6 sm:p-10", soldOut && "opacity-60 grayscale")} />
        ) : (
          <span className="grid size-full place-items-center bg-navy-900 text-white/25">
            <ImageOff className="size-10" />
          </span>
        )}
        {soldOut && <span className="absolute left-4 top-4 rounded-full bg-navy-950 px-3 py-1.5 text-xs font-bold text-white">Agotado</span>}
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === active}
              className={clsx("aspect-square overflow-hidden rounded-xl border-2 bg-white transition-colors", i === active ? "border-lime-400" : "border-transparent opacity-70 hover:opacity-100")}
            >
              <img src={img.url} alt="" loading="lazy" className="size-full object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
