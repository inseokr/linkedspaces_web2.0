/**
 * Explore page types — network-first discovery.
 * Data adapter can map from API (e.g. LsFriendsVisitEntry, trips) to these shapes.
 */

export type ExploreTimeFilter = "Today" | "7D" | "30D" | "All";
export type ExploreContentFilter = "Moments" | "Recap Blogs" | "Places";
export type ExploreRadiusMi = 50 | 200 | 500;
export type ExploreSortMode = "Trending" | "New" | "Near Me";

/** Trending place card in "Trending in Your Network" carousel */
export interface NetworkTrendingPlace {
  id: string;
  placeName: string;
  cityOrCountry: string;
  coverImageUrl: string;
  badges: ("Most saved" | "Most liked" | "Most visited")[];
  likes: number;
  saves: number;
  visits: number;
  /** For map sync */
  lat: number;
  lng: number;
  placeId?: string;
}

/** Best moment tile (photo + friend + place + time) */
export interface NetworkBestMoment {
  id: string;
  imageUrl: string;
  friendId: string;
  friendName: string;
  friendAvatarUrl?: string;
  placeName: string;
  timeAgo: string;
  likes?: number;
  /** For map sync */
  lat?: number;
  lng?: number;
  placeId?: string;
}

/** Recap blog list card */
export interface NetworkRecapBlogItem {
  id: string;
  title: string;
  dateRange: string;
  previewImageUrls: string[];
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  /** For map: show recap route/summary pins */
  placeIds?: string[];
  coordinates?: { lat: number; lng: number }[];
}

/** Friend activity row */
export interface NetworkFriendActivity {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatarUrl?: string;
  action: "saved a place" | "added photos" | "published a recap";
  actionDetail?: string;
  timeAgo: string;
  placeId?: string;
  lat?: number;
  lng?: number;
}

/** Map-friendly place (for ExploreMapPanel) */
export interface ExploreMapPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  username?: string;
  category?: string;
  sentiment?: "positive" | "neutral" | "negative";
  caption?: string;
  /** Stats for overlay card */
  likes?: number;
  saves?: number;
  visits?: number;
}
