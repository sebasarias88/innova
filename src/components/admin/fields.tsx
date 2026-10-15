"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef, useState, useTransition, type ReactNode, type TextareaHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Select, type SelectOption } from "@/components/admin/Select";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import clsx from "clsx";
import type { ActionResult } from "@/lib/admin/actions";

const inputCls =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-navy-950/60 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-lime-400/70 disabled:opacity-50";

function Label({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-xs font-semibold text-white/70">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-white/40">{hint}</span>}
    </label>
  );
}

export function TextField({ label, hint, ...props }: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Label label={label} hint={hint} htmlFor={props.id ?? props.name}>
      <input id={props.id ?? props.name} {...props} className={clsx(inputCls, props.className)} />
    </Label>
  );
}

export function TextArea({ label, hint, ...props }: { label: string; hint?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Label label={label} hint={hint} htmlFor={props.id ?? props.name}>
      <textarea id={props.id ?? props.name} rows={4} {...props} className={clsx(inputCls, "resize-y leading-relaxed", props.className)} />
    </Label>
  );
}

export function SelectField({
  label,
  hint,
  name,
  options,
  defaultValue,
  placeholder,
}: {
  label: string;
  hint?: string;
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
}) {
  return <Select label={label} hint={hint} name={name} options={options} defaultValue={defaultValue} placeholder={placeholder} />;
}

/** Price input that shows thousands separators while typing (sends digits). */
export function MoneyField({ label, hint, name, defaultValue, required, placeholder }: { label: string; hint?: string; name: string; defaultValue?: number | null; required?: boolean; placeholder?: string }) {
  const fmt = (v: string) => (v ? Number(v).toLocaleString("es-CO") : "");
  const [value, setValue] = useState(defaultValue != null ? fmt(String(defaultValue)) : "");
  return (
    <Label label={label} hint={hint} htmlFor={name}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 mt-[3px] -translate-y-1/2 text-sm text-white/40">$</span>
        <input
          id={name}
          name={name}
          inputMode="numeric"
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(fmt(e.target.value.replace(/\D/g, "").slice(0, 10)))}
          className={clsx(inputCls, "pl-7")}
        />
      </div>
    </Label>
  );
}

export function Toggle({ label, description, name, defaultChecked }: { label: string; description?: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-white/10 bg-navy-950/40 px-4 py-3">
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-white/45">{description}</span>}
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-white/15 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-lime-400 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-lime-400/60" />
    </label>
  );
}

const PendingContext = createContext(false);
const ResultContext = createContext<ActionResult>(undefined);

/** Renders the last action result where it is placed (use with `inlineFeedback`). */
export function FormFeedback() {
  return <ResultMessage result={useContext(ResultContext)} />;
}

export function SaveButton({ children = "Guardar cambios", className }: { children?: ReactNode; className?: string }) {
  const status = useFormStatus();
  const pending = useContext(PendingContext) || status.pending;
  return (
    <button
      type="submit"
      disabled={pending}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {pending && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

/** Inline error next to the form (successes are shown as toasts). */
export function ResultMessage({ result }: { result: ActionResult }) {
  if (!result || result.ok) return null;
  return (
    <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200">
      {result.error}
    </p>
  );
}

type FormAction = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

/**
 * Form bound to a Server Action. Success and errors show as toasts; errors also
 * stay inline next to the form.
 * Submits through onSubmit (not the `action` attribute) so React does not
 * clear the fields when the server returns a validation error.
 */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess,
  inlineFeedback,
}: {
  action: FormAction;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  /** The form places <FormFeedback /> itself. */
  inlineFeedback?: boolean;
}) {
  const [result, formAction, pending] = useActionState(action, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!result) return;
    if (result.ok) {
      if (result.message) toast.success(result.message);
      if (resetOnSuccess) ref.current?.reset();
    } else toast.error(result.error);
  }, [result, resetOnSuccess]);

  return (
    <form
      ref={ref}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      <PendingContext.Provider value={pending}>
        <ResultContext.Provider value={result}>{children}</ResultContext.Provider>
      </PendingContext.Provider>
      {!inlineFeedback && (
        <div className="mt-4 empty:hidden">
          <ResultMessage result={result} />
        </div>
      )}
    </form>
  );
}

/** Button that asks for confirmation (styled dialog) and then runs a Server Action. */
export function ConfirmButton({
  action,
  confirmText,
  description,
  confirmLabel,
  children,
  className,
  variant = "danger",
}: {
  action: () => Promise<ActionResult>;
  confirmText: string;
  description?: string;
  confirmLabel?: string;
  children?: ReactNode;
  className?: string;
  variant?: "danger" | "ghost";
}) {
  const confirm = useConfirm();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        const accepted = await confirm({ title: confirmText, description, confirmLabel, tone: variant === "danger" ? "danger" : "default" });
        if (!accepted) return;
        start(async () => {
          const r = await action();
          if (r && !r.ok) toast.error(r.error);
          else if (r?.message) toast.success(r.message);
        });
      }}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors disabled:opacity-50",
        variant === "danger" ? "border border-red-400/30 text-red-300 hover:bg-red-500/10" : "border border-white/15 text-white/75 hover:border-white/40",
        className,
      )}
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : variant === "danger" && <Trash2 className="size-4" />}
      {children ?? "Eliminar"}
    </button>
  );
}
