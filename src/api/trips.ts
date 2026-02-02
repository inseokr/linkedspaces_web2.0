// trips.ts
import { apiFetch } from "@/api/client";

/** --------------------------------
 *  Shared / User Trips (summary)
 *  -------------------------------- */
export type TripPrivacyControl = {
  level: "public" | "private" | "hidden" | string;
  allowedUserList: string[];
};

export type TripCoordinate = {
  latitude: number;
  longitude: number;
};

export type TripPlaceRef = {
  placeIndex: number;
  _id?: string;
};

/**
 * User.trips[] 에 들어있는 "요약 Trip"
 * - 목록/지도/국가별 recap 리스트용
 */
export type Trip = {
  blogKey: number;
  status: "saved" | string;

  privacyControl: TripPrivacyControl;

  startTimeString: string;
  endTimeString: string;
  startingYear: number | string;

  startTimestamp?: string; // ISO
  endTimestamp?: string; // ISO

  title?: string;
  tripHighlight?: string;
  coverPhotoUri?: string;

  visitedPlaceName?: string[];
  country?: string;
  countryCode?: string;

  coordinate?: TripCoordinate;
  placeList?: TripPlaceRef[];
};

/** --------------------------------
 *  Trip Recap API (detail)
 *  - /trip-recap/:userName/:blogKey 응답
 *  -------------------------------- */

/** photoList 원소 */
export type TripRecapPhoto = {
  uri: string; // "/public/..." (often HEIC)
  story: string | null;
  sentiment: number;
  selected: boolean;
  inAppPhoto: boolean;

  creationTime: string; // ISO
  digitizedTime: string; // "YYYY:MM:DD HH:mm:ss"

  coordinate?: TripCoordinate;

  audio: any | null;
  storyAudio: any | null;
  vibeEnabled: boolean;

  comments: any[];
  liked: Array<{ _id: string; username: string }>;
  _id: string;
};

/** places 원소 */
export type TripRecapPlace = {
  placeName: string;
  coordinate: TripCoordinate;

  visitedTime: string; // ISO
  digitizedTime: string; // "YYYY:MM:DD HH:mm:ss"

  story: string | null; // place-level story (often null)
  sentiment: number;
  categories: string[];

  externalUrl?: string;

  photoList: TripRecapPhoto[];
};

/** days 원소 */
export type TripRecapDay = {
  date: string; // "2024:11:09"
  places: TripRecapPlace[];
};

/** trip-recap 최상위 응답 */
export type TripRecapResponse = {
  trip: {
    title: string;
    highlight: string;

    startTimeString: string;
    endTimeString: string;
    startingYear: string | number;

    coordinate: TripCoordinate;
    visitedPlaceName: string[];

    userName: string;
    profilePicture: string; // "/public/..."
  };
  days: TripRecapDay[];
};

type SimpleResult = { result: "OK" | "FAIL"; reason?: string };

export type UpdateTripCoverPhotoRequest = {
  blogKey: number;
  photoUri: string | null;
};

/**
 * Update trip cover photo (server-side).
 * Backend expects: { blogKey, photoUri }
 */
export async function updateTripCoverPhoto(body: UpdateTripCoverPhotoRequest) {
  const token =
    typeof window !== "undefined"
      ? (() => {
          try {
            const t = window.localStorage.getItem("token");
            if (t) return t;
          } catch {
            // ignore and try sessionStorage
          }
          try {
            return window.sessionStorage.getItem("token") ?? undefined;
          } catch {
            return undefined;
          }
        })()
      : undefined;

  const res = await apiFetch<SimpleResult>(`/trips/update-cover-photo`, {
    method: "POST",
    body,
    // Some endpoints use req.user(session); some use Bearer token — send both when available.
    credentials: "include",
    token,
  });

  if (!res || res.result !== "OK") {
    throw new Error(res?.reason || "Failed to update cover photo");
  }
}
