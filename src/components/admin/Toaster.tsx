"use client";

import { Toaster as Sonner } from "sonner";
import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert } from "lucide-react";

/** App-wide notifications styled like the panel (dark navy, lime accents). */
export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      offset={20}
      mobileOffset={12}
      gap={10}
      visibleToasts={4}
      icons={{
        success: <CircleCheck className="size-5 text-lime-400" />,
        error: <CircleAlert className="size-5 text-red-400" />,
        warning: <TriangleAlert className="size-5 text-amber-300" />,
        info: <Info className="size-5 text-royal-300" />,
        loading: <LoaderCircle className="size-5 animate-spin text-white/60" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-navy-900 p-4 font-sans text-sm text-white shadow-2xl shadow-black/50 sm:w-[360px]",
          title: "font-semibold leading-snug",
          description: "mt-0.5 text-[13px] leading-snug text-white/60",
          icon: "mt-px shrink-0",
          success: "border-lime-400/25",
          error: "border-red-400/30",
          actionButton: "ml-auto shrink-0 rounded-full bg-lime-400 px-3 py-1 text-xs font-semibold text-navy-900",
          cancelButton: "ml-auto shrink-0 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70",
          closeButton: "border-white/10 bg-navy-900 text-white/60 hover:text-white",
        },
      }}
    />
  );
}
