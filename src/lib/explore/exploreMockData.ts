/**
 * Mock Explore data — multiple friends, network-first.
 * When EXCLUDE_CURRENT_USER_IN_EXPLORE is true, the adapter filters out the current user's content.
 */

export const EXCLUDE_CURRENT_USER_IN_EXPLORE =
  process.env.NEXT_PUBLIC_EXPLORE_EXCLUDE_ME !== "false";

import type {
  NetworkTrendingPlace,
  NetworkBestMoment,
  NetworkRecapBlogItem,
  NetworkFriendActivity,
} from "./exploreTypes";

const AVATAR = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

export const MOCK_NETWORK_TRENDING_PLACES: NetworkTrendingPlace[] = [
  {
    id: "trend1",
    placeName: "Senso-ji Temple",
    cityOrCountry: "Tokyo, Japan",
    coverImageUrl:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    badges: ["Most visited", "Most liked"],
    likes: 128,
    saves: 94,
    visits: 42,
    lat: 35.7148,
    lng: 139.7967,
    placeId: "place2",
  },
  {
    id: "trend2",
    placeName: "McWay Falls",
    cityOrCountry: "Big Sur, CA",
    coverImageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    badges: ["Most saved"],
    likes: 86,
    saves: 120,
    visits: 31,
    lat: 36.1569,
    lng: -121.6688,
    placeId: "place3",
  },
  {
    id: "trend3",
    placeName: "Café du Marché",
    cityOrCountry: "San Jose, CA",
    coverImageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    badges: ["Most liked"],
    likes: 64,
    saves: 48,
    visits: 28,
    lat: 37.3352,
    lng: -121.8811,
    placeId: "place1",
  },
  {
    id: "trend4",
    placeName: "Monterey Bay Aquarium",
    cityOrCountry: "Monterey, CA",
    coverImageUrl:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    badges: ["Most saved", "Most visited"],
    likes: 52,
    saves: 71,
    visits: 19,
    lat: 36.6182,
    lng: -121.9018,
    placeId: "place7",
  },
];

export const MOCK_NETWORK_BEST_MOMENTS: NetworkBestMoment[] = [
  {
    id: "mom1",
    imageUrl:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    friendId: "f2",
    friendName: "Jordan",
    friendAvatarUrl: AVATAR("jordan"),
    placeName: "Senso-ji Temple",
    timeAgo: "2h ago",
    likes: 24,
    lat: 35.7148,
    lng: 139.7967,
    placeId: "place2",
  },
  {
    id: "mom2",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    friendId: "f3",
    friendName: "Sam",
    friendAvatarUrl: AVATAR("sam"),
    placeName: "McWay Falls",
    timeAgo: "5h ago",
    likes: 18,
    lat: 36.1569,
    lng: -121.6688,
    placeId: "place3",
  },
  {
    id: "mom3",
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
    friendId: "f1",
    friendName: "Alex",
    friendAvatarUrl: AVATAR("alex"),
    placeName: "Café du Marché",
    timeAgo: "1d ago",
    lat: 37.3352,
    lng: -121.8811,
    placeId: "place1",
  },
  {
    id: "mom4",
    imageUrl:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80",
    friendId: "f4",
    friendName: "Casey",
    friendAvatarUrl: AVATAR("casey"),
    placeName: "Monterey Bay Aquarium",
    timeAgo: "2d ago",
    likes: 12,
    lat: 36.6182,
    lng: -121.9018,
    placeId: "place7",
  },
  {
    id: "mom5",
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
    friendId: "f2",
    friendName: "Jordan",
    friendAvatarUrl: AVATAR("jordan"),
    placeName: "Ferry Building",
    timeAgo: "3d ago",
    lat: 37.7956,
    lng: -122.3935,
    placeId: "place5",
  },
  {
    id: "mom6",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    friendId: "f1",
    friendName: "Alex",
    friendAvatarUrl: AVATAR("alex"),
    placeName: "Swiss Alps",
    timeAgo: "1w ago",
    lat: 46.5197,
    lng: 8.0146,
  },
];

export const MOCK_NETWORK_RECAP_BLOGS: NetworkRecapBlogItem[] = [
  {
    id: "recap1",
    title: "Weekend in the Swiss Alps",
    dateRange: "Aug 3–5, 2025",
    previewImageUrls: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
    ],
    authorId: "f1",
    authorName: "Alex",
    authorAvatarUrl: AVATAR("alex"),
    coordinates: [
      { lat: 46.5197, lng: 8.0146 },
      { lat: 46.6, lng: 8.1 },
    ],
  },
  {
    id: "recap2",
    title: "Tokyo Food & Temples",
    dateRange: "Jul 12–18, 2025",
    previewImageUrls: [
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80",
    ],
    authorId: "f2",
    authorName: "Jordan",
    authorAvatarUrl: AVATAR("jordan"),
    coordinates: [{ lat: 35.7148, lng: 139.7967 }],
  },
  {
    id: "recap3",
    title: "Coastal Road Trip",
    dateRange: "Jun 20–22, 2025",
    previewImageUrls: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80",
    ],
    authorId: "f3",
    authorName: "Sam",
    authorAvatarUrl: AVATAR("sam"),
    coordinates: [
      { lat: 36.1569, lng: -121.6688 },
      { lat: 36.6182, lng: -121.9018 },
    ],
  },
];

export const MOCK_NETWORK_FRIEND_ACTIVITY: NetworkFriendActivity[] = [
  {
    id: "act1",
    friendId: "f2",
    friendName: "Jordan",
    friendAvatarUrl: AVATAR("jordan"),
    action: "saved a place",
    actionDetail: "Senso-ji Temple",
    timeAgo: "1h ago",
    placeId: "place2",
    lat: 35.7148,
    lng: 139.7967,
  },
  {
    id: "act2",
    friendId: "f4",
    friendName: "Casey",
    friendAvatarUrl: AVATAR("casey"),
    action: "added photos",
    actionDetail: "6 photos at Monterey Bay Aquarium",
    timeAgo: "3h ago",
    placeId: "place7",
    lat: 36.6182,
    lng: -121.9018,
  },
  {
    id: "act3",
    friendId: "f1",
    friendName: "Alex",
    friendAvatarUrl: AVATAR("alex"),
    action: "published a recap",
    actionDetail: "Weekend in the Swiss Alps",
    timeAgo: "1d ago",
  },
  {
    id: "act4",
    friendId: "f3",
    friendName: "Sam",
    friendAvatarUrl: AVATAR("sam"),
    action: "saved a place",
    actionDetail: "McWay Falls",
    timeAgo: "2d ago",
    placeId: "place3",
    lat: 36.1569,
    lng: -121.6688,
  },
];
