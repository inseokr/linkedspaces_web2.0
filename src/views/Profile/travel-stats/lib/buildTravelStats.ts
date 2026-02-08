/**
 * Pure aggregator for Travel Stats. Computes headline stats, highlights, and
 * optional people/patterns from places, trips (recap blogs), and optional friends.
 * Safe for empty arrays and missing fields. Used by useTravelStats hook.
 * File: src/views/Profile/travel-stats/lib/buildTravelStats.ts
 */

import type {
  TravelStatsResult,
  ScopeStats,
  HeadlineStats,
  MostVisitedPlace,
  FirstOrRecentPlace,
  LongestTrip,
  MostActiveMonth,
  ReturningPlace,
  MostAddedCategory,
  PeopleAndPatterns,
} from "../statsTypes";
import { haversineMiles } from "./haversine";

/** Minimal place-like item (from placeVisitHistory or normalized mock). */
export type StatsPlaceInput = {
  id: string;
  placeName: string;
  city?: string | null;
  country?: string | null;
  countryCode?: string | null;
  lat?: number | null;
  lng?: number | null;
  /** ISO or YYYY-MM-DD for sorting; used for first/most recent and distance order */
  visitedTime?: string | null;
  photoList?: Array<{
    story?: string;
    audio?: unknown;
    storyAudio?: unknown;
  }> | null;
  /** When mapping from real data, set to first/cover photo URL for highlights */
  firstPhotoUri?: string | null;
  /** e.g. ["Cafe", "Restaurant"] for most added category */
  categories?: string[] | null;
};

/** Minimal recap/trip item (from user.trips or mock). */
export type StatsRecapInput = {
  id: string;
  title?: string | null;
  startTimeString?: string | null;
  endTimeString?: string | null;
  startTimestamp?: string | null;
  endTimestamp?: string | null;
  coverPhotoUri?: string | null;
  placeList?: Array<{ placeIndex?: number }> | null;
};

export type BuildTravelStatsInput = {
  places: StatsPlaceInput[];
  recapBlogs: StatsRecapInput[];
  friends?: Array<unknown> | null;
};

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseDate(input: string | undefined | null): Date | null {
  if (!input || typeof input !== "string") return null;
  const s = input.trim().split(" ")[0] ?? input;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) {
    const y = Number(iso[1]),
      m = Number(iso[2]) - 1,
      d = Number(iso[3]);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d))
      return new Date(y, m, d);
  }
  const ymd = /^(\d{4})[:-](\d{2})[:-](\d{2})/.exec(s);
  if (ymd) {
    const y = Number(ymd[1]),
      m = Number(ymd[2]) - 1,
      d = Number(ymd[3]);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d))
      return new Date(y, m, d);
  }
  const parsed = Date.parse(s);
  return Number.isFinite(parsed) ? new Date(parsed) : null;
}

function getPlaceDate(p: StatsPlaceInput): number {
  const d = parseDate(p.visitedTime);
  return d ? d.getTime() : 0;
}

