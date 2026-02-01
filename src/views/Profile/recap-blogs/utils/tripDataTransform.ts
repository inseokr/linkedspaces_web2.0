import type { Trip } from "@/views/Profile/recap-blogs/types";
import type { PlaceVisitHistoryItem } from "@/api/user";
import type { CountryRecapItem } from "@/views/Profile/recap-blogs/components/CountryRecapCard";
import type { AllBlogCardItem } from "@/views/Profile/recap-blogs/components/RecapBlogCard";
import { formatTripDateRangeLabel } from "@/utils/formatTripDate";

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

function parseTripYmdToEpoch(input: unknown): number | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;

  const datePart = raw.split(" ")[0] ?? raw;
  const m = /^(\d{4})[:-](\d{2})[:-](\d{2})$/.exec(datePart);
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }

  return Date.UTC(year, month - 1, day);
}

function parseTripYear(input: unknown): number | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;

  const datePart = raw.split(" ")[0] ?? raw;
  const m = /^(\d{4})[:-](\d{2})[:-](\d{2})$/.exec(datePart);
  if (!m) return null;
  const year = Number(m[1]);
  return Number.isFinite(year) ? year : null;
}

function parseIsoYmd(
  input: unknown,
): { year: number; month: number; day: number } | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;

  // Accept ISO like "2025-09-21T10:11:12Z" by taking the first 10 chars.
  const datePart = raw.slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  )
    return null;

  return { year, month, day };
}

function ymdToDash(ymd: { year: number; month: number; day: number }): string {
  return `${ymd.year}-${String(ymd.month).padStart(2, "0")}-${String(ymd.day).padStart(2, "0")}`;
}

function hasMonthText(label: string): boolean {
  return /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/.test(label);
}

function tripSortKey(t: Trip): number {
  // Prefer end date (most representative of “latest”), fallback to start date.
  const end = parseTripYmdToEpoch((t as any)?.endTimeString);
  const start = parseTripYmdToEpoch((t as any)?.startTimeString);
  if (end != null) return end;
  if (start != null) return start;

  const y = Number((t as any)?.startingYear);
  if (Number.isFinite(y)) return Date.UTC(y, 0, 1);
  return 0;
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
    /** "ALL" year tab: show year, otherwise omit year */
    includeYearInDateLabel?: boolean;
  },
): AllBlogCardItem[] => {
  const username = args?.username;
  const includeYearInDateLabel = args?.includeYearInDateLabel ?? true;

  return trips.map((trip) => {
    const title = trip.title || `${trip.country ?? "Unknown"} Trip`;
    const key = String(trip.blogKey);
    let dateLabel =
      formatTripDateRangeLabel(trip.startTimeString, trip.endTimeString, {
        includeYear: includeYearInDateLabel,
      }) || "";

    // If we ended up with only day numbers (no month text), try to rebuild from ISO timestamps.
    // This happens when APIs send "21" / "26" for start/end, but timestamps still carry full dates.
    if (dateLabel && !hasMonthText(dateLabel)) {
      const startYmd =
        parseIsoYmd((trip as any)?.startTimestamp) ??
        parseIsoYmd((trip as any)?.startTimeString) ??
        null;
      const endYmd =
        parseIsoYmd((trip as any)?.endTimestamp) ??
        parseIsoYmd((trip as any)?.endTimeString) ??
        null;

      if (startYmd || endYmd) {
        const rebuilt = formatTripDateRangeLabel(
          startYmd ? ymdToDash(startYmd) : "",
          endYmd ? ymdToDash(endYmd) : "",
          { includeYear: includeYearInDateLabel },
        ).trim();
        if (rebuilt && hasMonthText(rebuilt)) {
          dateLabel = rebuilt;
        }
      }
    }

    // If the API provides already-formatted labels like "Sep 21 ~ Sep 26" without year,
    // ensure the "ALL" tab still shows the trip year.
    if (includeYearInDateLabel) {
      const yFromTrip = Number.parseInt(String(trip.startingYear ?? ""), 10);
      const yFromStart = parseTripYear((trip as any)?.startTimeString);
      const yFromEnd = parseTripYear((trip as any)?.endTimeString);
      const year =
        (Number.isFinite(yFromTrip) ? yFromTrip : null) ??
        yFromStart ??
        yFromEnd ??
        null;

      if (year != null) {
        if (!dateLabel) {
          dateLabel = String(year);
        } else if (!/\b\d{4}\b/.test(dateLabel)) {
          dateLabel = `${dateLabel}, ${year}`;
        }
      }
    }

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
      dateLabel,
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
      latestTripSortKey: number;
      latestTripDateLabel?: string;
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
        latestTripSortKey: -Infinity,
        latestTripDateLabel: undefined,
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

    // Track "latest" trip date per country (for showing on the recap card)
    const k = tripSortKey(trip);
    if (k >= grouped[code].latestTripSortKey) {
      grouped[code].latestTripSortKey = k;
      const label = formatTripDateRangeLabel(
        trip.startTimeString,
        trip.endTimeString,
        {
          includeYear: true,
        },
      ).trim();
      grouped[code].latestTripDateLabel = label || undefined;
    }
  }

  return Object.values(grouped).map((item) => ({
    id: item.id,
    countryCode: item.countryCode,
    countryName: item.countryName,
    coverImageUrl: item.coverImageUrl,
    href: item.href,
    years: Array.from(item.years).sort((a, b) => b - a),
    latestTripDateLabel: item.latestTripDateLabel,
  }));
};
