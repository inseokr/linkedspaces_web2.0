// src/api/user.ts

/**
 * User types and local cache helpers.
 * Since login response already contains the full user object,
 * we can cache it and reuse across pages without an extra /me call.
 */

export type CountryVisited = {
  _id: string;
  country: string;
  countryCode: string; // "US"
  totalPlaces: number; // used for "Places" count and sorting
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

export type User = {
  _id: string;
  countriesVisited: CountryVisited[];
  citiesVisited: CityVisited[];
  // other fields exist, but we only type what we use for Travel Stats
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
