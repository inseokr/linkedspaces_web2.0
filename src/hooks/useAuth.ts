"use client";

export function useAuth() {
  // Read once during render (client-only hook)
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

  return Boolean(token);
}
