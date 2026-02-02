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

export function setCachedUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function clearCachedUser() {
  localStorage.removeItem(USER_KEY);
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
};

type SimpleResult = { result: "OK" | "FAIL"; reason?: string };

export async function updatePlaceVisitHistoryStory(
  body: UpdatePlaceVisitHistoryStoryRequest,
) {
  console.log("[updatePlaceVisitHistoryStory] body", JSON.stringify(body));
  const res = await apiFetch<SimpleResult>(`/placeVisitHistory/story`, {
    method: "POST",
    body,
    // backend uses req.user (session cookie)
    credentials: "include",
  });

  if (!res || res.result !== "OK") {
    throw new Error(res?.reason || "Failed to update story");
  }
}
