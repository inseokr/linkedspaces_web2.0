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
  const dateText = buildDateText(trip);

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
    },
    days,
    markers,
  };
}

function buildDateText(trip: TripRecapResponse["trip"]) {
  return (
    formatTripDateRangeLabel(trip.startTimeString, trip.endTimeString, {
      includeYear: true,
    }) || ""
  );
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

  const placeName = p.placeName || "Place";

  const photoList = p.photoList ?? [];
  const selectedPhoto =
    photoList.find((x: any) => x?.selected) ?? photoList[0] ?? null;

  const captions = photoList.map((x: any) =>
    typeof x?.story === "string" ? x.story : "",
  );
  const caption = selectedPhoto?.story ?? p.story ?? captions[0] ?? "";

  //  photos: normalizeImageSrc로 /public 제거 + host 붙인 "최종 src"만 넘김
  const photos = photoList
    .map((x: any) => (x?.uri ? normalizeImageSrc(x.uri).src : ""))
    .filter(Boolean);

  const categoryLabel = p.categories?.[0] || undefined;

  const timeRangeText = (() => {
    const dt = p.digitizedTime ?? "";
    if (!dt) return "";
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
    timeRangeText,
    categoryLabel,
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
