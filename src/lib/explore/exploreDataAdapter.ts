/**
 * Explore data adapter — network-ready.
 * Accepts network arrays; can later be wired to API (e.g. LsFriendsVisitEntry, trips).
 * When EXCLUDE_CURRENT_USER_IN_EXPLORE is true, filters out items owned by currentUser.
 */

import { getCachedUser } from "@/api/user";
import type { MockPlace } from "@/lib/mockNetwork";
import { MOCK_NETWORK_PLACES } from "@/lib/mockNetwork";
import { networkPlacesFromFriendsVisitHistory } from "@/lib/lsHomeMappers";
import type {
  NetworkTrendingPlace,
  NetworkBestMoment,
  NetworkRecapBlogItem,
  NetworkFriendActivity,
  ExploreMapPlace,
} from "./exploreTypes";
import {
  EXCLUDE_CURRENT_USER_IN_EXPLORE,
  MOCK_NETWORK_TRENDING_PLACES,
  MOCK_NETWORK_BEST_MOMENTS,
  MOCK_NETWORK_RECAP_BLOGS,
  MOCK_NETWORK_FRIEND_ACTIVITY,
} from "./exploreMockData";

/** Username of current user (from cache). Used to exclude own content when flag is on. */
function getCurrentUsername(): string | null {
  const user = getCachedUser();
  if (!user?.username) return null;
  return String(user.username).trim().toLowerCase();
}

function isCurrentUser(
  username: string | undefined,
  current: string | null,
): boolean {
  if (!current || !username) return false;
  return String(username).trim().toLowerCase() === current;
}

type ItemWithOwner = {
  friendName?: string;
  authorName?: string;
  username?: string;
};

/** Filter array by excluding current user's content when EXCLUDE_CURRENT_USER_IN_EXPLORE is true. */
function excludeMe<T>(items: T[], currentUsername: string | null): T[] {
  if (!EXCLUDE_CURRENT_USER_IN_EXPLORE || !currentUsername) return items;
  return items.filter((item) => {
    const owner = item as ItemWithOwner;
    const name = owner.friendName ?? owner.authorName ?? owner.username;
    return !isCurrentUser(name ?? undefined, currentUsername);
  });
}

/** Get trending places (mock for now). Network-ready: can swap to API. */
export function getNetworkTrendingPlaces(): NetworkTrendingPlace[] {
  const current = getCurrentUsername();
  return excludeMe(MOCK_NETWORK_TRENDING_PLACES, current);
}

/** Get best moments (mock). */
export function getNetworkBestMoments(): NetworkBestMoment[] {
  const current = getCurrentUsername();
  return excludeMe(MOCK_NETWORK_BEST_MOMENTS, current);
}

/** Get recap blogs (mock). */
export function getNetworkRecapBlogs(): NetworkRecapBlogItem[] {
  const current = getCurrentUsername();
  return excludeMe(MOCK_NETWORK_RECAP_BLOGS, current);
}

/** Get friend activity (mock). */
export function getNetworkFriendActivity(): NetworkFriendActivity[] {
  const current = getCurrentUsername();
  return excludeMe(MOCK_NETWORK_FRIEND_ACTIVITY, current);
}

/** Map adapter places for the map: MockPlace[] from friends + mock, with optional exclude-me. */
export function getExploreMapPlaces(
  visitEntries: unknown[] | null,
  radiusMiles: number,
): MockPlace[] {
  const current = getCurrentUsername();
  const friendsPlaces =
    visitEntries && Array.isArray(visitEntries)
      ? networkPlacesFromFriendsVisitHistory(visitEntries as any)
      : [];
  const mockPlaces = MOCK_NETWORK_PLACES;
  const combined = [...friendsPlaces, ...mockPlaces];
  const deduped = Array.from(
    new Map(combined.map((p) => [String(p.id), p])).values(),
  );
  if (EXCLUDE_CURRENT_USER_IN_EXPLORE && current) {
    return deduped.filter((p) => !isCurrentUser(p.username, current));
  }
  return deduped.length > 0 ? deduped : MOCK_NETWORK_PLACES;
}

/** Convert trending place / moment / activity to ExploreMapPlace for map sync. */
export function toExploreMapPlace(
  item:
    | NetworkTrendingPlace
    | (NetworkBestMoment & { lat?: number; lng?: number })
    | NetworkFriendActivity,
): ExploreMapPlace | null {
  if ("placeName" in item && "lat" in item && "lng" in item) {
    const place = item as NetworkTrendingPlace;
    return {
      id: place.id,
      name: place.placeName,
      lat: place.lat,
      lng: place.lng,
      imageUrl: place.coverImageUrl,
      likes: place.likes,
      saves: place.saves,
      visits: place.visits,
    };
  }
  if (
    "placeName" in item &&
    "lat" in item &&
    "lng" in item &&
    "imageUrl" in item
  ) {
    const moment = item as NetworkBestMoment;
    if (moment.lat == null || moment.lng == null) return null;
    return {
      id: moment.id,
      name: moment.placeName,
      lat: moment.lat,
      lng: moment.lng,
      imageUrl: moment.imageUrl,
      likes: moment.likes,
    };
  }
  if ("action" in item && "lat" in item && "lng" in item) {
    const act = item as NetworkFriendActivity;
    if (act.lat == null || act.lng == null) return null;
    return {
      id: act.id,
      name: act.actionDetail ?? act.action,
      lat: act.lat,
      lng: act.lng,
    };
  }
  return null;
}
