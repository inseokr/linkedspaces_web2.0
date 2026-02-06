/**
 * View All Places: real data from getCachedUser().placeVisitHistory.
 * Same filtering as My Places: status !== "hidden", primaryPlace !== false.
 * Sort by visitedTime newest first. Map to PlaceWithSavedAt and derive year/country/category filters.
 */

import type { User } from "@/api/user";
import { assetUrl } from "@/api/assets";
import type {
  PlaceWithSavedAt,
  PlaceCategory,
  CountryWithCount,
} from "./mockData";
import { VIEW_ALL_CATEGORIES } from "./mockData";
import type { PlaceVisitHistoryEntry } from "../my-places/types";

function parseDate(input: string): Date | null {
  const s = String(input ?? "").trim();
  if (!s) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) {
    const y = Number(iso[1]), m = Number(iso[2]) - 1, d = Number(iso[3]);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d))
      return new Date(y, m, d);
  }
  const ymd = /^(\d{4})[:-](\d{2})[:-](\d{2})/.exec(s);
  if (ymd) {
    const y = Number(ymd[1]), m = Number(ymd[2]) - 1, d = Number(ymd[3]);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d))
      return new Date(y, m, d);
  }
  const parsed = Date.parse(s);
  if (Number.isFinite(parsed)) return new Date(parsed);
  return null;
}

function firstPhotoUri(photoList: Array<{ uri?: string; selected?: boolean }> | undefined): string | null {
  if (!Array.isArray(photoList)) return null;
  const selected = photoList.find((p) => p?.uri && !String(p.uri).startsWith("file://") && p.selected);
  if (selected?.uri) return assetUrl(selected.uri);
  const first = photoList.find((p) => p?.uri && !String(p.uri).startsWith("file://"));
  return first?.uri ? assetUrl(first.uri) : null;
}

const VIEW_ALL_CATEGORY_SET = new Set<string>(VIEW_ALL_CATEGORIES);

function toViewAllCategory(entryCategories?: string[]): PlaceCategory {
  if (Array.isArray(entryCategories) && entryCategories.length > 0) {
    const first = String(entryCategories[0]).trim();
    if (VIEW_ALL_CATEGORY_SET.has(first)) return first as PlaceCategory;
  }
  return "Attractions";
}

/** Build from placeVisitHistory when entries have placeName/visitedTime */
function fromPlaceVisitHistoryEntries(
  history: (PlaceVisitHistoryEntry | undefined)[]
): { id: string; title: string; country: string; countryCode: string; category: PlaceCategory; savedAt: Date; imageUrl: string | null }[] {
  const entries = history.filter((e): e is PlaceVisitHistoryEntry => {
    if (!e || typeof e !== "object") return false;
    if (e.status === "hidden") return false;
    if (e.primaryPlace === false && "primaryPlace" in e) return false;
    return true;
  }) as PlaceVisitHistoryEntry[];

  const withTime = entries.map((e, i) => {
    const t = e.visitedTime ?? e.visitedTimeDigitized ?? "";
    const d = parseDate(t);
    return { entry: e, savedAt: d ?? new Date(0), sortTime: d?.getTime() ?? 0, index: i };
  });
  withTime.sort((a, b) => b.sortTime - a.sortTime);

  return withTime.map(({ entry, savedAt, index }) => ({
    id: entry._id ?? `place-${index}`,
    title: entry.placeName?.trim() || "Place Name",
    country: entry.country ?? "",
    countryCode: (entry.countryCode ?? "").toLowerCase() || "unknown",
    category: toViewAllCategory(entry.categories),
    savedAt,
    imageUrl: firstPhotoUri(entry.photoList) ?? null,
  }));
}

