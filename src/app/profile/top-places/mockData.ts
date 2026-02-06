/**
 * Mock data for Top Places page. Replace with API later.
 */

export type TopPlaceCategory =
  | "Cafe"
  | "Restaurants"
  | "Shopping"
  | "Golf"
  | "Attractions"
  | "Sightseeing"
  | "Activity"
  | "Hotels/Resorts"
  | "Bakery"
  | "Others";

export interface CountryWithCount {
  id: string;
  name: string;
  count: number;
}

export interface TopPlace {
  id: string;
  title: string;
  country: string;
  city: string;
  category: TopPlaceCategory;
  imageUrl: string;
  photosCount: number;
  visitsCount: number;
  likesCount: number;
  rank: number;
}

export const MOCK_COUNTRIES_WITH_COUNTS: CountryWithCount[] = [
  { id: "all", name: "All", count: 0 },
  { id: "jp", name: "Japan", count: 23 },
  { id: "it", name: "Italy", count: 18 },
  { id: "fr", name: "France", count: 15 },
  { id: "us", name: "United States", count: 22 },
];

export const TOP_PLACE_CATEGORIES: TopPlaceCategory[] = [
  "Cafe",
  "Restaurants",
  "Shopping",
  "Golf",
  "Attractions",
  "Sightseeing",
  "Activity",
  "Hotels/Resorts",
  "Bakery",
  "Others",
];

// Portrait dimensions (width x height) to match phone-style photos
const PLACEHOLDER_IMAGES = [
  "https://picsum.photos/400/600?random=1",
  "https://picsum.photos/400/600?random=2",
  "https://picsum.photos/400/600?random=3",
  "https://picsum.photos/400/600?random=4",
  "https://picsum.photos/400/600?random=5",
  "https://picsum.photos/400/600?random=6",
  "https://picsum.photos/400/600?random=7",
  "https://picsum.photos/400/600?random=8",
  "https://picsum.photos/400/600?random=9",
  "https://picsum.photos/400/600?random=10",
  "https://picsum.photos/400/600?random=11",
  "https://picsum.photos/400/600?random=12",
  "https://picsum.photos/400/600?random=13",
  "https://picsum.photos/400/600?random=14",
  "https://picsum.photos/400/600?random=15",
  "https://picsum.photos/400/600?random=16",
  "https://picsum.photos/400/600?random=17",
  "https://picsum.photos/400/600?random=18",
  "https://picsum.photos/400/600?random=19",
  "https://picsum.photos/400/600?random=20",
  "https://picsum.photos/400/600?random=21",
  "https://picsum.photos/400/600?random=22",
  "https://picsum.photos/400/600?random=23",
  "https://picsum.photos/400/600?random=24",
];

