/**
 * Mock data for My Places Search overlay. Replace with real data later.
 */

export type SearchPlaceCategory =
  | "Restaurants"
  | "Coffee"
  | "Attractions"
  | "Bar"
  | "Bakery";

export interface SearchPlace {
  id: string;
  name: string;
  category: SearchPlaceCategory;
  city: string;
  /** US state code (e.g. "CA") or region; used for consistent "City, State" display */
  state?: string;
  country: string;
  captionKeywords: string[];
  createdAt: string;
  photoCount: number;
}

export const SEARCH_CATEGORIES: {
  id: SearchPlaceCategory | "All";
  label: string;
}[] = [
  { id: "All", label: "All" },
  { id: "Restaurants", label: "Restaurants" },
  { id: "Coffee", label: "Coffee" },
  { id: "Attractions", label: "Attractions" },
  { id: "Bar", label: "Bar" },
  { id: "Bakery", label: "Bakery" },
];

/** Bay Area places: consistent city names and state for "Current location" default list */
export const MOCK_SEARCH_PLACES: SearchPlace[] = [
  {
    id: "s1",
    name: "Sip & Savor",
    category: "Restaurants",
    city: "San Francisco",
    state: "CA",
    country: "United States",
    captionKeywords: ["brunch", "cozy", "coffee"],
    createdAt: "2024-01-15",
    photoCount: 12,
  },
  {
    id: "s2",
    name: "Lemon Crab",
    category: "Restaurants",
    city: "Oakland",
    state: "CA",
    country: "United States",
    captionKeywords: ["seafood", "fresh"],
    createdAt: "2024-01-14",
    photoCount: 8,
  },
  {
    id: "s3",
    name: "Hinata Sushi Kitchen",
    category: "Restaurants",
    city: "San Francisco",
    state: "CA",
    country: "United States",
    captionKeywords: ["sushi", "japanese"],
    createdAt: "2024-01-12",
    photoCount: 15,
  },
  {
    id: "s4",
    name: "Ghazni Afghan Kabobs & Restaurant",
    category: "Restaurants",
    city: "Oakland",
    state: "CA",
    country: "United States",
    captionKeywords: ["afghan", "kabob"],
    createdAt: "2024-01-10",
    photoCount: 6,
  },
  {
    id: "s5",
    name: "Oh G Burger",
    category: "Restaurants",
    city: "Oakland",
    state: "CA",
    country: "United States",
    captionKeywords: ["burger", "casual"],
    createdAt: "2024-01-08",
    photoCount: 4,
  },
  {
    id: "s6",
    name: "Red Chili | Thai + Vietnamese",
    category: "Restaurants",
    city: "Berkeley",
    state: "CA",
    country: "United States",
    captionKeywords: ["thai", "vietnamese", "spicy"],
    createdAt: "2024-01-05",
    photoCount: 10,
  },
  {
    id: "s7",
    name: "The Dirty Bird Lounge",
    category: "Bar",
    city: "San Francisco",
    state: "CA",
    country: "United States",
    captionKeywords: ["bar", "cocktails"],
    createdAt: "2024-01-03",
    photoCount: 7,
  },
  {
    id: "s8",
    name: "Blue Bottle Coffee",
    category: "Coffee",
    city: "San Francisco",
    state: "CA",
    country: "United States",
    captionKeywords: ["coffee", "artisan"],
    createdAt: "2024-01-02",
    photoCount: 5,
  },
  {
    id: "s9",
    name: "Tartine Bakery",
    category: "Bakery",
    city: "San Francisco",
    state: "CA",
    country: "United States",
    captionKeywords: ["bakery", "bread", "pastry"],
    createdAt: "2023-12-28",
    photoCount: 14,
  },
  {
    id: "s10",
    name: "Golden Gate Viewpoint",
    category: "Attractions",
    city: "San Francisco",
    state: "CA",
    country: "United States",
    captionKeywords: ["view", "bridge", "photo"],
    createdAt: "2023-12-25",
    photoCount: 20,
  },
  {
    id: "s11",
    name: "Philz Coffee",
    category: "Coffee",
    city: "Oakland",
    state: "CA",
    country: "United States",
    captionKeywords: ["coffee", "mint mojito"],
    createdAt: "2023-12-20",
    photoCount: 3,
  },
  {
    id: "s12",
    name: "Alcatraz Island",
    category: "Attractions",
    city: "San Francisco",
    state: "CA",
    country: "United States",
    captionKeywords: ["tour", "history", "island"],
    createdAt: "2023-12-15",
    photoCount: 22,
  },
];
