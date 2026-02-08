/**
 * Builds Home page data from the current user's private network (cached user).
 * Friends: from user.friends when backend provides it.
 * Recap blogs: from user.trips + placeVisitHistory (same as profile recap).
 * Feed: from user.placeVisitHistory (recent visits with photos).
 */

import type { User, PlaceVisitHistoryItem } from "@/api/user";
import { assetUrl } from "@/api/assets";
import { transformToAllBlogItems } from "@/views/Profile/recap-blogs/utils/tripDataTransform";
import type {
  MockFriend,
  MockRecapBlog,
  MockFeedPost,
  MockPlace,
} from "./mockNetwork";

/** Format ISO or date string to "Xh ago" / "Xd ago" / "Xw ago" */
export function formatTimeAgo(isoOrDate: string | undefined | null): string {
  if (!isoOrDate) return "";
  const date = new Date(isoOrDate);
  if (Number.isNaN(date.getTime())) return "";
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return date.toLocaleDateString();
}

/** Map backend user.friends to Home friends row shape. */
export function getHomeFriends(user: User | null): MockFriend[] {
  if (!user?.friends?.length) return [];
  return user.friends.map((f) => ({
    id: f._id,
    username: f.username,
    avatarUrl: f.profile_picture ? assetUrl(f.profile_picture) : undefined,
  }));
}

/** Map user.trips + placeVisitHistory to RecapBlogsCarousel shape (current user's recap blogs). */
export function getHomeRecapBlogs(user: User | null): MockRecapBlog[] {
  if (!user) return [];
  const trips = user.trips ?? [];
  const placeVisitHistory = user.placeVisitHistory ?? [];
  const username = user.username;
  const profilePicture = user.profile_picture
    ? assetUrl(user.profile_picture)
    : undefined;

  const items = transformToAllBlogItems(trips, {
    username,
    placeVisitHistory,
    includeYearInDateLabel: true,
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    coverImageUrl: item.coverImageUrl,
    locationLabel: item.locationLabel,
    dateLabel: item.dateLabel,
    authorId: user._id,
    authorUsername: username,
    authorAvatarUrl: profilePicture,
    href: item.href,
  }));
}

/** First photo URI from a place (selected or first cloud photo). */
function getFirstPhotoUri(
  place: PlaceVisitHistoryItem | undefined,
): string | undefined {
  const photos = place?.photoList;
  if (!Array.isArray(photos) || photos.length === 0) return undefined;
  const selected = photos.find(
    (p) => p?.selected && p?.uri && !p.uri.startsWith("file://"),
  );
  if (selected?.uri) return selected.uri;
  const first = photos.find((p) => p?.uri && !p.uri.startsWith("file://"));
  return first?.uri;
}

/** Build feed posts from placeVisitHistory (recent places with photos). Excludes hidden so Feed matches My Places. */
export function getHomeFeedPosts(user: User | null): MockFeedPost[] {
  if (!user) return [];
  const history = user.placeVisitHistory ?? [];
  const username = user.username;
  const userId = user._id;
  const avatarUrl = user.profile_picture
    ? assetUrl(user.profile_picture)
    : undefined;

  const withPhotos = history.filter((entry) => {
    if (!entry) return false;
    if (entry.status === "hidden") return false;
    const uri = getFirstPhotoUri(entry);
    return !!uri;
  }) as PlaceVisitHistoryItem[];

  // Sort by visitedTime descending (most recent first)
  const sorted = [...withPhotos].sort((a, b) => {
    const ta = a.visitedTime || a.visitedTimeDigitized || "";
    const tb = b.visitedTime || b.visitedTimeDigitized || "";
    return tb.localeCompare(ta);
  });

  return sorted.slice(0, 20).map((place, index) => {
    const uri = getFirstPhotoUri(place);
    const placeName =
      place.placeName || place.visitedCity || place.city || "A place";
    const timeStr = place.visitedTime || place.visitedTimeDigitized;
    const likeCount = place.likes ?? place.likeCount ?? place.likesCount ?? 0;
    const commentCount = 0; // Backend could add later

    return {
      id: `feed-${user._id}-${place.placeIndex ?? index}`,
      userId,
      username,
      userAvatarUrl: avatarUrl,
      placeName,
      placeId: (place as any)._id,
      imageUrl: uri ? assetUrl(uri) : "",
      timeAgo: formatTimeAgo(timeStr),
      likeCount,
      commentCount,
    };
  });
}

function firstPhotoUri(
  photoList: PlaceVisitHistoryItem["photoList"],
): string | undefined {
  if (!Array.isArray(photoList)) return undefined;
  const withUri = photoList.find(
    (p) => p?.uri && !String(p.uri).startsWith("file://"),
  );
  return withUri?.uri;
}

/** Build network places for Explore map from current user's placeVisitHistory (with coordinates). */
export function getNetworkPlacesFromUser(user: User | null): MockPlace[] {
  if (!user) return [];
  const history = user.placeVisitHistory ?? [];
  const username = user.username;
  const userId = user._id;

  return history
    .filter((entry): entry is PlaceVisitHistoryItem => {
      if (!entry) return false;
      const coord = entry.coordinate;
      return (
        coord != null &&
        Number.isFinite(coord.latitude) &&
        Number.isFinite(coord.longitude)
      );
    })
    .map((entry, i) => {
      const firstUri = firstPhotoUri(entry.photoList);
      const photoStory = entry.photoList?.find((p) => p?.story)?.story;
      const caption = entry.story ?? photoStory ?? undefined;
      return {
        id: (entry as any)._id ?? `place-${userId}-${i}`,
        name: entry.placeName || entry.visitedCity || entry.city || "Place",
        lat: entry.coordinate!.latitude,
        lng: entry.coordinate!.longitude,
        category: entry.categories?.[0],
        userId,
        username,
        sentiment: entry.sentiment ?? undefined,
        imageUrl: firstUri ? assetUrl(firstUri) : undefined,
        caption: caption || undefined,
      };
    });
}
