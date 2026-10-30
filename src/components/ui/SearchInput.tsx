"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import clsx from "clsx";
import { Spinner } from "@/components/ui/Busy";

/**
 * Search box with a clear (×) button, shared by the store and the admin.
 * - Typing then × (nothing searched yet): just empties the box.
 * - × with an active search: empties the box and loads `clearHref` (spinner on the ×).
 * - Escape does the same as ×.
 * The parent form is keyed by the current search, so after any navigation the
 * box always shows what is really applied (never a stale text).
 */
export function SearchInput({
  name = "q",
  defaultValue = "",
  clearHref,
  placeholder,
  ariaLabel,
  maxLength = 60,
  className,
  clearClassName,
}: {
  name?: string;
  defaultValue?: string;
  /** Where to go when an active search is cleared (same page without `q`). */
  clearHref: string;
  placeholder?: string;
  ariaLabel?: string;
  maxLength?: number;
  className?: string;
  /** Position of the × inside the box (e.g. "right-24" next to a button). */
  clearClassName?: string;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [pending, start] = useTransition();

  const clear = () => {
    setValue("");
    input.current?.focus();
    if (defaultValue) start(() => router.push(clearHref, { scroll: false }));
  };

  return (
    <>
      <input
        ref={input}
        type="search"
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.preventDefault();
            clear();
          }
        }}
        maxLength={maxLength}
        enterKeyHint="search"
        autoComplete="off"
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={clsx("[&::-webkit-search-cancel-button]:hidden", className)}
      />
      {(value || pending) && (
        <button
          type="button"
          onClick={clear}
          disabled={pending}
          aria-label="Borrar búsqueda"
          className={clsx(
            "absolute top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white disabled:cursor-wait",
            clearClassName ?? "right-2",
          )}
        >
          {pending ? <Spinner label="Borrando búsqueda…" /> : <X className="size-4" />}
        </button>
      )}
    </>
  );
}
