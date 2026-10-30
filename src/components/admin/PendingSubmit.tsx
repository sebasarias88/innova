"use client";

import { useFormStatus } from "react-dom";
import clsx from "clsx";
import { BusyContent } from "@/components/ui/Busy";

/** Plain submit button for server-action forms, with a spinner while it runs. */
export function PendingSubmit({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" {...props} disabled={pending || props.disabled} aria-busy={pending} className={clsx("relative disabled:cursor-wait", className)}>
      <BusyContent busy={pending}>{children}</BusyContent>
    </button>
  );
}
