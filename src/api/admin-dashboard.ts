/**
 * Admin dashboard API client.
 * Calls backend endpoints that aggregate data from ALL users (MongoDB/placeVisitHistory).
 * Admin-only: backend must verify username is "inseo" or "yoobin".
 */

import { apiFetch } from "@/api/client";

function getAuthToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const t = window.localStorage.getItem("token");
    if (t) return t;
  } catch {
    // ignore
  }
  try {
    return window.sessionStorage.getItem("token") ?? undefined;
  } catch {
    return undefined;
  }
}

// --- Backend response types (match Node/Mongoose API) ---

export type BackendOverview = {
  totalUsers: number;
  totalPlaces: number;
  totalPhotos: number;
  totalComments: number;
  newUsersLast30Days: number;
  avgPlacesPerUser: string;
  avgPhotosPerPlace: string;
};

export type BackendPoiAccuracy = {
  topThreeAccuracy: string;
  topTenAccuracy: string;
  topFortyAccuracy: string;
  totalSelections: number;
};

export type BackendGeography = {
  placesByCountry: [string, number][];
  placesByCity: [string, number][];
};

export type BackendCategory = {
  category: string;
  count: number;
  percentage: string;
};

export type BackendTopActiveUser = {
  username: string;
  placesAdded: number;
  photosAdded: number;
  joinedDate: string;
};

export type BackendEngagement = {
  photosWithStoryPercentage: string;
  audioCaptionPercentage: string;
  totalStories: number;
  totalAudioCaptions: number;
};

export type BackendDashboardAnalytics = {
  overview: BackendOverview;
  poiAccuracy: BackendPoiAccuracy;
  geography: BackendGeography;
  categories: BackendCategory[];
  topActiveUsers: BackendTopActiveUser[];
  engagement: BackendEngagement;
};

export type BackendUserDetails = {
  username: string;
  joinedDate: string;
  totalPlaces: number;
  totalPhotos: number;
  placesByCountry: Record<string, number>;
  placesByCity: Record<string, number>;
  placesByCategory: { category: string; count: number; percentage: string }[];
  avgPhotosPerPlace: string;
  photosWithStoryPercentage: string;
  audioCaptionPercentage: string;
  avgStoryLength: number;
  friendCount: number;
};

/**
 * Fetch dashboard analytics (all users). Returns 403 if not admin.
 */
export async function fetchDashboardAnalytics(): Promise<BackendDashboardAnalytics> {
  const token = getAuthToken();
  const res = await apiFetch<BackendDashboardAnalytics>(
    "/admin/dashboard-analytics",
    {
      method: "GET",
      token,
    },
  );
  return res;
}

/**
 * Fetch per-user detailed metrics. Returns 403 if not admin, 404 if user not found.
 */
export async function fetchUserDetails(
  username: string,
): Promise<BackendUserDetails> {
  const token = getAuthToken();
  const encoded = encodeURIComponent(username);
  const res = await apiFetch<BackendUserDetails>(
    `/admin/user-details/${encoded}`,
    {
      method: "GET",
      token,
    },
  );
  return res;
}
