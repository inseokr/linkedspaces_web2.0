/**
 * Typed interface for a placeVisitHistory entry as returned by the backend.
 * Used for Top Places data from getCachedUser().placeVisitHistory.
 */
import type { PlaceVisitHistoryItem } from "@/api/user";

/** Entry shape for Top Places: API item plus optional ranking/backend fields */
export interface PlaceVisitHistoryEntry extends PlaceVisitHistoryItem {
  _id?: string;
  visitedTimeDigitized?: string;
  placeScore?: number;
  ranking?: number;
  visitedCount?: number;
}

/**
 * Derived model for a single Top Place card in the UI.
 * Matches the existing TopPlace UI contract (mockData.TopPlace).
 */
export interface TopPlaceCardModel {
  id: string;
  title: string;
  country: string;
  countryCode: string;
  city: string;
  category: string;
  imageUrl: string;
  photosCount: number;
  visitsCount: number;
  likesCount: number;
  rank: number;
  /** For lightbox: first photo uri and optional extra uris */
  photoListUris?: string[];
  visitedTime?: string;
  /** Place or photo caption/story for lightbox and card preview */
  caption?: string;
  /** When true, caption is from another photo at this place (show "From another photo" or similar) */
  captionFromOtherPhoto?: boolean;
  /** For map: from placeVisitHistory coordinate; omit if not available */
  latitude?: number;
  longitude?: number;
}
