/**
 * Normalize LS Home API responses into Home page shapes (feed posts, recap blogs).
 */

import { assetUrl } from "@/api/assets";
import type {
  LsFriendsVisitEntry,
  LsPlacePhoto,
  LsTrip,
} from "@/api/lsHomeApi";
import type { MockFeedPost, MockRecapBlog } from "./mockNetwork";
import { formatTimeAgo } from "./homeNetworkData";

function firstPhotoUri(entry: LsFriendsVisitEntry): string | undefined {
  const photos = entry.photoList;
  if (!Array.isArray(photos) || photos.length === 0) return undefined;
  const withUri = (p: LsPlacePhoto) =>
    p?.uri && !String(p.uri).startsWith("file://");
  const selected = photos.find((p) => p?.selected && withUri(p));
  if (selected?.uri) return selected.uri;
  const first = photos.find(withUri);
  return first?.uri;
}

/** Placeholder image when a feed post has no photo (so network feed still shows the post). */
const FEED_PLACEHOLDER_IMAGE = "/images/recap/kr.png";

/** Build feed posts from loadFriendsVisitHistory response. Chronological; entries without photos use placeholder. */
export function feedPostsFromFriendsVisitHistory(
  entries: LsFriendsVisitEntry[],
): MockFeedPost[] {
  const valid = entries.filter((e) => {
    if (!e) return false;
    if (e.status === "hidden") return false;
    return true;
  });

  const sorted = [...valid].sort((a, b) => {
    const ta = a.visitedTime || a.visitedTimeDigitized || "";
    const tb = b.visitedTime || b.visitedTimeDigitized || "";
    return tb.localeCompare(ta);
  });

  return sorted.map((entry, index) => {
    const uri = firstPhotoUri(entry);
    const placeName =
      entry.placeName || entry.visitedCity || entry.city || "A place";
    const timeStr = entry.visitedTime || entry.visitedTimeDigitized;
    const likeCount = entry.likes ?? entry.likeCount ?? entry.likesCount ?? 0;
    const commentCount = Array.isArray(entry.photoList)
      ? entry.photoList.reduce(
          (sum, p) =>
            sum +
            (Array.isArray((p as any)?.comments)
              ? (p as any).comments.length
              : 0),
          0,
        )
      : 0;
    const username = entry.username ?? "unknown";
    const id = entry._id ?? `feed-${username}-${entry.placeIndex ?? index}`;

    return {
      id: String(id),
      userId: (entry as any).userId ?? username,
      username,
      userAvatarUrl: undefined,
      placeName,
      placeId: entry._id,
      imageUrl: uri ? assetUrl(uri) : FEED_PLACEHOLDER_IMAGE,
      timeAgo: formatTimeAgo(timeStr),
      likeCount,
      commentCount,
    };
  });
}

/** Build recap blog cards from loadFriendsTrip response. Trips with at least one place; sort by endTimestamp desc, top 10. */
export function recapBlogsFromFriendsTrips(
  trips: LsTrip[],
  options?: { defaultCoverUrl?: string },
): MockRecapBlog[] {
  const defaultCover = options?.defaultCoverUrl ?? "/images/recap/kr.png";

  const filtered = trips.filter((t) => {
    const list = t.placeList;
    return Array.isArray(list) && list.length >= 1;
  });

  const sorted = [...filtered].sort((a, b) => {
    const ta = a.endTimestamp || a.startTimestamp || "";
    const tb = b.endTimestamp || b.startTimestamp || "";
    return tb.localeCompare(ta);
  });

  const top10 = sorted.slice(0, 10);

  return top10.map((trip) => {
    const username = (trip as any).username ?? (trip as any).owner ?? "unknown";
    const authorId = (trip as any).userId ?? (trip as any).user_id ?? username;
    const blogKey = trip.blogKey;
    const title = trip.title ?? "Trip";
    const coverUri = trip.coverPhotoUri;
    const coverImageUrl = coverUri ? assetUrl(coverUri) : defaultCover;
    const locationLabel =
      (trip as any).country ?? (trip as any).visitedPlaceName?.[0] ?? "";
    const dateLabel = trip.endTimeString ?? trip.startTimeString ?? "";

    return {
      id: `recap-${username}-${blogKey}`,
      title,
      coverImageUrl,
      locationLabel,
      dateLabel,
      authorId: String(authorId),
      authorUsername: username,
      authorAvatarUrl: undefined,
      href: `/profile/${encodeURIComponent(username)}/recap/${blogKey}`,
    };
  });
}
