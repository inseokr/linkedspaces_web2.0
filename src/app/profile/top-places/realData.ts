/**
 * Top Places: real data from getCachedUser().placeVisitHistory.
 * Filters: status !== "hidden", primaryPlace === true (or undefined).
 * Ranking: placeScore > 0 else visitedCount else photoList.length; sort desc, assign #1, #2, ...
 */

import type { User } from "@/api/user";
import { assetUrl } from "@/api/assets";
import type { PlaceVisitHistoryEntry, TopPlaceCardModel } from "./types";
import type { CountryWithCount } from "./mockData";

const PLACEHOLDER_IMAGE = "https://picsum.photos/400/600?random=placeholder";

/** Safe number for ranking (placeScore, visitedCount, or photo count) */
function getNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return 0;
}

/**
 * Compute "Top Score" for ranking.
 * Primary: placeScore if available and > 0.
 * Fallback: visitedCount (more visits = higher).
 * Optional fallback: photoList length.
 */
export function computeTopScore(entry: PlaceVisitHistoryEntry): number {
  const score = getNumber((entry as PlaceVisitHistoryEntry).placeScore);
  if (score > 0) return score;
  const visits = getNumber((entry as PlaceVisitHistoryEntry).visitedCount);
  if (visits > 0) return visits;
  const list = entry.photoList;
  return Array.isArray(list) ? list.length : 0;
}

/**
 * Sort entries by Top Score descending and assign rank 1, 2, 3...
 */
export function sortAndRankPlaces(
  entries: PlaceVisitHistoryEntry[],
): Array<{ entry: PlaceVisitHistoryEntry; rank: number }> {
  const withScore = entries.map((entry) => ({
    entry,
    score: computeTopScore(entry),
  }));
  withScore.sort((a, b) => b.score - a.score);
  return withScore.map(({ entry }, i) => ({ entry, rank: i + 1 }));
}

/**
 * Map a single placeVisitHistory entry + rank to TopPlaceCardModel.
 */
export function mapPlaceVisitHistoryToTopPlacesModel(
  entry: PlaceVisitHistoryEntry,
  rank: number,
  index: number,
): TopPlaceCardModel {
  const placeName = entry.placeName?.trim() || "Unnamed place";
  const country = entry.country?.trim() || "";
  const countryCode =
    (entry.countryCode?.trim() || "").toUpperCase() ||
    country.slice(0, 2).toUpperCase();
  const city = entry.city?.trim() || "";
  const photoList = entry.photoList ?? [];
  const firstPhoto = photoList.find(
    (p) => p?.uri && !String(p.uri).startsWith("file://"),
  );
  const imageUrl = firstPhoto?.uri
    ? assetUrl(firstPhoto.uri)
    : PLACEHOLDER_IMAGE;
  const photoListUris = photoList
    .filter((p) => p?.uri && !String(p.uri).startsWith("file://"))
    .map((p) => assetUrl(p!.uri));

  const categories = entry.categories ?? [];
  const category = categories[0]?.trim() || "Others";

  const entryAny = entry as { story?: string; caption?: string };
  const placeStory =
    typeof entryAny.story === "string" ? entryAny.story.trim() : "";
  const placeCaption =
    typeof entryAny.caption === "string" ? entryAny.caption.trim() : "";
  const first = photoList[0] as
    | { story?: string; caption?: string }
    | undefined;
  const firstStory =
    first && typeof first.story === "string" ? first.story.trim() : "";
  const firstCaption =
    first && typeof first.caption === "string" ? first.caption.trim() : "";
  const caption =
    placeStory || placeCaption || firstStory || firstCaption || undefined;

  const coord = entry.coordinate;
  const latitude =
    coord && Number.isFinite(coord.latitude) ? coord.latitude : undefined;
  const longitude =
    coord && Number.isFinite(coord.longitude) ? coord.longitude : undefined;

  return {
    id: entry._id ?? `place-${index}-${rank}`,
    title: placeName,
    country,
    countryCode,
    city,
    category,
    imageUrl,
    photosCount: photoList.length,
    visitsCount: getNumber((entry as PlaceVisitHistoryEntry).visitedCount),
    likesCount: 0,
    rank,
    photoListUris: photoListUris.length > 0 ? photoListUris : undefined,
    visitedTime: entry.visitedTime ?? entry.visitedTimeDigitized,
    caption,
    latitude,
    longitude,
  };
}

/**
 * Derive country filter pills from visible places: unique countries with counts.
 * id = countryCode or fallback slug from country name.
 * "All" count = total places (so the number is correct).
 */
export function deriveCountryFilterCounts(
  places: TopPlaceCardModel[],
): CountryWithCount[] {
  const all: CountryWithCount[] = [
    { id: "all", name: "All", count: places.length },
  ];
  const byId = new Map<string, { name: string; count: number }>();

  for (const p of places) {
    const id = getCountryFilterId(p);
    const name = p.country || "Unknown";
    const prev = byId.get(id);
    if (prev) prev.count += 1;
    else byId.set(id, { name, count: 1 });
  }

  const sorted = [...byId.entries()].sort((a, b) => b[1].count - a[1].count);
  sorted.forEach(([id, { name, count }]) => all.push({ id, name, count }));
  return all;
}

/**
 * Derive category filter pills from visible places: unique categories with counts.
 * "Others" is ordered between "Cafe" and "shopping" (inserted after "cafe").
 */
export function deriveCategoryFilterCounts(
  places: TopPlaceCardModel[],
): Array<{ id: string; name: string; count: number }> {
  const byName = new Map<string, number>();
  for (const p of places) {
    const name = p.category || "Others";
    byName.set(name, (byName.get(name) ?? 0) + 1);
  }
  const list = [...byName.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ id: name, name, count }));
  const others = list.find((c) => c.id === "Others" || c.name === "Others");
  const rest = list.filter((c) => c.id !== "Others" && c.name !== "Others");
  if (!others) return list;
  const cafeIndex = rest.findIndex((c) => c.name.toLowerCase() === "cafe");
  if (cafeIndex >= 0) {
    return [
      ...rest.slice(0, cafeIndex + 1),
      others,
      ...rest.slice(cafeIndex + 1),
    ];
  }
  return [...rest, others];
}

/** Country filter id for a place (used when filtering by country). */
export function getCountryFilterId(place: TopPlaceCardModel): string {
  return place.countryCode || place.country.replace(/\s+/g, "-") || "unknown";
}

/**
 * Filter placeVisitHistory: exclude hidden, use primary place when applicable.
 * Assume viewer is owner so privacy passes.
 */
function filterVisibleEntries(
  history: Array<PlaceVisitHistoryEntry | undefined>,
): PlaceVisitHistoryEntry[] {
  return history.filter((e): e is PlaceVisitHistoryEntry => {
    if (!e || typeof e !== "object") return false;
    if (e.status === "hidden") return false;
    if (e.primaryPlace === false) return false;
    return true;
  }) as PlaceVisitHistoryEntry[];
}

/**
 * Build ranked Top Places from user.placeVisitHistory.
 * Returns empty array if no user or no history.
 */
export function getTopPlacesFromUser(user: User | null): TopPlaceCardModel[] {
  const raw = user?.placeVisitHistory ?? [];
  const entries = filterVisibleEntries(
    raw as Array<PlaceVisitHistoryEntry | undefined>,
  );
  const ranked = sortAndRankPlaces(entries);
  return ranked.map(({ entry, rank }, i) =>
    mapPlaceVisitHistoryToTopPlacesModel(entry, rank, i),
  );
}
