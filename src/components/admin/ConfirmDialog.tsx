"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AlertDialog } from "radix-ui";
import { TriangleAlert } from "lucide-react";
import clsx from "clsx";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
};

type Confirm = (options: ConfirmOptions) => Promise<boolean>;
const ConfirmContext = createContext<Confirm | null>(null);

/** `const confirm = useConfirm(); if (await confirm({ title })) …` — styled replacement for window.confirm. */
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside <ConfirmProvider>");
  return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(value: boolean) => void>(undefined);

  const confirm = useCallback<Confirm>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = undefined;
    setOptions(null);
  };

  const danger = (options?.tone ?? "danger") === "danger";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog.Root open={!!options} onOpenChange={(open) => !open && close(false)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm data-[state=open]:animate-[fade-in_150ms_ease-out]" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-navy-900 p-6 text-white shadow-2xl shadow-black/60 outline-none data-[state=open]:animate-[dialog-in_200ms_cubic-bezier(0.16,1,0.3,1)]">
            <div className="flex gap-4">
              {danger && (
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-red-500/15 text-red-300">
                  <TriangleAlert className="size-5" />
                </span>
              )}
              <div className="min-w-0">
                <AlertDialog.Title className="text-lg font-bold leading-snug">{options?.title}</AlertDialog.Title>
                <AlertDialog.Description className={clsx("mt-1.5 text-sm leading-relaxed text-white/60", !options?.description && "sr-only")}>
                  {options?.description ?? options?.title}
                </AlertDialog.Description>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialog.Cancel className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:border-white/40 hover:text-white">
                {options?.cancelLabel ?? "Cancelar"}
              </AlertDialog.Cancel>
              <AlertDialog.Action
                onClick={() => close(true)}
                className={clsx(
                  "rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                  danger ? "bg-red-500 text-white hover:bg-red-400" : "bg-lime-400 text-navy-900 hover:bg-white",
                )}
              >
                {options?.confirmLabel ?? (danger ? "Eliminar" : "Confirmar")}
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  );
}
