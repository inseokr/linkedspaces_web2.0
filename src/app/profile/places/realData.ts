/**
 * View All Places: real data from getCachedUser().placeVisitHistory.
 * Same filtering as My Places: only exclude status === "hidden" so View All shows the same set as Feed/My Places.
 * Sort by visitedTime newest first. Map to PlaceWithSavedAt and derive year/country/category filters.
 */

import type { User, PlaceVisitHistoryItem } from "@/api/user";
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
  if (Number.isFinite(parsed)) return new Date(parsed);
  return null;
}

function firstPhotoUri(
  photoList: Array<{ uri?: string; selected?: boolean }> | undefined,
): string | null {
  if (!Array.isArray(photoList)) return null;
  const selected = photoList.find(
    (p) => p?.uri && !String(p.uri).startsWith("file://") && p.selected,
  );
  if (selected?.uri) return assetUrl(selected.uri);
  const first = photoList.find(
    (p) => p?.uri && !String(p.uri).startsWith("file://"),
  );
  return first?.uri ? assetUrl(first.uri) : null;
}

function allPhotoUris(
  photoList: Array<{ uri?: string }> | undefined,
): string[] {
  if (!Array.isArray(photoList)) return [];
  return photoList
    .filter((p) => p?.uri && !String(p.uri).startsWith("file://"))
    .map((p) => assetUrl(p!.uri!));
}

/** Infer simple sentiment from caption/story text for list view */
function inferSentiment(text: string): "positive" | "neutral" | "negative" {
  const lower = text.trim().toLowerCase();
  if (!lower) return "neutral";
  const positive =
    /\b(love|lovely|loved|great|amazing|awesome|best|recommend|wonderful|excellent|fantastic|perfect|would (get|go|visit|come) again)\b/.test(
      lower,
    );
  const negative =
    /\b(disappoint|bad|worst|avoid|overrated|mediocre|never again|not worth)\b/.test(
      lower,
    );
  if (positive && !negative) return "positive";
  if (negative && !positive) return "negative";
  return "neutral";
}

/** Caption from place-level or first photo's story/caption */
function getCaptionForViewAll(entry: PlaceVisitHistoryEntry): string {
  const placeStory = typeof entry.story === "string" ? entry.story.trim() : "";
  if (placeStory) return placeStory;
  const caption = (entry as { caption?: string }).caption;
  const placeCaption = typeof caption === "string" ? caption.trim() : "";
  if (placeCaption) return placeCaption;
  const list = Array.isArray(entry.photoList) ? entry.photoList : [];
  const first = list[0] as { story?: string; caption?: string } | undefined;
  const photoStory =
    first && typeof first.story === "string" ? first.story.trim() : "";
  if (photoStory) return photoStory;
  const photoCaption =
    first && typeof first.caption === "string" ? first.caption.trim() : "";
  return photoCaption ?? "";
}

const VIEW_ALL_CATEGORY_SET = new Set<string>(VIEW_ALL_CATEGORIES);

/** Map backend/variant category strings (lowercase) to View All PlaceCategory so real data shows correct categories */
const BACKEND_CATEGORY_TO_VIEW_ALL: Record<string, PlaceCategory> = {
  cafe: "Cafe",
  café: "Cafe",
  coffee: "Cafe",
  tea: "Cafe",
  restaurants: "Restaurants",
  restaurant: "Restaurants",
  dining: "Restaurants",
  food: "Restaurants",
  shopping: "Shopping",
  shop: "Shopping",
  store: "Shopping",
  golf: "Golf",
  attractions: "Attractions",
  attraction: "Attractions",
  sightseeing: "Sightseeing",
  sights: "Sightseeing",
  activity: "Activity",
  activities: "Activity",
  "hotels/resorts": "Hotels/Resorts",
  hotel: "Hotels/Resorts",
  resorts: "Hotels/Resorts",
  lodging: "Hotels/Resorts",
  accommodation: "Hotels/Resorts",
  bakery: "Bakery",
  bakeries: "Bakery",
  park: "Attractions",
  nature: "Attractions",
  museum: "Attractions",
  bar: "Attractions",
  nightlife: "Attractions",
};