function uniqueDaysFromPlaces(places: StatsPlaceInput[]): number {
  const days = new Set<string>();
  for (const p of places) {
    const d = parseDate(p.visitedTime);
    if (d) days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  return days.size;
}

function tripDays(recap: StatsRecapInput): number {
  const start = parseDate(
    recap.startTimestamp ?? recap.startTimeString ?? null,
  );
  const end = parseDate(recap.endTimestamp ?? recap.endTimeString ?? null);
  if (!start || !end) return 0;
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
  return Math.max(0, diff + 1);
}

function uniqueDaysFromRecaps(recaps: StatsRecapInput[]): number {
  const days = new Set<string>();
  for (const r of recaps) {
    const start = parseDate(r.startTimestamp ?? r.startTimeString ?? null);
    const end = parseDate(r.endTimestamp ?? r.endTimeString ?? null);
    if (!start || !end) continue;
    const startT = start.getTime();
    const endT = end.getTime();
    for (let t = startT; t <= endT; t += 86400000)
      days.add(
        `${new Date(t).getFullYear()}-${new Date(t).getMonth()}-${new Date(t).getDate()}`,
      );
  }
  return days.size;
}

/** Sequential haversine between places sorted by visitedTime; cap leg at 2000 mi to avoid spikes. */
function estimatedDistanceMiles(places: StatsPlaceInput[]): number {
  const withCoords = places
    .filter(
      (p) =>
        p.lat != null &&
        p.lng != null &&
        Number.isFinite(p.lat) &&
        Number.isFinite(p.lng),
    )
    .sort((a, b) => getPlaceDate(a) - getPlaceDate(b));
  if (withCoords.length < 2) return 0;
  let total = 0;
  const cap = 2000;
  for (let i = 1; i < withCoords.length; i++) {
    const a = withCoords[i - 1];
    const b = withCoords[i];
    const d = haversineMiles(
      a.lat as number,
      a.lng as number,
      b.lat as number,
      b.lng as number,
    );
    total += Math.min(d, cap);
  }
  return Math.round(total);
}

function normalizeStr(s: string | undefined | null): string {
  return String(s ?? "").trim();
}

function defaultFirstPhotoUrl(place: StatsPlaceInput): string | null {
  return place.firstPhotoUri ?? null;
}

/** Build scope stats for a filtered set of places and recaps. */
function buildScopeStats(
  places: StatsPlaceInput[],
  recaps: StatsRecapInput[],
  friends: BuildTravelStatsInput["friends"],
  options: { firstPhotoUrlResolver?: (p: StatsPlaceInput) => string | null },
): ScopeStats {
  const getPhotoUrl = options.firstPhotoUrlResolver ?? defaultFirstPhotoUrl;

  const placeDays = uniqueDaysFromPlaces(places);
  const recapDays = uniqueDaysFromRecaps(recaps);
  const daysExplored =
    placeDays >= recapDays ? placeDays : recapDays || placeDays;

  const countries = new Set<string>();
  const cities = new Set<string>();
  const countryCodeToCount = new Map<string, number>();
  for (const p of places) {
    const c = normalizeStr(p.country);
    if (c) countries.add(c);
    const city = normalizeStr(p.city);
    if (city) cities.add(city);
    const code = normalizeStr(p.countryCode).toUpperCase();
    if (code && code.length === 2) {
      countryCodeToCount.set(code, (countryCodeToCount.get(code) ?? 0) + 1);
    }
  }

  const headlineStats: HeadlineStats = {
    totalPlacesSaved: places.length,
    daysExplored,
    citiesVisitedCount: cities.size,
    countriesVisitedCount: countries.size,
    recapBlogsCreatedCount: recaps.length,
    estimatedDistanceMiles: estimatedDistanceMiles(places),
  };

  // Most visited: group by stable key (id or name+city+country), count distinct days the user saved that place
  const visitDaysByKey = new Map<
    string,
    { days: Set<string>; place: StatsPlaceInput }
  >();
  for (const p of places) {
    const key =
      p.id ||
      `${normalizeStr(p.placeName)}|${normalizeStr(p.city)}|${normalizeStr(p.country)}`;
    const d = parseDate(p.visitedTime);
    const dayStr = d
      ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      : null;
    const prev = visitDaysByKey.get(key);
    if (prev) {
      if (dayStr) prev.days.add(dayStr);
    } else {
      const days = new Set<string>();
      if (dayStr) days.add(dayStr);
      visitDaysByKey.set(key, { days, place: p });
    }
  }
  let mostVisitedPlace: MostVisitedPlace | null = null;
  let maxVisits = 0;
  for (const [, { days, place }] of visitDaysByKey) {
    const count = days.size;
    if (count > maxVisits) {
      maxVisits = count;
      mostVisitedPlace = {
        placeId: place.id,
        name: normalizeStr(place.placeName) || "Unnamed",
        city: normalizeStr(place.city),
        country: normalizeStr(place.country),
        photoUrl: getPhotoUrl(place),
        visitsCount: count,
      };
    }
  }

  // First / most recent by date
  const sortedByDate = [...places].sort(
    (a, b) => getPlaceDate(a) - getPlaceDate(b),
  );
  const firstSavedPlace: FirstOrRecentPlace | null = sortedByDate.length
    ? (() => {
        const p = sortedByDate[0];
        const d = parseDate(p.visitedTime);
        return {
          placeId: p.id,
          name: normalizeStr(p.placeName) || "Unnamed",
          date: d
            ? d.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—",
          photoUrl: getPhotoUrl(p),
        };
      })()
    : null;
  const mostRecentPlace: FirstOrRecentPlace | null = sortedByDate.length
    ? (() => {
        const p = sortedByDate[sortedByDate.length - 1];
        const d = parseDate(p.visitedTime);
        return {
          placeId: p.id,
          name: normalizeStr(p.placeName) || "Unnamed",
          date: d
            ? d.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—",
          photoUrl: getPhotoUrl(p),
        };
      })()
    : null;

  // Longest trip
  let longestTrip: LongestTrip | null = null;
  let maxDays = 0;
  for (const r of recaps) {
    const days = tripDays(r);
    if (days > maxDays) {
      maxDays = days;
      const start = parseDate(r.startTimestamp ?? r.startTimeString ?? null);
      const end = parseDate(r.endTimestamp ?? r.endTimeString ?? null);
      const dateRange =
        start && end
          ? `${start.toLocaleDateString(undefined, { month: "short" })} ${start.getDate()} – ${end.toLocaleDateString(undefined, { month: "short" })} ${end.getDate()}, ${end.getFullYear()}`
          : String(r.startTimeString ?? "");
      longestTrip = {
        recapBlogId: r.id,
        title: normalizeStr(r.title) || "Trip",
        dateRange,
        days,
        placesCount: r.placeList?.length ?? 0,
        coverPhotoUrl: r.coverPhotoUri ? String(r.coverPhotoUri) : null,
      };
    }
  }

  // Most active month (places saved)
  const monthCount: Record<string, { places: number; recaps: number }> = {};
  for (const p of places) {
    const d = parseDate(p.visitedTime);
    if (d) {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthCount[key]) monthCount[key] = { places: 0, recaps: 0 };
      monthCount[key].places += 1;
    }
  }
  for (const r of recaps) {
    const d = parseDate(r.startTimestamp ?? r.startTimeString ?? null);
    if (d) {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthCount[key]) monthCount[key] = { places: 0, recaps: 0 };
      monthCount[key].recaps += 1;
    }
  }
  let mostActiveMonth: MostActiveMonth | null = null;
  let maxPlacesInMonth = 0;
  for (const [key, v] of Object.entries(monthCount)) {
    const total = v.places + v.recaps;
    if (total > maxPlacesInMonth) {
      maxPlacesInMonth = total;
      const [y, m] = key.split("-").map(Number);
      mostActiveMonth = {
        monthLabel: `${MONTH_LABELS[m]} ${y}`,
        placesSavedCount: v.places,
        recapBlogsCount: v.recaps,
      };
    }
  }

  // Returning place: same as most visited but only if visitsCount > 1
  const returningPlace: ReturningPlace | null =
    mostVisitedPlace && mostVisitedPlace.visitsCount > 1
      ? {
          placeId: mostVisitedPlace.placeId,
          name: mostVisitedPlace.name,
          visitsCount: mostVisitedPlace.visitsCount,
          photoUrl: mostVisitedPlace.photoUrl,
        }
      : null;

  // Most added category: count places per category (each place can add to multiple categories)
  const categoryToCount = new Map<string, number>();
  for (const p of places) {
    const cats = p.categories;
    if (Array.isArray(cats) && cats.length > 0) {
      for (const c of cats) {
        const name = normalizeStr(c);
        if (name) {
          const key =
            name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
          categoryToCount.set(key, (categoryToCount.get(key) ?? 0) + 1);
        }
      }
    }
  }
  let mostAddedCategory: MostAddedCategory | null = null;
  let maxCategoryCount = 0;
  for (const [category, count] of categoryToCount.entries()) {
    if (count > maxCategoryCount) {
      maxCategoryCount = count;
      mostAddedCategory = { category, count };
    }
  }

  // People & patterns: only if we have friends; coExplored requires backend "explored with" data
  let peopleAndPatterns: PeopleAndPatterns | null = null;
  if (friends && friends.length > 0) {
    const coExploredCount = 0; // No per-trip "with whom" in current schema
    peopleAndPatterns = {
      coExploredCount,
      soloVsGroupRatio: 1, // Assume solo if no data
    };
  }

  const countryStats = Array.from(countryCodeToCount.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([code, value]) => ({ code, value }));
  const countryCodes = countryStats.map((s) => s.code);

  // Countries with cities (for All Countries section)
  const countryKeyToData = new Map<
    string,
    {
      countryName: string;
      countryCode: string;
      cityToCount: Map<string, number>;
    }
  >();
  for (const p of places) {
    const code = normalizeStr(p.countryCode).toUpperCase();
    const countryKey =
      code && code.length === 2 ? code : normalizeStr(p.country) || "Unknown";
    const countryName = normalizeStr(p.country) || countryKey;
    const cityName = normalizeStr(p.city) || "Unknown";
    if (!countryKeyToData.has(countryKey)) {
      countryKeyToData.set(countryKey, {
        countryName,
        countryCode: code && code.length === 2 ? code : "",
        cityToCount: new Map(),
      });
    }
    const data = countryKeyToData.get(countryKey)!;
    data.cityToCount.set(cityName, (data.cityToCount.get(cityName) ?? 0) + 1);
  }
  const countriesWithCities = Array.from(countryKeyToData.entries())
    .map(([_, data]) => {
      const cities = Array.from(data.cityToCount.entries())
        .sort(([, a], [, b]) => b - a)
        .map(([city, places]) => ({ city, places }));
      const placesCount = cities.reduce((sum, c) => sum + c.places, 0);
      return {
        country: data.countryName,
        countryCode: data.countryCode || undefined,
        citiesCount: cities.length,
        placesCount,
        cities,
      };
    })
    .sort((a, b) => b.placesCount - a.placesCount);

  return {
    headlineStats,
    geography: { countryCodes, countryStats },
    countriesWithCities,
    highlights: {
      mostVisitedPlace,
      firstSavedPlace,
      mostRecentPlace,
      longestTrip,
      mostActiveMonth,
      returningPlace,
      mostAddedCategory,
    },
    peopleAndPatterns,
  };
}

