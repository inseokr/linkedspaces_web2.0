import type { Trip } from "@/views/Profile/recap-blogs/types";
import type { PlaceVisitHistoryItem } from "@/api/user";
import type { CountryRecapItem } from "@/views/Profile/recap-blogs/components/CountryRecapCard";
import type { AllBlogCardItem } from "@/views/Profile/recap-blogs/components/RecapBlogCard";

const DEFAULT_BLOG_COVER = "/images/recap/kr.png";
const DEFAULT_RECAP_COVER = "/images/recap/kr.png";

function toSlug(title: string): string {
  return String(title ?? "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pickCoverFromPlaceVisitHistory(
  trip: Trip,
  placeVisitHistory?: Array<PlaceVisitHistoryItem | undefined>,
): string | null {
  if (!Array.isArray(placeVisitHistory)) {
    return null;
  }

  const placeList = trip.placeList;
  if (!Array.isArray(placeList) || placeList.length === 0) {
    return null;
  }

  for (const ref of placeList) {
    const rawIdx = (ref as any)?.placeIndex;
    const idx = Number(rawIdx);

    if (!Number.isFinite(idx)) {
      continue;
    }

    const place = placeVisitHistory[idx];
    const photos = place?.photoList;
    if (!Array.isArray(photos) || photos.length === 0) continue;

    const picked = photos.find((p) => {
      const uri = p?.uri;
      if (!uri) return false;
      if (uri.includes("file://")) return false;
      if (p.selected === false) return false;
      return true;
    });

    if (picked?.uri) return picked.uri;
  }

  return null;
}

const ASSET_ORIGIN =
  process.env.NEXT_PUBLIC_ASSET_ORIGIN ||
  "https://s3-us-west-1.amazonaws.com/linkedspaces.fs";

function toAbsoluteAssetUrl(src: string): string {
  if (!src) return "";

  // already absolute
  if (/^https?:\/\//i.test(src)) return src;

  // don't allow local file
  if (src.startsWith("file://")) return "";

  // most common server-relative forms from your API
  // 1) "/public/...."  -> ASSET_ORIGIN + "/public/...."
  if (src.startsWith("/public/")) return `${ASSET_ORIGIN}${src}`;

  // 2) "/user_resources/...." -> ASSET_ORIGIN + "/public/user_resources/...."
  if (src.startsWith("/user_resources/")) return `${ASSET_ORIGIN}/public${src}`;

  // fallback: treat as root-relative
  if (src.startsWith("/")) return `${ASSET_ORIGIN}${src}`;

  // fallback: treat as relative file path on asset origin
  return `${ASSET_ORIGIN}/${src}`;
}

function resolveTripCoverUrl(
  trip: Trip,
  placeVisitHistory?: Array<PlaceVisitHistoryItem | undefined>,
  fallback = DEFAULT_BLOG_COVER,
) {
  const explicit = trip.coverPhotoUri;

  if (typeof explicit === "string" && explicit.trim().length > 0) {
    return toAbsoluteAssetUrl(explicit) || fallback;
  }

  const fromPlaces = pickCoverFromPlaceVisitHistory(trip, placeVisitHistory);
  if (fromPlaces) return toAbsoluteAssetUrl(fromPlaces) || fallback;
  return fallback;
}

export const transformToAllBlogItems = (
  trips: Trip[],
  args?: {
    username?: string;
    placeVisitHistory?: Array<PlaceVisitHistoryItem | undefined>;
  },
): AllBlogCardItem[] => {
  const username = args?.username;

  return trips.map((trip) => {
    const title = trip.title || `${trip.country ?? "Unknown"} Trip`;
    const key = String(trip.blogKey);

    return {
      id: key,
      href: username ? `/trip/${username}/${key}` : `/trip/${key}`,
      coverImageUrl: resolveTripCoverUrl(
        trip,
        args?.placeVisitHistory,
        DEFAULT_BLOG_COVER,
      ),
      title,
      locationLabel: trip.country || "Unknown",
      dateLabel:
        `${trip.startingYear ?? ""} ${trip.startTimeString ?? ""}-${trip.endTimeString ?? ""}`.trim(),
      isPublic: trip.privacyControl?.level !== "hidden",
    };
  });
};
export const transformToRecapItems = (
  trips: Trip[],
  placeVisitHistory?: Array<PlaceVisitHistoryItem | undefined>,
) => {
  const grouped: Record<
    string,
    {
      id: string;
      countryCode: string;
      countryName: string;
      coverImageUrl: string;
      years: Set<number>;
      href: string;
    }
  > = {};

  for (const trip of trips) {
    const code = String(trip.countryCode ?? "")
      .trim()
      .toUpperCase();
    if (!code) continue;

    if (!grouped[code]) {
      grouped[code] = {
        id: code,
        countryCode: code,
        countryName: trip.country || code,
        coverImageUrl: resolveTripCoverUrl(
          trip,
          placeVisitHistory,
          DEFAULT_RECAP_COVER,
        ),
        years: new Set<number>(),
        href: `/profile/recap-blog/${code.toLowerCase()}`,
      };
    } else {
      if (grouped[code].coverImageUrl === DEFAULT_RECAP_COVER) {
        const candidate = resolveTripCoverUrl(
          trip,
          placeVisitHistory,
          DEFAULT_RECAP_COVER,
        );
        if (candidate !== DEFAULT_RECAP_COVER)
          grouped[code].coverImageUrl = candidate;
      }
    }

    const y = Number.parseInt(String(trip.startingYear ?? ""), 10);
    if (Number.isFinite(y)) grouped[code].years.add(y);
  }

  return Object.values(grouped).map((item) => ({
    id: item.id,
    countryCode: item.countryCode,
    countryName: item.countryName,
    coverImageUrl: item.coverImageUrl,
    href: item.href,
    years: Array.from(item.years).sort((a, b) => b - a),
  }));
};