/** Canonical country names so "US" and "United States" group under one pill */
const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  us: "United States",
  usa: "United States",
  uk: "United Kingdom",
  gb: "United Kingdom",
  kr: "South Korea",
  jp: "Japan",
  de: "Germany",
  fr: "France",
  it: "Italy",
  es: "Spain",
  ca: "Canada",
  au: "Australia",
  mx: "Mexico",
  br: "Brazil",
  in: "India",
  cn: "China",
};

/** Merge "United States" (20) and "United States of America" into one pill; same for other variants */
const COUNTRY_NAME_TO_CANONICAL: Record<string, string> = {
  "united states of america": "United States",
  usa: "United States",
  us: "United States",
  "u.s.": "United States",
  "u.s.a.": "United States",
  "united kingdom of great britain and northern ireland": "United Kingdom",
  "great britain": "United Kingdom",
  england: "United Kingdom",
  gb: "United Kingdom",
  uk: "United Kingdom",
  "republic of korea": "South Korea",
  korea: "South Korea",
  kr: "South Korea",
  대한민국: "South Korea",
};

/** US state/territory 2-letter codes so we can infer United States when only state (e.g. CA) is set */
const US_STATE_CODES = new Set([
  "al",
  "ak",
  "az",
  "ar",
  "ca",
  "co",
  "ct",
  "de",
  "fl",
  "ga",
  "hi",
  "id",
  "il",
  "in",
  "ia",
  "ks",
  "ky",
  "la",
  "me",
  "md",
  "ma",
  "mi",
  "mn",
  "ms",
  "mo",
  "mt",
  "ne",
  "nv",
  "nh",
  "nj",
  "nm",
  "ny",
  "nc",
  "nd",
  "oh",
  "ok",
  "or",
  "pa",
  "ri",
  "sc",
  "sd",
  "tn",
  "tx",
  "ut",
  "vt",
  "va",
  "wa",
  "wv",
  "wi",
  "wy",
  "dc",
  "gu",
  "pr",
  "vi",
  "as",
  "mp",
]);

/** Common US state names (lowercase) for inference when backend sends "California" etc. */
const US_STATE_NAMES: Record<string, string> = {
  alabama: "United States",
  alaska: "United States",
  arizona: "United States",
  arkansas: "United States",
  california: "United States",
  colorado: "United States",
  connecticut: "United States",
  delaware: "United States",
  florida: "United States",
  georgia: "United States",
  hawaii: "United States",
  idaho: "United States",
  illinois: "United States",
  indiana: "United States",
  iowa: "United States",
  kansas: "United States",
  kentucky: "United States",
  louisiana: "United States",
  maine: "United States",
  maryland: "United States",
  massachusetts: "United States",
  michigan: "United States",
  minnesota: "United States",
  mississippi: "United States",
  missouri: "United States",
  montana: "United States",
  nebraska: "United States",
  nevada: "United States",
  "new hampshire": "United States",
  "new jersey": "United States",
  "new mexico": "United States",
  "new york": "United States",
  "north carolina": "United States",
  "north dakota": "United States",
  ohio: "United States",
  oklahoma: "United States",
  oregon: "United States",
  pennsylvania: "United States",
  "rhode island": "United States",
  "south carolina": "United States",
  "south dakota": "United States",
  tennessee: "United States",
  texas: "United States",
  utah: "United States",
  vermont: "United States",
  virginia: "United States",
  washington: "United States",
  "west virginia": "United States",
  wisconsin: "United States",
  wyoming: "United States",
  "district of columbia": "United States",
};

