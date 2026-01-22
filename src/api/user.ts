// src/api/user.ts

/**
 * User types and local cache helpers.
 * The login response contains the full user object, so we cache it
 * and reuse it across pages without an extra /me call.
 *
 * Note: localStorage is client-only. Avoid using getCachedUser() during SSR renders.
 */

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

export type User = {
  _id: string;
  username: string;
  profile_picture?: string;
  countriesVisited: CountryVisited[];
  citiesVisited: CityVisited[];

  // Badge progress payload from API (optional)
  badgeProgress?: BadgeProgress;
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
