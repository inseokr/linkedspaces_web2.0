import type {
  TripRecapResponse,
  TripRecapDay,
  TripRecapPlace,
  TripRecapPhoto,
} from "@/api/trips";

import type { RecapDay, RecapEntry } from "../component/RecapBlogPlace";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";
import {
  formatTimeLabel,
  formatTripDateLabel,
  formatTripDateRangeLabel,
} from "@/utils/formatTripDate";

export type RecapHeroModel = {
  coverImageUrl: string;
  title: string;
  dateText: string;
  locationText: string;
  authorName: string;
  postedLabel: string;
  avatarUrl?: string;
  startingYear?: number;
  placesCount?: number;
};

export type RecapPageModel = {
  hero: RecapHeroModel;
  days: RecapDay[];
  markers: Array<{
    id: string;
    latitude: number;
    longitude: number;
    label: string;
  }>;
};

export function mapTripRecapToPageModel(
  recapData: TripRecapResponse,
): RecapPageModel {
  const trip = recapData.trip;

  const title = trip.title?.trim() || "Trip Recap";

  const authorName = trip.userName || "User";

  //  avatar는 normalizeImageSrc로 절대 URL /public 제거까지 정리
  const avatarUrl = trip.profilePicture
    ? normalizeImageSrc(trip.profilePicture).src
    : undefined;

  //  cover: trip에 coverPhotoUri 없음 → days/places/photoList에서 첫 사진으로 fallback
  const coverImageUrl = pickCoverFromRecap(recapData) ?? "/images/hero/us.jpg";

  const locationText = "";

  const days: RecapDay[] = (recapData.days ?? []).map((d, idx) =>
    mapDayFromApi(d, idx),
  );

  const markers = days.flatMap((d) =>
    d.entries.flatMap((e) =>
      e.coordinate
        ? [
            {
              id: e.id,
              latitude: e.coordinate.latitude,
              longitude: e.coordinate.longitude,
              label: e.placeName,
            },
          ]
        : [],
    ),
  );

  const placesCount = days.reduce((acc, d) => acc + d.entries.length, 0);
  const dateText = buildDateText(trip, days);

  return {
    hero: {
      coverImageUrl,
      title,
      dateText,
      locationText,
      authorName,
      postedLabel: "",
      avatarUrl,
      startingYear: trip.startingYear ? Number(trip.startingYear) : undefined,
      placesCount,
    },
    days,
    markers,
  };
}

function buildDateText(trip: TripRecapResponse["trip"], days: RecapDay[]) {
  let startTime = trip.startTimeString;
  let endTime = trip.endTimeString;

  const base =
    formatTripDateRangeLabel(startTime, endTime, {
      includeYear: true,
    }) || "";

  // The user requested to remove the "1 day, 2026" and just show trip dates.
  // The 'formatTripDateRangeLabel' generates the trip dates properly.
  // We don't need to append the isolated year if the start/end time is missing
  // or just returns empty string except we might still be returning a year somehow.
  // Let's just return the formatted date range directly.
  const hasYear = /\b\d{4}\b/.test(base);

  if (hasYear) return base;

  const y = Number((trip as any)?.startingYear);
  if (!Number.isFinite(y)) return base;
  if (!base.trim()) return String(y);

  return `${base.replace(/[,\s]+$/, "")}, ${y}`;
}

function mapDayFromApi(d: TripRecapDay, idx: number): RecapDay {
  const dayIndex = idx + 1;
  const title = formatTripDateLabel(d.date) || `Day ${dayIndex}`;

  const entries: RecapEntry[] = (d.places ?? []).map((p, i) =>
    mapPlaceToEntry(p, `${dayIndex}-${i}`),
  );

  return { dayIndex, title, entries };
}

function mapPlaceToEntry(p: TripRecapPlace, fallbackId: string): RecapEntry {
  const id = fallbackId; // trip-recap place에는 id/_id가 보장되지 않아서 안전하게 fallback 사용
  const placeKey = p.digitizedTime || fallbackId;

  console.log("mapPlaceToEntry:", p);

  const placeName = p.placeName || "Place";
  const externalUrl =
    typeof p.externalUrl === "string" ? p.externalUrl.trim() : "";
  const placeStory =
    typeof (p as any)?.story === "string" ? (p as any).story : "";

  const photoList = p.photoList ?? [];
  const selectedPhoto =
    photoList.find((x: any) => x?.selected) ?? photoList[0] ?? null;

  const captions = photoList.map((x: any) =>
    typeof x?.story === "string" ? x.story : "",
  );
  // NOTE: caption is per-photo (photoIndex 0 fallback). Place story is stored separately.
  const caption = selectedPhoto?.story ?? captions[0] ?? "";

  //  photos: normalizeImageSrc로 /public 제거 + host 붙인 "최종 src"만 넘김
  const photos = photoList
    .map((x: any) => (x?.uri ? normalizeImageSrc(x.uri).src : ""))
    .filter(Boolean);

  const categoryLabel = p.categories?.[0] || undefined;

  const timeRangeText = (() => {
    const dt = p.digitizedTime ?? "";
    if (!dt) {
      if (
        typeof process !== "undefined" &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn(
          "[trip-recap] Place missing digitizedTime (timestamp will not show). API: GET /ls-beta-test/trip-recap/:userName/:blogKey → response.days[].places[].digitizedTime. Place:",
          { placeName: p.placeName, fallbackId },
        );
      }
      return "";
    }
    const parts = dt.split(" ");
    const hhmm = parts[1]?.slice(0, 5) ?? "";
    return formatTimeLabel(hhmm);
  })();

  const likeCount = selectedPhoto?.liked?.length ?? 0;
  const commentCount = selectedPhoto?.comments?.length ?? 0;

  const lat = p.coordinate?.latitude;
  const lng = p.coordinate?.longitude;

  const coordinate =
    Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
      ? { latitude: Number(lat), longitude: Number(lng) }
      : undefined;

  return {
    id,
    placeKey,
    placeName,
    externalUrl: externalUrl || undefined,
    timeRangeText,
    categoryLabel,
    placeStory,
    liked: undefined,
    likeCount,
    commentCount,
    caption,
    captions,
    photos,
    coordinate,
  };
}

/**
 *  Hero cover fallback:
 * - 전체 recap에서 "대표 이미지"를 하나 뽑음
 * - 우선순위: selected photo -> 첫 photo
 */
function pickCoverFromRecap(recapData: TripRecapResponse): string | undefined {
  const days = recapData.days ?? [];

  // 1) selected photo 우선
  for (const day of days) {
    for (const place of day.places ?? []) {
      const selected = (place.photoList ?? []).find((p) => p.selected && p.uri);
      if (selected?.uri) return normalizeImageSrc(selected.uri).src;
    }
  }

  // 2) 없으면 첫 photo
  for (const day of days) {
    for (const place of day.places ?? []) {
      const first = (place.photoList ?? [])[0];
      if (first?.uri) return normalizeImageSrc(first.uri).src;
    }
  }

  return undefined;
}