/** When country/countryCode are empty, infer country from state (e.g. CA or California → United States). */
function inferCountryFromState(state: string | undefined): string {
  const s = (state ?? "").trim();
  if (!s) return "";
  const lower = s.toLowerCase();
  if (lower.length === 2 && US_STATE_CODES.has(lower)) return "United States";
  return US_STATE_NAMES[lower] ?? "";
}

/** Infer US when city contains ", CA" or ", California" etc. (e.g. "San Ramon, CA" with no separate state/country). */
function inferCountryFromCity(city: string | undefined): string {
  const s = (city ?? "").trim();
  if (!s) return "";
  const lower = s.toLowerCase();
  const commaLast = /,\s*([^,]+)$/.exec(lower);
  if (commaLast) {
    const part = commaLast[1].trim();
    if (part.length === 2 && US_STATE_CODES.has(part)) return "United States";
    if (US_STATE_NAMES[part]) return "United States";
  }
  return "";
}

/** Rough US bounding box (continental + Alaska + Hawaii) to infer country when only coordinates exist. */
function isCoordinateInUS(coord: unknown): boolean {
  if (!coord || typeof coord !== "object") return false;
  const c = coord as Record<string, unknown>;
  const lat = Number(c.latitude ?? c.lat);
  const lng = Number(c.longitude ?? c.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat >= 24 && lat <= 50 && lng >= -125 && lng <= -66) return true;
  if (lat >= 51 && lat <= 72 && lng >= -180 && lng <= -130) return true;
  if (lat >= 18 && lat <= 23 && lng >= -161 && lng <= -154) return true;
  return false;
}

function normalizeCountry(country: string, countryCode?: string): string {
  const trimmed = (country ?? "").trim();
  if (trimmed) {
    const lower = trimmed.toLowerCase();
    return COUNTRY_NAME_TO_CANONICAL[lower] ?? trimmed;
  }
  const code = (countryCode ?? "").trim().toLowerCase();
  return code ? (COUNTRY_CODE_TO_NAME[code] ?? code) : "";
}

function toViewAllCategory(entryCategories?: string[]): PlaceCategory {
  if (!Array.isArray(entryCategories) || entryCategories.length === 0)
    return "Attractions";
  for (const raw of entryCategories) {
    const s = String(raw ?? "").trim();
    if (!s) continue;
    if (VIEW_ALL_CATEGORY_SET.has(s)) return s as PlaceCategory;
    const mapped = BACKEND_CATEGORY_TO_VIEW_ALL[s.toLowerCase()];
    if (mapped) return mapped;
  }
  return "Attractions";
}

type ViewAllRow = {
  id: string;
  title: string;
  country: string;
  countryCode: string;
  category: PlaceCategory;
  savedAt: Date;
  imageUrl: string | null;
  photoListUris?: string[];
  caption?: string;
  visitedTimeRaw?: string;
  sentiment?: "positive" | "neutral" | "negative";
};

const DEBUG_VIEW_ALL =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