export const MOCK_TOP_PLACES: TopPlace[] = [
  {
    id: "1",
    title: "Senso-ji Temple",
    country: "Japan",
    city: "Tokyo",
    category: "Attractions",
    imageUrl: PLACEHOLDER_IMAGES[0],
    photosCount: 124,
    visitsCount: 8,
    likesCount: 47,
    rank: 1,
  },
  {
    id: "2",
    title: "Fushimi Inari Taisha",
    country: "Japan",
    city: "Kyoto",
    category: "Sightseeing",
    imageUrl: PLACEHOLDER_IMAGES[1],
    photosCount: 89,
    visitsCount: 6,
    likesCount: 52,
    rank: 2,
  },
  {
    id: "3",
    title: "Colosseum",
    country: "Italy",
    city: "Rome",
    category: "Attractions",
    imageUrl: PLACEHOLDER_IMAGES[2],
    photosCount: 156,
    visitsCount: 4,
    likesCount: 61,
    rank: 3,
  },
  {
    id: "4",
    title: "Eiffel Tower",
    country: "France",
    city: "Paris",
    category: "Sightseeing",
    imageUrl: PLACEHOLDER_IMAGES[3],
    photosCount: 203,
    visitsCount: 5,
    likesCount: 78,
    rank: 4,
  },
  {
    id: "5",
    title: "Blue Bottle Coffee",
    country: "Japan",
    city: "Tokyo",
    category: "Cafe",
    imageUrl: PLACEHOLDER_IMAGES[4],
    photosCount: 34,
    visitsCount: 12,
    likesCount: 28,
    rank: 5,
  },
  {
    id: "6",
    title: "Trattoria Mario",
    country: "Italy",
    city: "Florence",
    category: "Restaurants",
    imageUrl: PLACEHOLDER_IMAGES[5],
    photosCount: 45,
    visitsCount: 3,
    likesCount: 39,
    rank: 6,
  },
  {
    id: "7",
    title: "Louvre Museum",
    country: "France",
    city: "Paris",
    category: "Attractions",
    imageUrl: PLACEHOLDER_IMAGES[6],
    photosCount: 178,
    visitsCount: 2,
    likesCount: 92,
    rank: 7,
  },
  {
    id: "8",
    title: "Central Park",
    country: "United States",
    city: "New York",
    category: "Attractions",
    imageUrl: PLACEHOLDER_IMAGES[7],
    photosCount: 98,
    visitsCount: 15,
    likesCount: 44,
    rank: 8,
  },
  {
    id: "9",
    title: "Shibuya Crossing",
    country: "Japan",
    city: "Tokyo",
    category: "Sightseeing",
    imageUrl: PLACEHOLDER_IMAGES[8],
    photosCount: 67,
    visitsCount: 9,
    likesCount: 55,
    rank: 9,
  },
  {
    id: "10",
    title: "Venice Canals",
    country: "Italy",
    city: "Venice",
    category: "Sightseeing",
    imageUrl: PLACEHOLDER_IMAGES[9],
    photosCount: 112,
    visitsCount: 2,
    likesCount: 71,
    rank: 10,
  },
  {
    id: "11",
    title: "Café de Flore",
    country: "France",
    city: "Paris",
    category: "Cafe",
    imageUrl: PLACEHOLDER_IMAGES[10],
    photosCount: 41,
    visitsCount: 4,
    likesCount: 33,
    rank: 11,
  },
  {
    id: "12",
    title: "Golden Gate Bridge",
    country: "United States",
    city: "San Francisco",
    category: "Sightseeing",
    imageUrl: PLACEHOLDER_IMAGES[11],
    photosCount: 145,
    visitsCount: 6,
    likesCount: 62,
    rank: 12,
  },
  {
    id: "13",
    title: "Arashiyama Bamboo Grove",
    country: "Japan",
    city: "Kyoto",
    category: "Attractions",
    imageUrl: PLACEHOLDER_IMAGES[12],
    photosCount: 88,
    visitsCount: 3,
    likesCount: 48,
    rank: 13,
  },
  {
    id: "14",
    title: "Vatican Museums",
    country: "Italy",
    city: "Rome",
    category: "Attractions",
    imageUrl: PLACEHOLDER_IMAGES[13],
    photosCount: 134,
    visitsCount: 1,
    likesCount: 56,
    rank: 14,
  },
  {
    id: "15",
    title: "Montmartre",
    country: "France",
    city: "Paris",
    category: "Sightseeing",
    imageUrl: PLACEHOLDER_IMAGES[14],
    photosCount: 76,
    visitsCount: 7,
    likesCount: 41,
    rank: 15,
  },
  {
    id: "16",
    title: "Pike Place Market",
    country: "United States",
    city: "Seattle",
    category: "Shopping",
    imageUrl: PLACEHOLDER_IMAGES[15],
    photosCount: 52,
    visitsCount: 4,
    likesCount: 29,
    rank: 16,
  },
  {
    id: "17",
    title: "TeamLab Borderless",
    country: "Japan",
    city: "Tokyo",
    category: "Attractions",
    imageUrl: PLACEHOLDER_IMAGES[16],
    photosCount: 165,
    visitsCount: 2,
    likesCount: 84,
    rank: 17,
  },
  {
    id: "18",
    title: "Amalfi Coast Drive",
    country: "Italy",
    city: "Naples",
    category: "Sightseeing",
    imageUrl: PLACEHOLDER_IMAGES[17],
    photosCount: 93,
    visitsCount: 1,
    likesCount: 67,
    rank: 18,
  },
  {
    id: "19",
    title: "Provence Lavender Fields",
    country: "France",
    city: "Marseille",
    category: "Sightseeing",
    imageUrl: PLACEHOLDER_IMAGES[18],
    photosCount: 72,
    visitsCount: 2,
    likesCount: 53,
    rank: 19,
  },
  {
    id: "20",
    title: "Yosemite National Park",
    country: "United States",
    city: "San Francisco",
    category: "Attractions",
    imageUrl: PLACEHOLDER_IMAGES[19],
    photosCount: 198,
    visitsCount: 3,
    likesCount: 89,
    rank: 20,
  },
  {
    id: "21",
    title: "Omotesando Koffee",
    country: "Japan",
    city: "Tokyo",
    category: "Cafe",
    imageUrl: PLACEHOLDER_IMAGES[20],
    photosCount: 28,
    visitsCount: 11,
    likesCount: 22,
    rank: 21,
  },
  {
    id: "22",
    title: "Osteria Francescana",
    country: "Italy",
    city: "Modena",
    category: "Restaurants",
    imageUrl: PLACEHOLDER_IMAGES[21],
    photosCount: 19,
    visitsCount: 1,
    likesCount: 35,
    rank: 22,
  },
  {
    id: "23",
    title: "Hotel Plaza Athénée",
    country: "France",
    city: "Paris",
    category: "Hotels/Resorts",
    imageUrl: PLACEHOLDER_IMAGES[22],
    photosCount: 44,
    visitsCount: 2,
    likesCount: 31,
    rank: 23,
  },
  {
    id: "24",
    title: "Disneyland Park",
    country: "United States",
    city: "Los Angeles",
    category: "Attractions",
    imageUrl: PLACEHOLDER_IMAGES[23],
    photosCount: 167,
    visitsCount: 8,
    likesCount: 73,
    rank: 24,
  },
];

export type SortOption = "rank" | "visits" | "photos" | "likes";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "rank", label: "Rank" },
  { value: "visits", label: "Most visits" },
  { value: "photos", label: "Most photos" },
  { value: "likes", label: "Most liked" },
];

/** Map country name (as in TopPlace.country) to country id for filtering */
export function getCountryIdByName(name: string): string | undefined {
  return MOCK_COUNTRIES_WITH_COUNTS.find(
    (c) => c.name.toLowerCase() === name.toLowerCase(),
  )?.id;
}
