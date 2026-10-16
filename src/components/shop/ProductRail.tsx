"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

/**
 * One horizontal row of product cards with native swipe on phones and arrow
 * buttons on bigger screens. Cards snap into place; no extra rows are added.
 */
export function ProductRail({ children, label }: { children: React.ReactNode; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const frame = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const move = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={track}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-3 outline-none [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:gap-5 sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {Children.map(children, (child) => (
          <div className="flex w-[64%] shrink-0 snap-start min-[480px]:w-[44%] md:w-[31%] lg:w-[calc((100%-3.75rem)/4)]">
            <div className="flex w-full [&>article]:w-full">{child}</div>
          </div>
        ))}
      </div>

      <RailButton side="left" hidden={edges.start} onClick={() => move(-1)} />
      <RailButton side="right" hidden={edges.end} onClick={() => move(1)} />
    </div>
  );
}

function RailButton({ side, hidden, onClick }: { side: "left" | "right"; hidden: boolean; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Ver productos anteriores" : "Ver más productos"}
      tabIndex={hidden ? -1 : 0}
      className={clsx(
        "absolute top-[38%] z-20 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-navy-900/90 text-white shadow-xl shadow-black/40 backdrop-blur transition-[opacity,color,border-color] hover:border-lime-400 hover:text-lime-400 md:grid",
        side === "left" ? "-left-3 xl:-left-6" : "-right-3 xl:-right-6",
        hidden && "pointer-events-none opacity-0",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
