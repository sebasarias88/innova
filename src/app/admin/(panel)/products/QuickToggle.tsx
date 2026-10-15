"use client";

import { useOptimistic, useTransition } from "react";
import clsx from "clsx";
import { toast } from "sonner";
import { setProductFlag } from "./actions";

/** One-click switch in the product list (e.g. mark as sold out). */
export function QuickToggle({ id, flag, value, on, off }: { id: string; flag: "is_available" | "is_published"; value: boolean; on: string; off: string }) {
  const [optimistic, setOptimistic] = useOptimistic(value);
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          const r = await setProductFlag(id, flag, !optimistic);
          if (r && !r.ok) toast.error(r.error);
          else toast.success(!optimistic ? `Marcado como ${on.toLowerCase()}.` : `Marcado como ${off.toLowerCase()}.`);
        })
      }
      className={clsx(
        "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-60",
        optimistic ? "border-lime-400/30 bg-lime-400/10 text-lime-300 hover:bg-lime-400/20" : "border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20",
      )}
      title="Clic para cambiar"
    >
      {optimistic ? on : off}
    </button>
  );
}
