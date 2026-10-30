"use client";

import { useTransition } from "react";
import clsx from "clsx";
import { toast } from "sonner";
import { BusyContent } from "@/components/ui/Busy";
import { setProductFlag } from "./actions";

/**
 * One-click switch in the product list (e.g. mark as sold out). Shows a spinner
 * until the saved value comes back with the refreshed list, so the old value
 * never flashes.
 */
export function QuickToggle({ id, flag, value, on, off }: { id: string; flag: "is_available" | "is_published"; value: boolean; on: string; off: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      onClick={() =>
        start(async () => {
          const r = await setProductFlag(id, flag, !value);
          if (r && !r.ok) toast.error(r.error);
          else toast.success(!value ? `Marcado como ${on.toLowerCase()}.` : `Marcado como ${off.toLowerCase()}.`);
        })
      }
      className={clsx(
        "relative rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:cursor-wait",
        value ? "border-lime-400/30 bg-lime-400/10 text-lime-300 hover:bg-lime-400/20" : "border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20",
      )}
      title="Clic para cambiar"
    >
      <BusyContent busy={pending} spinnerClassName="size-3">
        {value ? on : off}
      </BusyContent>
    </button>
  );
}
