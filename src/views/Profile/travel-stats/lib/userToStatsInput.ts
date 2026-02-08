/**
 * Maps getCachedUser() data to BuildTravelStatsInput for buildTravelStats().
 * File: src/views/Profile/travel-stats/lib/userToStatsInput.ts
 */

import type { User, PlaceVisitHistoryItem } from "@/api/user";
import type { Trip } from "@/api/trips";
import { assetUrl } from "@/api/assets";
import type { StatsPlaceInput, StatsRecapInput } from "./buildTravelStats";

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

function firstPhotoUriFromEntry(
  entry: PlaceVisitHistoryItem | undefined,
): string | null {
  const list = entry?.photoList;
  if (!Array.isArray(list) || list.length === 0) return null;
  const selected = list.find(
    (p) => p?.uri && !String(p.uri).startsWith("file://") && p.selected,
  );
  if (selected?.uri) return assetUrl(selected.uri);
  const first = list.find(
    (p) => p?.uri && !String(p.uri).startsWith("file://"),
  );
  return first?.uri ? assetUrl(first.uri) : null;
}

function placeToStatsPlace(
  e: PlaceVisitHistoryItem | undefined,
  index: number,
): StatsPlaceInput | null {
  if (!e || typeof e !== "object" || e.status === "hidden") return null;
  const id =
    (e as { _id?: string })._id && String((e as { _id?: string })._id).trim()
      ? String((e as { _id?: string })._id)
      : `place-${index}-${String(e.placeName ?? "")
          .replace(/\s+/g, "-")
          .slice(0, 24)}`;
  const lat = e.coordinate?.latitude;
  const lng = e.coordinate?.longitude;
  return {
    id,
    placeName: e.placeName?.trim() || "Unnamed",
    city: e.city ?? null,
    country: e.country ?? null,
    countryCode: (e as { countryCode?: string }).countryCode ?? null,
    lat: lat != null ? lat : null,
    lng: lng != null ? lng : null,
    visitedTime: e.visitedTime ?? e.visitedTimeDigitized ?? null,
    photoList: e.photoList ?? null,
    firstPhotoUri: firstPhotoUriFromEntry(e),
    categories: e.categories ?? null,
  };
}

/** Resolve blog cover: explicit coverPhotoUri (as full URL) or first photo from trip's places. */
function resolveTripCoverPhotoUrl(
  t: Trip,
  placeVisitHistory: Array<PlaceVisitHistoryItem | undefined>,
): string | null {
  const explicit = t.coverPhotoUri?.trim();
  if (explicit && !explicit.startsWith("file://")) {
    return assetUrl(explicit);
  }
  const placeList = t.placeList;
  if (!Array.isArray(placeList) || placeList.length === 0) return null;
  for (const ref of placeList) {
    const placeIndex = Number((ref as { placeIndex?: number })?.placeIndex);
    if (!Number.isFinite(placeIndex)) continue;
    const entry = placeVisitHistory[placeIndex];
    const list = entry?.photoList;
    if (!Array.isArray(list) || list.length === 0) continue;
    const selected = list.find(
      (p) => p?.uri && !String(p.uri).startsWith("file://") && p.selected,
    );
    if (selected?.uri) return assetUrl(selected.uri);
    const first = list.find(
      (p) => p?.uri && !String(p.uri).startsWith("file://"),
    );
    if (first?.uri) return assetUrl(first.uri);
  }
  return null;
}

function tripToStatsRecap(
  t: Trip,
  index: number,
  placeVisitHistory: Array<PlaceVisitHistoryItem | undefined>,
): StatsRecapInput {
  const id = String(t.blogKey ?? index);
  const coverPhotoUri = resolveTripCoverPhotoUrl(t, placeVisitHistory);
  return {
    id,
    title: t.title ?? null,
    startTimeString: t.startTimeString ?? null,
    endTimeString: t.endTimeString ?? null,
    startTimestamp: t.startTimestamp ?? null,
    endTimestamp: t.endTimestamp ?? null,
    coverPhotoUri,
    placeList: t.placeList ?? null,
  };
}

export function userToStatsInput(user: User | null): {
  places: StatsPlaceInput[];
  recapBlogs: StatsRecapInput[];
  friends: User["friends"];
} {
  if (!user) {
    return { places: [], recapBlogs: [], friends: undefined };
  }
  const history = user.placeVisitHistory ?? [];
  const places = history
    .map((e, i) => placeToStatsPlace(e, i))
    .filter((p): p is StatsPlaceInput => p != null);
  const trips = user.trips ?? [];
  const recapBlogs = trips.map((t, i) => tripToStatsRecap(t, i, history));
  return {
    places,
    recapBlogs,
    friends: user.friends,
  };
}
