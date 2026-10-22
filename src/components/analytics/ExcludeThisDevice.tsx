"use client";

import { useEffect } from "react";
import { NO_TRACK_KEY } from "@/lib/analytics/client";

/** Devices that open the admin panel stop counting as visitors of the site. */
export function ExcludeThisDevice() {
  useEffect(() => {
    try {
      window.localStorage.setItem(NO_TRACK_KEY, "1");
    } catch {
      // storage blocked: nothing to remember
    }
  }, []);
  return null;
}