/** Build from full placeVisitHistory: every entry is one place visit (correct count per country/category) */
function fromPlaceVisitHistoryEntries(
  history: (PlaceVisitHistoryEntry | undefined)[],
): ViewAllRow[] {
  const excluded: { name: string; reason: string; index: number }[] = [];
  const entries = history.filter((e, index): e is PlaceVisitHistoryEntry => {
    if (!e || typeof e !== "object") {
      if (DEBUG_VIEW_ALL)
        excluded.push({
          name: "(invalid entry)",
          reason: "not an object",
          index,
        });
      return false;
    }
    const name =
      (e.placeName ?? e.city ?? e.country ?? "").trim() || "(no name)";
    if (e.status === "hidden") {
      if (DEBUG_VIEW_ALL)
        excluded.push({ name, reason: "status === 'hidden'", index });
      return false;
    }
    return true;
  }) as PlaceVisitHistoryEntry[];

  if (DEBUG_VIEW_ALL && excluded.length > 0) {
    console.log(
      "[View All Places] Excluded entries (not shown in list):",
      excluded,
    );
    const relo = excluded.find((x) => /relo|vietnamese sandwich/i.test(x.name));
    if (relo)
      console.log("[View All Places] Found your place in excluded list:", relo);
  }

  const withTime = entries.map((e, i) => {
    const t = e.visitedTime ?? e.visitedTimeDigitized ?? "";
    const d = parseDate(t);
    return {
      entry: e,
      savedAt: d ?? new Date(0),
      sortTime: d?.getTime() ?? 0,
      index: i,
    };
  });
  withTime.sort((a, b) => b.sortTime - a.sortTime);

  return withTime.map(({ entry, savedAt, index }) => {
    const rawCountry = entry.country ?? "";
    const code = (entry.countryCode ?? "").trim().toLowerCase();
    const stateOrRegion =
      entry.state ?? (entry as { region?: string }).region ?? "";
    const country =
      normalizeCountry(rawCountry, entry.countryCode) ||
      inferCountryFromState(stateOrRegion) ||
      inferCountryFromCity(entry.city) ||
      (isCoordinateInUS(entry.coordinate) ? "United States" : "");
    const uris = allPhotoUris(entry.photoList);
    return {
      id: entry._id ?? `place-${index}`,
      title:
        entry.placeName?.trim() ||
        entry.city?.trim() ||
        entry.country?.trim() ||
        "Place Name",
      country: country || (code ? code.toUpperCase() : ""),
      countryCode: code || "unknown",
      category: toViewAllCategory(entry.categories),
      savedAt,
      imageUrl: firstPhotoUri(entry.photoList) ?? null,
      photoListUris: uris.length > 0 ? uris : undefined,
      caption: getCaptionForViewAll(entry) || undefined,
      visitedTimeRaw:
        (entry.visitedTime ?? entry.visitedTimeDigitized ?? "") || undefined,
      sentiment: inferSentiment(getCaptionForViewAll(entry)),
    };
  });
}

/** Fallback: build from user.trips + placeVisitHistory by index (per-place country from hist when available) */
function fromTripsAndHistory(user: User): ViewAllRow[] {
  const trips = user.trips ?? [];
  const placeVisitHistory = user.placeVisitHistory ?? [];
  const out: ViewAllRow[] = [];

  for (const trip of trips) {
    const placeList = trip.placeList ?? [];
    const names = trip.visitedPlaceName ?? [];
    const tripStart = trip.startTimestamp ?? trip.startTimeString;
    const tripSavedAt = parseDate(tripStart) ?? new Date(0);
    const tripCountry = trip.country ?? "";
    const tripCountryCode = (trip.countryCode ?? "").toLowerCase() || "unknown";

    placeList.forEach((ref, i) => {
      const placeIndex = Number((ref as { placeIndex?: number })?.placeIndex);
      if (!Number.isFinite(placeIndex)) return;

      const hist = placeVisitHistory[placeIndex] as
        | PlaceVisitHistoryEntry
        | undefined;
      const title =
        names[i] ??
        hist?.placeName ??
        hist?.city ??
        hist?.country ??
        "Place Name";
      const category = toViewAllCategory(hist?.categories);
      const country =
        normalizeCountry(
          hist?.country ?? tripCountry,
          hist?.countryCode ?? trip.countryCode,
        ) ||
        inferCountryFromState(hist?.state) ||
        inferCountryFromCity(hist?.city) ||
        (isCoordinateInUS(hist?.coordinate) ? "United States" : "");
      const countryCode =
        (hist?.countryCode ?? trip.countryCode ?? "").toLowerCase() ||
        "unknown";
      const uris = hist ? allPhotoUris(hist.photoList) : [];
      const visitedTimeRaw = hist
        ? (hist.visitedTime ?? hist.visitedTimeDigitized ?? "") || undefined
        : undefined;

      const caption = hist
        ? getCaptionForViewAll(hist) || undefined
        : undefined;
      out.push({
        id: `${trip.blogKey}-${placeIndex}`,
        title,
        country: country || tripCountry,
        countryCode,
        category,
        savedAt: tripSavedAt,
        imageUrl: firstPhotoUri(hist?.photoList) ?? null,
        photoListUris: uris.length > 0 ? uris : undefined,
        caption,
        visitedTimeRaw,
        sentiment: inferSentiment(caption ?? ""),
      });
    });
  }

  out.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
  return out;
}

