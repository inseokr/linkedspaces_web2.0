/**
 * Builds My Places UI data from getCachedUser().placeVisitHistory (and trips fallback).
 * Filters: status !== "hidden", prefer primaryPlace === true.
 * Sort: newest to oldest by visitedTime (fallback visitedTimeDigitized).
 * Caption/snippet from entry.story or photoList[0].story.
 */

import type { User } from "@/api/user";
import { assetUrl } from "@/api/assets";
import type {
  LatestActivityPlace,
  SavedPlace,
  PlaceCategory,
} from "./mockData";
import { PLACE_CATEGORIES } from "./mockData";
import type { PlaceVisitHistoryEntry } from "./types";

const MONTH_SHORT: Record<number, string> = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  3: "Apr",
  4: "May",
  5: "Jun",
  6: "Jul",
  7: "Aug",
  8: "Sep",
  9: "Oct",
  10: "Nov",
  11: "Dec",
};

function formatDateShort(isoOrYmd: string | undefined): string {
  if (!isoOrYmd) return "";
  const d = parseDate(isoOrYmd);
  if (!d) return "";
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function formatVisitedDate(isoOrYmd: string | undefined): string {
  if (!isoOrYmd) return "Visited";
  const d = parseDate(isoOrYmd);
  if (!d) return "Visited";
  const day = d.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
          ? "rd"
          : "th";
  return `Visited ${MONTH_SHORT[d.getMonth()]} ${day}${suffix}`;
}

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

function normalizeCategory(s: string): string {
  const t = s.trim();
  if (!t) return "Others";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function inferCategory(
  placeName: string,
  entryCategories?: string[],
): PlaceCategory {
  if (Array.isArray(entryCategories) && entryCategories.length > 0) {
    const first = normalizeCategory(String(entryCategories[0]));
    if (first) return first as PlaceCategory;
  }
  const lower = placeName.toLowerCase();
  if (/\bcafe\b|coffee|tea\b|boba\b/.test(lower)) return "Cafe";
  if (/\brestaurant\b|sushi|pizza|trattoria|osteria|bistro\b/.test(lower))
    return "Restaurant";
  if (/\bbar\b|pub\b|hotel\b|resort\b/.test(lower)) return "Bar";
  if (/\bpark\b|attraction|sightseeing|museum\b/.test(lower)) return "Park";
  return "Others";
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

/** Get caption/snippet from place-level or first photo's story/caption (backend may send either field) */
function getCaption(
  entry:
    | PlaceVisitHistoryEntry
    | {
        story?: string;
        caption?: string;
        photoList?: Array<{ story?: string; caption?: string }>;
      },
): string {
  const entryAny = entry as {
    story?: string;
    caption?: string;
    photoList?: Array<{ story?: string; caption?: string }>;
  };
  const placeStory =
    typeof entryAny.story === "string" ? entryAny.story.trim() : "";
  if (placeStory) return placeStory;
  const placeCaption =
    typeof entryAny.caption === "string" ? entryAny.caption.trim() : "";
  if (placeCaption) return placeCaption;
  const list = Array.isArray(entryAny.photoList) ? entryAny.photoList : [];
  const first = list[0];
  const photoStory =
    first && typeof first.story === "string" ? first.story.trim() : "";
  if (photoStory) return photoStory;
  const photoCaption =
    first && typeof first.caption === "string" ? first.caption.trim() : "";
  return photoCaption ?? "";
}

export interface FlattenedPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  visitedDate: string;
  visitedDateShort: string;
  snippet: string;
  caption: string;
  thumbnailUrl: string | null;
  address: string;
  /** City for lightbox "Go to link" (Place Name, City Name) */
  city?: string;
  lat: number;
  lng: number;
  sortTime: number;
  /** For place lightbox: raw visited time */
  visitedTimeRaw?: string;
  /** For place lightbox: all photo URIs */
  photoListUris?: string[];
}

/** Build from placeVisitHistory when entries have placeName/visitedTime (new backend shape) */
function fromPlaceVisitHistoryEntries(
  history: (PlaceVisitHistoryEntry | undefined)[],
): FlattenedPlace[] {
  const entries = history.filter((e): e is PlaceVisitHistoryEntry => {
    if (!e || typeof e !== "object") return false;
    if (e.status === "hidden") return false;
    if (e.primaryPlace === false && "primaryPlace" in e) return false;
    return true;
  }) as PlaceVisitHistoryEntry[];

  const withTime = entries.map((e, i) => {
    const t = e.visitedTime ?? e.visitedTimeDigitized ?? "";
    return { entry: e, sortTime: parseDate(t)?.getTime() ?? 0, index: i };
  });
  withTime.sort((a, b) => b.sortTime - a.sortTime);

  return withTime.map(({ entry, sortTime, index }) => {
    const name = entry.placeName?.trim() || "Place Name";
    const country = entry.country ?? "";
    const city = entry.city ?? "";
    const address =
      [name, city, country].filter(Boolean).join(", ") || "Address unknown";
    const coord = entry.coordinate;
    const lat = coord?.latitude ?? 0;
    const lng = coord?.longitude ?? 0;
    const visitedTime = entry.visitedTime ?? entry.visitedTimeDigitized;
    const caption = getCaption(entry);
    const photoListUris = allPhotoUris(entry.photoList);

    const stableId =
      entry._id ??
      `place-${String(entry.placeName ?? name)
        .replace(/\s+/g, "-")
        .slice(0, 24)}-${Number(lat).toFixed(4)}-${Number(lng).toFixed(4)}`;
    return {
      id: stableId,
      name,
      category: inferCategory(name, entry.categories),
      visitedDate: formatVisitedDate(visitedTime),
      visitedDateShort: formatDateShort(visitedTime),
      snippet: caption,
      caption,
      thumbnailUrl: firstPhotoUri(entry.photoList) ?? null,
      address,
      ...(city ? { city } : {}),
      lat,
      lng,
      sortTime,
      visitedTimeRaw: visitedTime,
      photoListUris: photoListUris.length > 0 ? photoListUris : undefined,
    };
  });
}

/** Fallback: build from user.trips + placeVisitHistory by index (old shape) */
function fromTripsAndHistory(user: User): FlattenedPlace[] {
  const trips = user.trips ?? [];
  const placeVisitHistory = user.placeVisitHistory ?? [];
  const out: FlattenedPlace[] = [];

  for (const trip of trips) {
    const placeList = trip.placeList ?? [];
    const names = trip.visitedPlaceName ?? [];
    const tripStart = trip.startTimestamp ?? trip.startTimeString;
    const country = trip.country ?? "";
    const city = (trip as { city?: string }).city ?? "";

    placeList.forEach((ref, i) => {
      const placeIndex = Number((ref as { placeIndex?: number })?.placeIndex);
      if (!Number.isFinite(placeIndex)) return;

      const hist = placeVisitHistory[placeIndex] as
        | PlaceVisitHistoryEntry
        | undefined;
      const coord = hist?.coordinate;
      const lat = coord?.latitude ?? 0;
      const lng = coord?.longitude ?? 0;
      const name =
        names[i] ??
        hist?.placeName ??
        hist?.city ??
        hist?.country ??
        "Place Name";
      const address =
        [name, city, country].filter(Boolean).join(", ") || "Address unknown";
      const caption = hist ? getCaption(hist) : "";

      const thumbnailUrl = firstPhotoUri(hist?.photoList) ?? null;
      const id = `${trip.blogKey}-${placeIndex}`;
      const category = inferCategory(name, hist?.categories);
      const photoListUris = hist ? allPhotoUris(hist.photoList) : undefined;

      out.push({
        id,
        name,
        category,
        visitedDate: formatVisitedDate(tripStart),
        visitedDateShort: formatDateShort(tripStart),
        snippet: caption,
        caption,
        thumbnailUrl,
        address,
        ...(city ? { city } : {}),
        lat,
        lng,
        sortTime: parseDate(tripStart)?.getTime() ?? 0,
        visitedTimeRaw:
          hist?.visitedTime ?? hist?.visitedTimeDigitized ?? tripStart,
        photoListUris: photoListUris?.length ? photoListUris : undefined,
      });
    });
  }

  out.sort((a, b) => b.sortTime - a.sortTime);
  return out;
}

function flattenUserPlaces(user: User): FlattenedPlace[] {
  const history = user.placeVisitHistory ?? [];
  const hasNewShape = history.some(
    (e) =>
      e &&
      (typeof (e as PlaceVisitHistoryEntry).placeName === "string" ||
        typeof (e as PlaceVisitHistoryEntry).visitedTime === "string"),
  );
  if (hasNewShape && history.length > 0) {
    return fromPlaceVisitHistoryEntries(
      history as (PlaceVisitHistoryEntry | undefined)[],
    );
  }
  return fromTripsAndHistory(user);
}

function toLatestActivityPlace(p: FlattenedPlace): LatestActivityPlace {
  return {
    id: p.id,
    name: p.name,
    date: p.visitedDateShort,
    category: p.category,
    imageUrl: p.thumbnailUrl,
    caption: p.caption || p.snippet || "",
    saved: true,
  };
}

function toSavedPlace(p: FlattenedPlace): SavedPlace {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    visitedDate: p.visitedDate,
    snippet: p.snippet || p.caption || "",
    thumbnailUrl: p.thumbnailUrl,
    address: p.address,
    lat: p.lat,
    lng: p.lng,
    ...(p.caption ? { caption: p.caption } : {}),
    ...(p.city ? { city: p.city } : {}),
    ...(p.photoListUris?.length ? { photoListUris: p.photoListUris } : {}),
    ...(p.visitedTimeRaw ? { visitedTimeRaw: p.visitedTimeRaw } : {}),
  };
}

export function getMyPlacesFromUser(user: User | null): {
  latestActivity: LatestActivityPlace[];
  savedPlaces: SavedPlace[];
  categories: PlaceCategory[];
} {
  if (!user) {
    return {
      latestActivity: [],
      savedPlaces: [],
      categories: [...PLACE_CATEGORIES],
    };
  }

  const flat = flattenUserPlaces(user);
  const latestActivity = flat.slice(0, 7).map(toLatestActivityPlace);
  const savedPlaces = flat.map(toSavedPlace);

  const uniqueCategories = [...new Set(savedPlaces.map((p) => p.category))];
  const categories =
    uniqueCategories.length > 0
      ? uniqueCategories.sort((a, b) => String(a).localeCompare(String(b)))
      : [...PLACE_CATEGORIES];

  return {
    latestActivity,
    savedPlaces,
    categories,
  };
}
