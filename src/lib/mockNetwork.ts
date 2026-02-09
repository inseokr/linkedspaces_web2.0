/**
 * Shared mock data for Home and Explore: friends, recap blogs, feed, and network places.
 * Used until backend APIs are available.
 */

export type MockFriend = {
  id: string;
  username: string;
  avatarUrl?: string;
};

export type MockRecapBlog = {
  id: string;
  title: string;
  coverImageUrl: string;
  locationLabel: string;
  dateLabel: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  href?: string;
  /** ISO date string; when set, used for "this month" filters (e.g. Popular Blogs This Month). */
  createdAt?: string;
};

export type MockFeedPost = {
  id: string;
  userId: string;
  username: string;
  userAvatarUrl?: string;
  placeName: string;
  /** City/location for Google search link (e.g. "Place Name, City Name"). */
  cityName?: string;
  placeId?: string;
  imageUrl: string;
  timeAgo: string;
  likeCount: number;
  commentCount: number;
  /** ISO date string; when set, used for "this month" filters (e.g. Top Poster / Trending Places). */
  createdAt?: string;
  /** User sentiment: positive (green), neutral (yellow), negative (red). Shown on feed card and place modal. */
  sentiment?: "positive" | "neutral" | "negative";
};

/** User sentiment for map marker badge: positive (green), neutral (yellow), negative (red) */
export type MockPlaceSentiment = "positive" | "neutral" | "negative";

export type MockPlace = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category?: string;
  userId?: string;
  username?: string;
  /** Optional sentiment for orange marker badge on Explore map */
  sentiment?: MockPlaceSentiment;
  /** First/cover photo URL for place photo modal when opening from map marker */
  imageUrl?: string;
  /** Place caption/story shown under "by {username}" in Explore place list card */
  caption?: string;
};

export const MOCK_FRIENDS: MockFriend[] = [
  {
    id: "f1",
    username: "Alex",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
  },
  {
    id: "f2",
    username: "Jordan",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
  },
  {
    id: "f3",
    username: "Sam",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
  },
  {
    id: "f4",
    username: "Casey",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=casey",
  },
  {
    id: "f5",
    username: "Riley",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=riley",
  },
];

export const MOCK_RECAP_BLOGS: MockRecapBlog[] = [
  {
    id: "r1",
    title: "Weekend in the Swiss Alps",
    coverImageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    locationLabel: "Swiss Alps",
    dateLabel: "Aug 3–5, 2025",
    authorId: "f1",
    authorUsername: "Alex",
    authorAvatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    href: "/trip/r1",
  },
  {
    id: "r2",
    title: "Tokyo Food & Temples",
    coverImageUrl:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    locationLabel: "Tokyo, Japan",
    dateLabel: "Jul 12–18, 2025",
    authorId: "f2",
    authorUsername: "Jordan",
    authorAvatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
    href: "/trip/r2",
  },
  {
    id: "r3",
    title: "Coastal Road Trip",
    coverImageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    locationLabel: "Big Sur, CA",
    dateLabel: "Jun 20–22, 2025",
    authorId: "f3",
    authorUsername: "Sam",
    authorAvatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
    href: "/trip/r3",
  },
];

export const MOCK_FEED_POSTS: MockFeedPost[] = [
  {
    id: "p1",
    userId: "f1",
    username: "Alex",
    userAvatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    placeName: "Café du Marché",
    placeId: "place1",
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    timeAgo: "2h ago",
    likeCount: 24,
    commentCount: 5,
  },
  {
    id: "p2",
    userId: "f2",
    username: "Jordan",
    userAvatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
    placeName: "Senso-ji Temple",
    placeId: "place2",
    imageUrl:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    timeAgo: "5h ago",
    likeCount: 42,
    commentCount: 12,
  },
  {
    id: "p3",
    userId: "f3",
    username: "Sam",
    userAvatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
    placeName: "McWay Falls",
    placeId: "place3",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    timeAgo: "1d ago",
    likeCount: 18,
    commentCount: 3,
  },
];

/** Network places with lat/lng (used for Home placeholders and Explore map). imageUrl matches feed post where placeId matches. */
export const MOCK_NETWORK_PLACES: MockPlace[] = [
  {
    id: "place1",
    name: "Café du Marché",
    lat: 37.3352,
    lng: -121.8811,
    category: "Cafe",
    userId: "f1",
    username: "Alex",
    sentiment: "positive",
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    caption: "Best croissants and people-watching in the neighborhood.",
  },
  {
    id: "place2",
    name: "Senso-ji Temple",
    lat: 35.7148,
    lng: 139.7967,
    category: "Temple",
    userId: "f2",
    username: "Jordan",
    sentiment: "positive",
    imageUrl:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    caption: "Go early to beat the crowds. The gate and market are magical.",
  },
  {
    id: "place3",
    name: "McWay Falls",
    lat: 36.1569,
    lng: -121.6688,
    category: "Nature",
    userId: "f3",
    username: "Sam",
    sentiment: "neutral",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    caption:
      "Short trail to the overlook. Tide was out so the cove was visible.",
  },
  {
    id: "place4",
    name: "Golden Gate Park",
    lat: 37.7694,
    lng: -122.4862,
    category: "Park",
    userId: "f1",
    username: "Alex",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    caption: "Spent the afternoon at the Japanese Tea Garden and de Young.",
  },
  {
    id: "place5",
    name: "Ferry Building",
    lat: 37.7956,
    lng: -122.3935,
    category: "Landmark",
    userId: "f2",
    username: "Jordan",
    sentiment: "neutral",
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    caption: "Saturday farmers market and great oysters inside.",
  },
  {
    id: "place6",
    name: "Santa Cruz Beach",
    lat: 36.9741,
    lng: -122.0308,
    category: "Beach",
    userId: "f3",
    username: "Sam",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    caption: "Boardwalk and beach day with the family.",
  },
  {
    id: "place7",
    name: "Monterey Bay Aquarium",
    lat: 36.6182,
    lng: -121.9018,
    category: "Museum",
    userId: "f4",
    username: "Casey",
    sentiment: "positive",
    imageUrl:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    caption: "The jellyfish and otters are a must-see. Book ahead.",
  },
  {
    id: "place8",
    name: "Half Moon Bay",
    lat: 37.4636,
    lng: -122.4286,
    category: "Beach",
    userId: "f5",
    username: "Riley",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    caption: "Pumpkin patch season and coastal drive. Very windy!",
  },
];