/**
 * Use full placeVisitHistory when non-empty so every visit appears (same as My Places / Feed).
 * Only fall back to trips when history is empty.
 */
function flattenToViewAllShape(user: User): PlaceWithSavedAt[] {
  const history = user.placeVisitHistory ?? [];
  if (DEBUG_VIEW_ALL) {
    console.log(
      "[View All Places] Data source:",
      history.length > 0 ? "full placeVisitHistory" : "trips fallback",
    );
    console.log(
      "[View All Places] Raw placeVisitHistory length:",
      history.length,
    );
    const allNames = history
      .filter((e): e is PlaceVisitHistoryItem => !!e && typeof e === "object")
      .map(
        (e) => (e.placeName ?? e.city ?? e.country ?? "").trim() || "(no name)",
      );
    const reloInRaw = allNames.findIndex((n) =>
      /relo|vietnamese sandwich/i.test(n),
    );
    if (reloInRaw !== -1)
      console.log(
        "[View All Places] 'Relo vietnamese sandwich' found in raw data at index:",
        reloInRaw,
        "entry:",
        history[reloInRaw],
      );
    else
      console.log(
        "[View All Places] Place names in raw data (first 50):",
        allNames.slice(0, 50),
      );
  }
  if (history.length > 0) {
    const rows = fromPlaceVisitHistoryEntries(
      history as (PlaceVisitHistoryEntry | undefined)[],
    );
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      country: r.country,
      category: r.category,
      savedAt: r.savedAt,
      imageUrl: r.imageUrl,
      photoListUris: r.photoListUris,
      caption: r.caption,
      visitedTimeRaw: r.visitedTimeRaw,
      sentiment: r.sentiment,
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
    photoListUris: r.photoListUris,
    caption: r.caption,
    visitedTimeRaw: r.visitedTimeRaw,
    sentiment: r.sentiment,
  }));
}

/** Unique years in data, descending */
export function deriveYears(places: PlaceWithSavedAt[]): number[] {
  const set = new Set(
    places.map((p) => p.savedAt.getFullYear()).filter(Number.isFinite),
  );
  return Array.from(set).sort((a, b) => b - a);
}

/** Canonical English display name for country filter pills (e.g. "대한민국" → "South Korea"). */
export function countryToDisplayName(country: string): string {
  const c = (country ?? "").trim();
  const lower = c.toLowerCase();
  return COUNTRY_NAME_TO_CANONICAL[lower] ?? COUNTRY_CODE_TO_NAME[lower] ?? c;
}

/** Slug for country filter; canonical so "United States" and "United States of America" share one id */
export function countryToId(country: string): string {
  const canonical = countryToDisplayName(country);
  return (canonical || "").replace(/\s+/g, "-").toLowerCase() || "unknown";
}

/** Countries with counts; one pill per canonical country. Ordered most places to least (left to right). Uses English display names. */
export function deriveCountries(
  places: PlaceWithSavedAt[],
): CountryWithCount[] {
  const byId = new Map<string, string>();
  for (const p of places) {
    if (!p.country) continue;
    const id = countryToId(p.country);
    if (!byId.has(id)) byId.set(id, countryToDisplayName(p.country));
  }
  const counts = new Map<string, number>();
  for (const p of places) {
    if (!p.country) continue;
    const id = countryToId(p.country);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const rest: CountryWithCount[] = [];
  byId.forEach((name, id) => {
    rest.push({ id, name, count: counts.get(id) ?? 0 });
  });
  rest.sort((a, b) => b.count - a.count);
  return [{ id: "all", name: "All", count: places.length }, ...rest];
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