type ScopeFilterKey =
  | "lifetime"
  | "thisYear"
  | "last6Months"
  | "2025"
  | "2024"
  | "2023";

function filterByScope(
  places: StatsPlaceInput[],
  recaps: StatsRecapInput[],
  scope: ScopeFilterKey,
): { places: StatsPlaceInput[]; recaps: StatsRecapInput[] } {
  const now = Date.now();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const currentYear = new Date().getFullYear();
  const thisYearStart = new Date(currentYear, 0, 1).getTime();

  if (scope === "lifetime") {
    return { places: [...places], recaps: [...recaps] };
  }

  // Year scope: 2025, 2024, 2023
  const yearNum =
    scope === "2025" || scope === "2024" || scope === "2023"
      ? Number(scope)
      : null;
  if (yearNum != null) {
    const yearStart = new Date(yearNum, 0, 1).getTime();
    const yearEnd = new Date(yearNum, 11, 31, 23, 59, 59, 999).getTime();
    return {
      places: places.filter((p) => {
        const t = getPlaceDate(p);
        return t >= yearStart && t <= yearEnd;
      }),
      recaps: recaps.filter((r) => {
        const t = parseDate(
          r.startTimestamp ?? r.startTimeString ?? null,
        )?.getTime();
        return t != null && t >= yearStart && t <= yearEnd;
      }),
    };
  }

  const filterPlace = (p: StatsPlaceInput) => {
    const t = getPlaceDate(p);
    if (!t) return false;
    if (scope === "thisYear") return t >= thisYearStart;
    return t >= sixMonthsAgo.getTime();
  };

  const filterRecap = (r: StatsRecapInput) => {
    const t = parseDate(
      r.startTimestamp ?? r.startTimeString ?? null,
    )?.getTime();
    if (!t) return false;
    if (scope === "thisYear") return t >= thisYearStart;
    return t >= sixMonthsAgo.getTime();
  };

  return {
    places: places.filter(filterPlace),
    recaps: recaps.filter(filterRecap),
  };
}

