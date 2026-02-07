// src/api/user.ts

/**
 * User types and local cache helpers.
 * The login response contains the full user object, so we cache it
 * and reuse it across pages without an extra /me call.
 *
 * Note: localStorage is client-only. Avoid using getCachedUser() during SSR renders.
 */
import { Trip } from "./trips";
import { apiFetch } from "./client";

export type CountryVisited = {
  _id: string;
  country: string;
  countryCode: string; // "US"
  totalPlaces: number;
  visitCount: number;
};

export type CityVisited = {
  _id: string;
  cityCode: number;
  city: string;
  country: string;
  countryCode: string;
  totalPlaces: number;
  visitCount: number;
};

export type BadgeKey =
  | "foodie"
  | "mountainClimber"
  | "cityHopper"
  | "backpacker"
  | "sunsetChaser"
  | "nightOwl"
  | "wilderness";

export type BadgeItem = {
  name: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
};

export type BadgeProgress = {
  badges: Partial<Record<BadgeKey, BadgeItem>>;
  overallProgress?: {
    completed: number;
    total: number;
    percentage: number; // 0-100
  };
  lastUpdated?: string; // ISO string
};

export type PlacePhoto = {
  uri?: string;
  selected?: boolean;
  /** Caption/story for this photo (used for My Places card caption) */
  story?: string;
};

export type PlaceVisitHistoryItem = {
  placeIndex: number;
  country?: string;
  countryCode?: string;
  city?: string;
  state?: string;
  visitedCity?: string;
  coordinate?: GeoCoordinate;
  photoList?: PlacePhoto[];
  privacyControl?: { level?: string; allowedUserList?: string[] };
  /** Backend: display name for the place */
  placeName?: string;
  /** Backend: ISO or date string for sorting/display */
  visitedTime?: string;
  visitedTimeDigitized?: string;
  /** Backend: "hidden" = exclude from My Places */
  status?: string;
  /** Backend: when true, use this entry when duplicates exist */
  primaryPlace?: boolean;
  /** Backend: e.g. ["Cafe", "Restaurant"] for filter pills */
  categories?: string[];
  /** Backend: place-level story/caption (fallback when no photo story) */
  story?: string;
  /** Backend: like/heart count for Top Places (optional) */
  likes?: number;
  likeCount?: number;
  likesCount?: number;
};

export type GeoCoordinate = {
  latitude: number;
  longitude: number;
};

export type User = {
  _id: string;
  username: string;
  profile_picture?: string;
  countriesVisited: CountryVisited[];
  citiesVisited: CityVisited[];

  badgeProgress?: BadgeProgress;
  placeVisitHistory?: Array<PlaceVisitHistoryItem | undefined>;
  direct_friends?: {
    trips?: Trip[];
  };
  trips?: Trip[];
};

const USER_KEY = "user";

function safeSetStorageItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  // Safari (especially Private Browsing) can throw on localStorage access.
  try {
    window.localStorage.setItem(key, value);
    return;
  } catch {
    // ignore and try sessionStorage fallback
  }
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function safeGetStorageItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(key);
    if (v != null) return v;
  } catch {
    // ignore and try sessionStorage
  }
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeRemoveStorageItem(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function toSlimCachedUser(user: User): User {
  // Keep only what most UI needs (sidebar/menu/stats/badges/recap list).
  // This is used as a fallback when the full user object exceeds storage quota.
  return {
    _id: user._id,
    username: user.username,
    profile_picture: user.profile_picture,
    countriesVisited: user.countriesVisited ?? [],
    citiesVisited: user.citiesVisited ?? [],
    badgeProgress: user.badgeProgress,
    // Recap Blogs relies on `user.trips` to render the list.
    // This is typically much smaller than `placeVisitHistory`.
    trips: user.trips ?? [],
  };
}

export function setCachedUser(user: User) {
  // Cache is a best-effort optimization. Never block login on storage failures.
  try {
    safeSetStorageItem(USER_KEY, JSON.stringify(user));
  } catch {
    // JSON stringify could theoretically fail; ignore.
  }

  // If the full payload fails in Safari with QuotaExceededError, fallback to a slim cache.
  // (Note: safeSetStorageItem already swallows storage errors, so we retry with a smaller object
  // to improve the chance the cache exists for UI that reads it.)
  try {
    const existing = safeGetStorageItem(USER_KEY);
    if (existing == null) {
      safeSetStorageItem(USER_KEY, JSON.stringify(toSlimCachedUser(user)));
    }
  } catch {
    // ignore
  }
}

export function getCachedUser(): User | null {
  try {
    const raw = safeGetStorageItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function clearCachedUser() {
  safeRemoveStorageItem(USER_KEY);
}

/**
 * Update only badgeProgress in the cached user.
 * This prevents overwriting other user fields accidentally.
 */
export function setCachedBadgeProgress(badgeProgress: BadgeProgress) {
  const existing = getCachedUser();
  if (!existing) return;

  setCachedUser({
    ...existing,
    badgeProgress,
  });
}

export type UpdatePlaceVisitHistoryStoryRequest = {
  placeKey: string;
  /** If omitted/null => updates place-level story. */
  photoIndex?: number | null;
  /** Allow empty string to clear. */
  storyText: string;
  photoIndexType: "filtered" | "all";
};

type SimpleResult = { result: "OK" | "FAIL"; reason?: string };

export async function updatePlaceVisitHistoryStory(
  body: UpdatePlaceVisitHistoryStoryRequest,
) {
  console.log("[updatePlaceVisitHistoryStory] body", JSON.stringify(body));
  const token =
    typeof window !== "undefined"
      ? (() => {
          try {
            const t = window.localStorage.getItem("token");
            if (t) return t;
          } catch {
            // ignore and try sessionStorage
          }
          try {
            return window.sessionStorage.getItem("token") ?? undefined;
          } catch {
            return undefined;
          }
        })()
      : undefined;
  const res = await apiFetch<SimpleResult>(`/placeVisitHistory/story`, {
    method: "POST",
    body,
    // NOTE: Do NOT send credentials cross-origin.
    // If the backend returns `Access-Control-Allow-Origin: *`, browsers will reject any
    // credentialed (cookie) request. This endpoint should rely on the Bearer token instead.
    token,
  });

  if (!res || res.result !== "OK") {
    throw new Error(res?.reason || "Failed to update story");
  }
}
