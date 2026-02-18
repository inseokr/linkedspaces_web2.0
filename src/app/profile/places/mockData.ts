/**
 * Mock data for View All Places page. Replace with API later.
 */

export type PlaceCategory =
  | "Cafe"
  | "Restaurants"
  | "Shopping"
  | "Golf"
  | "Attractions"
  | "Sightseeing"
  | "Activity"
  | "Hotels/Resorts"
  | "Bakery";

export interface PlaceWithSavedAt {
  id: string;
  title: string;
  country: string;
  category: PlaceCategory;
  savedAt: Date;
  imageUrl: string | null;
  /** For lightbox: all photo URIs when available */
  photoListUris?: string[];
  /** For lightbox: caption/story when available */
  caption?: string;
  /** For lightbox: raw visited date string (e.g. YYYY-MM-DD) */
  visitedTimeRaw?: string;
  /** User sentiment for list view (e.g. positive / neutral / negative) */
  sentiment?: "positive" | "neutral" | "negative";
}

export interface CountryWithCount {
  id: string;
  name: string;
  count: number;
}

export const VIEW_ALL_YEARS = [2025, 2023, 2022, 2021, 2020];

export const VIEW_ALL_COUNTRIES: CountryWithCount[] = [
  { id: "all", name: "All", count: 0 },
  { id: "jp", name: "Japan", count: 23 },
  { id: "it", name: "Italy", count: 18 },
  { id: "fr", name: "France", count: 15 },
  { id: "us", name: "United States", count: 22 },
  { id: "de", name: "Germany", count: 12 },
  { id: "gb", name: "United Kingdom", count: 10 },
  { id: "kr", name: "South Korea", count: 8 },
];

export const VIEW_ALL_CATEGORIES: PlaceCategory[] = [
  "Cafe",
  "Restaurants",
  "Shopping",
  "Golf",
  "Attractions",
  "Sightseeing",
  "Activity",
  "Hotels/Resorts",
  "Bakery",
];

const IMG = (seed: number) => `https://picsum.photos/400/400?random=${seed}`;

/** Generate mock places grouped across months, newest first by savedAt */
export function getMockPlaces(): PlaceWithSavedAt[] {
  const now = new Date();
  const places: PlaceWithSavedAt[] = [];
  const titles = [
    "Boba Bliss",
    "Sushi Ichimoto",
    "Sunright Tea Studio",
    "Place Name",
    "Central Park",
    "Louvre Museum",
    "Blue Bottle Coffee",
    "Trattoria Mario",
    "Senso-ji Temple",
    "Eiffel Tower",
    "Golden Gate Bridge",
    "Pike Place Market",
    "TeamLab Borderless",
    "Café de Flore",
    "Vatican Museums",
    "Montmartre",
    "Amalfi Coast Drive",
    "Yosemite National Park",
    "Omotesando Koffee",
    "Disneyland Park",
    "Venice Canals",
    "Shibuya Crossing",
    "Fushimi Inari Taisha",
    "Colosseum",
    "Arashiyama Bamboo Grove",
    "Hotel Plaza Athénée",
    "Osteria Francescana",
    "Provence Lavender Fields",
    "BJ's Restaurant & Brewhouse",
    "Pho LAN",
  ];
  const countries = ["United States", "Japan", "Italy", "France"];
  const categories: PlaceCategory[] = [
    "Cafe",
    "Restaurants",
    "Attractions",
    "Sightseeing",
    "Shopping",
    "Hotels/Resorts",
  ];

  let id = 1;
  for (let m = 0; m < 4; m++) {
    const month = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();
    const count = m === 0 ? 9 : 6;
    for (let i = 0; i < count; i++) {
      const day = (i % daysInMonth) + 1;
      places.push({
        id: String(id++),
        title: titles[(id + i) % titles.length],
        country: countries[(id + i) % countries.length],
        category: categories[(id + i) % categories.length],
        savedAt: new Date(month.getFullYear(), month.getMonth(), day),
        imageUrl: IMG(id + 100),
      });
    }
  }

  return places.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
}