export function buildTravelStats(
  input: BuildTravelStatsInput,
  options?: { firstPhotoUrlResolver?: (p: StatsPlaceInput) => string | null },
): TravelStatsResult {
  const { places, recapBlogs, friends } = input;
  const resolver = options?.firstPhotoUrlResolver ?? null;

  const lifetime = filterByScope(places, recapBlogs, "lifetime");
  const thisYear = filterByScope(places, recapBlogs, "thisYear");
  const last6Months = filterByScope(places, recapBlogs, "last6Months");
  const y2025 = filterByScope(places, recapBlogs, "2025");
  const y2024 = filterByScope(places, recapBlogs, "2024");
  const y2023 = filterByScope(places, recapBlogs, "2023");

  const build = (p: StatsPlaceInput[], r: StatsRecapInput[]) =>
    buildScopeStats(p, r, friends, {
      firstPhotoUrlResolver: resolver ?? undefined,
    });

  return {
    timeScopes: {
      lifetime: build(lifetime.places, lifetime.recaps),
      thisYear: build(thisYear.places, thisYear.recaps),
      last6Months: build(last6Months.places, last6Months.recaps),
      "2025": build(y2025.places, y2025.recaps),
      "2024": build(y2024.places, y2024.recaps),
      "2023": build(y2023.places, y2023.recaps),
    },
  };
}
