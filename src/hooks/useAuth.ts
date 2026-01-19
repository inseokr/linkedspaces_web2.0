"use client";

import { useSyncExternalStore } from "react";

const TOKEN_KEY = "token";

function getSnapshot() {
  return typeof window !== "undefined"
    ? window.localStorage.getItem(TOKEN_KEY)
    : null;
}

function subscribe(callback: () => void) {
  // Cross-tab updates
  const onStorage = (e: StorageEvent) => {
    if (e.key === TOKEN_KEY) callback();
  };

  // Same-tab updates (manual signal)
  const onAuthChanged = () => callback();

  window.addEventListener("storage", onStorage);
  window.addEventListener("auth:changed", onAuthChanged as EventListener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("auth:changed", onAuthChanged as EventListener);
  };
}

export function useAuth() {
  const token = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return Boolean(token);
}

export function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("auth:changed"));
}
