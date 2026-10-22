"use client";

import { useSyncExternalStore } from "react";
import { NO_TRACK_KEY } from "@/lib/analytics/client";

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
function read() {
  try {
    return window.localStorage.getItem(NO_TRACK_KEY) === "1";
  } catch {
    return null;
  }
}

/** Lets a visitor stop being counted in the anonymous statistics (or undo it). */
export function OptOutButton() {
  const optedOut = useSyncExternalStore(subscribe, read, () => null);
  if (optedOut === null) return null;
  return (
    <button
      type="button"
      onClick={() => {
        try {
          if (optedOut) window.localStorage.removeItem(NO_TRACK_KEY);
          else window.localStorage.setItem(NO_TRACK_KEY, "1");
        } catch {
          // storage blocked: nothing is stored anyway
        }
        listeners.forEach((l) => l());
      }}
      className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-lime-400 hover:text-lime-300"
    >
      {optedOut ? "Volver a contar mis visitas" : "No contar mis visitas"}
    </button>
  );
}