/** Fallback: build from user.trips + placeVisitHistory by index */
function fromTripsAndHistory(
  user: User
): { id: string; title: string; country: string; countryCode: string; category: PlaceCategory; savedAt: Date; imageUrl: string | null }[] {
  const trips = user.trips ?? [];
  const placeVisitHistory = user.placeVisitHistory ?? [];
  const out: { id: string; title: string; country: string; countryCode: string; category: PlaceCategory; savedAt: Date; imageUrl: string | null }[] = [];

  for (const trip of trips) {
    const placeList = trip.placeList ?? [];
    const names = trip.visitedPlaceName ?? [];
    const tripStart = trip.startTimestamp ?? trip.startTimeString;
    const savedAt = parseDate(tripStart) ?? new Date(0);
    const country = trip.country ?? "";
    const countryCode = (trip.countryCode ?? "").toLowerCase() || "unknown";

    placeList.forEach((ref, i) => {
      const placeIndex = Number((ref as { placeIndex?: number })?.placeIndex);
      if (!Number.isFinite(placeIndex)) return;

      const hist = placeVisitHistory[placeIndex] as PlaceVisitHistoryEntry | undefined;
      const title = names[i] ?? hist?.placeName ?? hist?.city ?? hist?.country ?? "Place Name";
      const category = toViewAllCategory(hist?.categories);

      out.push({
        id: `${trip.blogKey}-${placeIndex}`,
        title,
        country,
        countryCode,
        category,
        savedAt,
        imageUrl: firstPhotoUri(hist?.photoList) ?? null,
      });
    });
  }

  out.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
  return out;
}

function flattenToViewAllShape(user: User): PlaceWithSavedAt[] {
  const history = user.placeVisitHistory ?? [];
  const hasNewShape = history.some(
    (e) =>
      e &&
      (typeof (e as PlaceVisitHistoryEntry).placeName === "string" ||
        typeof (e as PlaceVisitHistoryEntry).visitedTime === "string")
  );
  if (hasNewShape && history.length > 0) {
    const rows = fromPlaceVisitHistoryEntries(history as (PlaceVisitHistoryEntry | undefined)[]);
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      country: r.country,
      category: r.category,
      savedAt: r.savedAt,
      imageUrl: r.imageUrl,
    }));
  }
  const rows = fromTripsAndHistory(user);
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    country: r.country,
    category: r.category,
    savedAt: r.savedAt,
    imageUrl: r.imageUrl,
  }));
}

/** Unique years in data, descending */
export function deriveYears(places: PlaceWithSavedAt[]): number[] {
  const set = new Set(places.map((p) => p.savedAt.getFullYear()).filter(Number.isFinite));
  return Array.from(set).sort((a, b) => b - a);
}

/** Countries with counts; id is countryCode or slug for "All" */
export function deriveCountries(places: PlaceWithSavedAt[]): CountryWithCount[] {
  const byCountry = new Map<string, { name: string; id: string }>();
  for (const p of places) {
    if (!p.country) continue;
    const id = p.country.replace(/\s+/g, "-").toLowerCase() || "unknown";
    if (!byCountry.has(id)) byCountry.set(id, { name: p.country, id });
  }
  const counts = new Map<string, number>();
  for (const p of places) {
    if (!p.country) continue;
    const id = p.country.replace(/\s+/g, "-").toLowerCase() || "unknown";
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const all: CountryWithCount[] = [{ id: "all", name: "All", count: places.length }];
  byCountry.forEach(({ name, id }) => {
    all.push({ id, name, count: counts.get(id) ?? 0 });
  });
  return all;
}

/** Unique categories that appear in data (order: VIEW_ALL_CATEGORIES first, then rest) */
export function deriveCategories(places: PlaceWithSavedAt[]): PlaceCategory[] {
  const seen = new Set<PlaceCategory>();
  for (const p of places) seen.add(p.category);
  const ordered: PlaceCategory[] = [];
  for (const c of VIEW_ALL_CATEGORIES) {
    if (seen.has(c)) ordered.push(c);
  }
  seen.forEach((c) => {
    if (!ordered.includes(c)) ordered.push(c);
  });
  return ordered;
}

export function getViewAllPlacesFromUser(user: User | null): {
  places: PlaceWithSavedAt[];
  years: number[];
  countries: CountryWithCount[];
  categories: PlaceCategory[];
} {
  if (!user) {
    return {
      places: [],
      years: [],
      countries: [{ id: "all", name: "All", count: 0 }],
      categories: [...VIEW_ALL_CATEGORIES],
    };
  }

  const places = flattenToViewAllShape(user);
  const years = deriveYears(places);
  const countries = deriveCountries(places);
  const categories = deriveCategories(places);

  return {
    places,
    years,
    countries,
    categories,
  };
}
