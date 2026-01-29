"use client";

import { useSyncExternalStore, useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Added for navigation
import { clearCachedUser } from "@/api/user";

const TOKEN_KEY = "token";

/**
 * Get the current token from localStorage
 * @returns string | null
 */
function getSnapshot() {
  return typeof window !== "undefined"
    ? window.localStorage.getItem(TOKEN_KEY)
    : null;
}

/**
 * Subscribe to storage and custom auth events
 */
function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === TOKEN_KEY) callback();
  };

  const onAuthChanged = () => callback();

  window.addEventListener("storage", onStorage);
  window.addEventListener("auth:changed", onAuthChanged as EventListener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("auth:changed", onAuthChanged as EventListener);
  };
}

/**
 * Hook to check if the user is authenticated
 */
export function useAuth() {
  const token = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const logout = () => {
    // 1. Clear the token
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
    }

    // 2. Clear the cached user data
    clearCachedUser();

    // 3. Notify other parts of the app
    notifyAuthChanged();

    // 4. Redirect to login or landing page
    router.replace("/");
    router.refresh(); // Clear server-side cache
  };

  return {
    isLoading: !isMounted,
    isAuthenticated: Boolean(token),
    logout,
  };
}

/**
 * Trigger an 'auth:changed' event manually
 */
export function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("auth:changed"));
}
