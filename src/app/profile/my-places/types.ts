/**
 * Typed interface for a placeVisitHistory entry as returned by the backend.
 * Use for safer mapping when building My Places UI from getCachedUser().placeVisitHistory.
 */
import type { GeoCoordinate } from "@/api/user";

export interface PlaceVisitHistoryEntry {
  _id?: string;
  placeIndex?: number;
  placeName?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  state?: string;
  visitedTime?: string;
  visitedTimeDigitized?: string;
  categories?: string[];
  photoList?: Array<{
    uri?: string;
    story?: string;
    caption?: string;
    selected?: boolean;
  }>;
  status?: string;
  primaryPlace?: boolean;
  privacyControl?: { level?: string; allowedUserList?: string[] };
  placeScore?: number;
  ranking?: number;
  coordinate?: GeoCoordinate;
  /** Place-level story/caption (backend may use either) */
  story?: string;
  caption?: string;
  /** Place comments from backend (when available). Shape: { _id?, userId?, username?, text?, parentId?, replyToUsername?, createdAt? }[] */
  comments?: Array<Record<string, unknown>>;
}
