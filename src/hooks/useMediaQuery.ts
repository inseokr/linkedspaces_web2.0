"use client";

import { useSyncExternalStore } from "react";

/**
 * Matches Tailwind lg breakpoint (1024px).
 * Returns true only after mount to avoid hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onStoreChange: () => void) => {
    const m = window.matchMedia(query);
    m.addEventListener("change", onStoreChange);
    return () => m.removeEventListener("change", onStoreChange);
  };
  const getSnapshot = () => window.matchMedia(query).matches;
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsLg(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
