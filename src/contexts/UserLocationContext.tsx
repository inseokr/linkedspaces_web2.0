"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

const CACHE_KEY = "ls_user_location";
const TTL_MS = 5 * 60 * 1000; // 5 minutes — reuse without re-prompting

export type UserPosition = { lat: number; lng: number };

function getCachedPosition(): UserPosition | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as {
      lat: number;
      lng: number;
      ts: number;
    };
    if (
      !Number.isFinite(data.lat) ||
      !Number.isFinite(data.lng) ||
      Date.now() - data.ts > TTL_MS
    )
      return null;
    return { lat: data.lat, lng: data.lng };
  } catch {
    return null;
  }
}

function setCachedPosition(position: UserPosition) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        lat: position.lat,
        lng: position.lng,
        ts: Date.now(),
      }),
    );
  } catch {
    /* ignore */
  }
}

type ContextValue = {
  position: UserPosition | null;
  resolved: boolean;
  /** Call when you need location; triggers a single request if not yet cached. */
  requestLocation: () => void;
};

const UserLocationContext = createContext<ContextValue>({
  position: null,
  resolved: false,
  requestLocation: () => {},
});

/** Tracks whether we've already started a geolocation request (avoid duplicate prompts). */
let requestStarted = false;

export function UserLocationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [position, setPosition] = useState<UserPosition | null>(null);
  const [resolved, setResolved] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const cached = getCachedPosition();
    if (cached) {
      queueMicrotask(() => {
        setPosition(cached);
        setResolved(true);
      });
    } else if (typeof navigator === "undefined" || !navigator.geolocation) {
      queueMicrotask(() => setResolved(true));
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (position !== null || resolved) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setResolved(true);
      return;
    }
    if (requestStarted) return;
    requestStarted = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          const p = { lat, lng };
          setCachedPosition(p);
          setPosition(p);
        }
        setResolved(true);
      },
      () => setResolved(true),
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: TTL_MS,
      },
    );
  }, [position, resolved]);

  return (
    <UserLocationContext.Provider
      value={{ position, resolved, requestLocation }}
    >
      {children}
    </UserLocationContext.Provider>
  );
}

export function useCachedUserLocation(): ContextValue {
  const ctx = useContext(UserLocationContext);
  useEffect(() => {
    if (!ctx.resolved && ctx.position === null) ctx.requestLocation();
  }, [ctx.resolved, ctx.position, ctx.requestLocation]);
  return ctx;
}
