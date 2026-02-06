/**
 * Mock data for My Places page. Derives from View All Places (getMockPlaces)
 * so Latest Activity and Saved list match the same places, names, and dates.
 */

import { getMockPlaces } from "../places/mockData";
import type { PlaceWithSavedAt } from "../places/mockData";

export type PlaceCategory =
  | "Cafe"
  | "Restaurant"
  | "Bar"
  | "Park"
  | "Others"
  | (string & {});

export interface LatestActivityPlace {
  id: string;
  name: string;
  date: string; // e.g. "Dec 5", "Nov 28"
  category: PlaceCategory;
  imageUrl: string | null;
  caption: string;
  saved?: boolean;
}

export interface SavedPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  visitedDate: string; // e.g. "Visited Dec 5th"
  snippet: string;
  thumbnailUrl: string | null;
  address: string;
  /** City for lightbox "Go to link" (Place Name, City Name) */
  city?: string;
  lat: number;
  lng: number;
  /** For place lightbox: caption/story */
  caption?: string;
  /** For place lightbox: all photo URIs */
  photoListUris?: string[];
  /** For place lightbox: raw visited time (ISO/date string) */
  visitedTimeRaw?: string;
}

const MONTH_SHORT: Record<number, string> = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  3: "Apr",
  4: "May",
  5: "Jun",
  6: "Jul",
  7: "Aug",
  8: "Sep",
  9: "Oct",
  10: "Nov",
  11: "Dec",
};

/** Map View All Places category to My Places filter category */
function toMyPlacesCategory(cat: PlaceWithSavedAt["category"]): PlaceCategory {
  if (cat === "Cafe") return "Cafe";
  if (cat === "Restaurants") return "Restaurant";
  if (cat === "Hotels/Resorts") return "Bar";
  return "Park"; // Attractions, Sightseeing, Shopping, Golf, Activity, Bakery
}

function formatDateShort(d: Date): string {
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function formatVisitedDate(d: Date): string {
  const day = d.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
          ? "rd"
          : "th";
  return `Visited ${MONTH_SHORT[d.getMonth()]} ${day}${suffix}`;
}

/** Dummy coords/address by country for list display */
function mockAddress(p: PlaceWithSavedAt): {
  address: string;
  lat: number;
  lng: number;
} {
  const byCountry: Record<
    string,
    { address: string; lat: number; lng: number }
  > = {
    "United States": {
      address: "123 Main St, Los Angeles, CA 90001",
      lat: 34.05,
      lng: -118.24,
    },
    Japan: { address: "1-2-3 Shibuya, Tokyo, Japan", lat: 35.66, lng: 139.7 },
    Italy: { address: "Via Roma 1, Rome, Italy", lat: 41.9, lng: 12.5 },
    France: { address: "1 Rue de Paris, Paris, France", lat: 48.86, lng: 2.35 },
  };
  const def = byCountry["United States"];
  const c = byCountry[p.country] ?? def;
  return { address: `${p.title}, ${c.address}`, lat: c.lat, lng: c.lng };
}

const CAPTION_SNIPPET =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

/** Latest Activity: first N places from View All Places (newest first), same names & dates */
export function getLatestActivityForMyPlaces(count = 7): LatestActivityPlace[] {
  const all = getMockPlaces();
  return all.slice(0, count).map((p) => {
    const { address } = mockAddress(p);
    return {
      id: p.id,
      name: p.title,
      date: formatDateShort(p.savedAt),
      category: toMyPlacesCategory(p.category),
      imageUrl: p.imageUrl,
      caption: CAPTION_SNIPPET,
      saved: true,
    };
  });
}

/** Saved Places: same source as View All Places, same names & dates */
export function getSavedPlacesForMyPlaces(): SavedPlace[] {
  const all = getMockPlaces();
  return all.map((p) => {
    const { address, lat, lng } = mockAddress(p);
    return {
      id: p.id,
      name: p.title,
      category: toMyPlacesCategory(p.category),
      visitedDate: formatVisitedDate(p.savedAt),
      snippet: CAPTION_SNIPPET,
      thumbnailUrl: p.imageUrl,
      address,
      lat,
      lng,
    };
  });
}

/** Default filter categories when no places (FilterPopover fallback) */
export const PLACE_CATEGORIES: PlaceCategory[] = [
  "Cafe",
  "Restaurant",
  "Bar",
  "Park",
  "Others",
];
