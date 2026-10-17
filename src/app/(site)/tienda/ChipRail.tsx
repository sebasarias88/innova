"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

/**
 * Single-row, horizontally scrollable list of chips. However many categories
 * there are, it never wraps (so the layout below never moves). Shows fades and
 * arrow buttons when there is more to see and keeps the active chip in view.
 */
export function ChipRail({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft > 4, end: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const activeChip = el.querySelector<HTMLElement>("[aria-current='page']");
    if (activeChip) el.scrollLeft = activeChip.offsetLeft - el.clientWidth / 2 + activeChip.clientWidth / 2;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update, children]);

  const move = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.7, behavior: "smooth" });

  return (
    <nav aria-label={label} className={clsx("relative -mx-4 sm:mx-0", className)}>
      <div
        ref={ref}
        onScroll={update}
        className="flex gap-2 overflow-x-auto scroll-smooth px-4 py-1 [scrollbar-width:none] sm:px-0 [&::-webkit-scrollbar]:hidden"
        style={{
          maskImage: `linear-gradient(to right, ${edges.start ? "transparent, black 3rem" : "black, black"}, ${edges.end ? "black calc(100% - 3rem), transparent" : "black, black"})`,
        }}
      >
        {children}
      </div>
      <RailButton side="left" show={edges.start} onClick={() => move(-1)} />
      <RailButton side="right" show={edges.end} onClick={() => move(1)} />
    </nav>
  );
}

function RailButton({ side, show, onClick }: { side: "left" | "right"; show: boolean; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden
      onClick={onClick}
      className={clsx(
        "absolute top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-navy-950/90 text-white/80 shadow-lg transition-opacity hover:text-white sm:grid",
        side === "left" ? "-left-2" : "-right-2",
        show ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
