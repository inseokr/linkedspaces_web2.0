/**
 * Admin dashboard API client.
 * Calls backend endpoints that aggregate data from ALL users (MongoDB/placeVisitHistory).
 * Admin-only: backend must verify username is "inseo" or "yoobin".
 */

import { apiFetch } from "@/api/client";
import {
  fetchFriendList,
  fetchMyProfileSummary,
  fetchNetworkInfo,
  fetchProfileSummary,
  type ProfileSummary,
} from "@/api/mynetwork";
import type { ApiUsageMetrics } from "@/app/admin/dashboard/types";

function asNumber(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : 0;
}

function pickNumber(obj: unknown, keys: string[]): number {
  if (!obj || typeof obj !== "object") return 0;
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    if (rec[k] == null) continue;
    const n = asNumber(rec[k]);
    if (n) return n;
  }
  return 0;
}

function pickString(obj: unknown, keys: string[]): string {
  if (!obj || typeof obj !== "object") return "";
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = rec[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

function normalizeFriendUsername(friend: unknown): string | null {
  if (typeof friend === "string") return friend;
  if (!friend || typeof friend !== "object") return null;
  const o = friend as Record<string, unknown>;
  return (
    (typeof o.username === "string" && o.username) ||
    (typeof (o as any).userName === "string" &&
      ((o as any).userName as string)) ||
    null
  );
}

function getRecentPlaces(summary: ProfileSummary | null): unknown[] {
  const list = summary?.recentPlaces;
  return Array.isArray(list) ? list : [];
}

function countByField(
  items: unknown[],
  getKey: (item: Record<string, unknown>) => string,
): [string, number][] {
  const map = new Map<string, number>();
  for (const it of items) {
    if (!it || typeof it !== "object") continue;
    const key = getKey(it as Record<string, unknown>).trim();
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

type RealDashboardAnalyticsResponse = {
  result: "OK" | "FAIL" | string;
  data?: {
    overview?: {
      totalUsers?: number;
      totalPlaces?: number;
      totalPhotos?: number;
      totalComments?: number;
      newUsersLast30Days?: number;
      averagePlacesPerUser?: string | number;
      averagePhotosPerPlace?: string | number;
    };
    poiAccuracy?: {
      top3AccuracyPct?: string | number;
      top10AccuracyPct?: string | number;
      top40AccuracyPct?: string | number;
      totalSelections?: number;
    };
    geography?: {
      placesByCountry?: Array<{ country: string; count: number }>;
      placesByCity?: Array<{ city: string; count: number }>;
    };
    categories?: Array<{
      category: string;
      count: number;
      percentage: string | number;
    }>;
    topActiveUsers?: Array<{
      username: string;
      placesAdded: number;
      photosAdded: number;
      joinedDate: string;
    }>;
    engagement?: {
      photosWithStoryPct?: string | number;
      photosWithAudioPct?: string | number;
      totalStories?: number;
      totalAudioCaptions?: number;
    };
  };
  message?: string;
  reason?: string;
  error?: string;
};

function normalizeRealAnalyticsToLegacy(
  res: RealDashboardAnalyticsResponse,
): BackendDashboardAnalytics {
  const result = String(res?.result ?? "").toUpperCase();
  if (result !== "OK") {
    const msg =
      res?.reason ??
      res?.message ??
      res?.error ??
      `Unexpected result: ${result}`;
    throw new Error(String(msg));
  }

  const data = res?.data ?? {};
  const o = data.overview ?? {};
  const p = data.poiAccuracy ?? {};
  const g = data.geography ?? {};
  const e = data.engagement ?? {};

  return {
    overview: {
      totalUsers: asNumber(o.totalUsers),
      totalPlaces: asNumber(o.totalPlaces),
      totalPhotos: asNumber(o.totalPhotos),
      totalComments: asNumber(o.totalComments),
      newUsersLast30Days: asNumber(o.newUsersLast30Days),
      avgPlacesPerUser: String(o.averagePlacesPerUser ?? "0"),
      avgPhotosPerPlace: String(o.averagePhotosPerPlace ?? "0"),
    },
    poiAccuracy: {
      topThreeAccuracy: String(p.top3AccuracyPct ?? "0"),
      topTenAccuracy: String(p.top10AccuracyPct ?? "0"),
      topFortyAccuracy: String(p.top40AccuracyPct ?? "0"),
      totalSelections: asNumber(p.totalSelections),
    },
    geography: {
      placesByCountry: Array.isArray(g.placesByCountry)
        ? g.placesByCountry
            .filter((x) => x && typeof x.country === "string")
            .map((x) => [x.country, asNumber(x.count)] as [string, number])
        : [],
      placesByCity: Array.isArray(g.placesByCity)
        ? g.placesByCity
            .filter((x) => x && typeof x.city === "string")
            .map((x) => [x.city, asNumber(x.count)] as [string, number])
        : [],
    },
    categories: Array.isArray(data.categories)
      ? data.categories.map((c) => ({
          category: String(c.category ?? ""),
          count: asNumber(c.count),
          percentage: String(c.percentage ?? "0"),
        }))
      : [],
    topActiveUsers: Array.isArray(data.topActiveUsers)
      ? data.topActiveUsers.map((u) => ({
          username: String(u.username ?? ""),
          placesAdded: asNumber(u.placesAdded),
          photosAdded: asNumber(u.photosAdded),
          joinedDate: String(u.joinedDate ?? ""),
        }))
      : [],
    engagement: {
      photosWithStoryPercentage: String(e.photosWithStoryPct ?? "0"),
      // Legacy field name: `audioCaptionPercentage` (we map "photos with audio/storyAudio %" here)
      audioCaptionPercentage: String(e.photosWithAudioPct ?? "0"),
      totalStories: asNumber(e.totalStories),
      totalAudioCaptions: asNumber(e.totalAudioCaptions),
    },
  };
}

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

type RealPerUserDashboardResponse = {
  result: "OK" | "FAIL" | string;
  data?: {
    overview?: {
      username?: string;
      joinedDate?: string;
      totalPlaces?: number;
      totalPhotos?: number;
      friendCount?: number;
    };
    geography?: {
      placesByCountry?: Array<{ country: string; count: number }>;
      placesByCity?: Array<{ city: string; count: number }>;
    };
    categories?: Array<{
      category: string;
      count: number;
      percentage: string | number;
    }>;
    engagement?: {
      averagePhotosPerPlace?: string | number;
      photosWithStoryPct?: string | number;
      photosWithAudioPct?: string | number;
      averageStoryLengthChars?: number;
    };
  };
  message?: string;
  reason?: string;
  error?: string;
};

function normalizeRealPerUserToLegacy(
  res: RealPerUserDashboardResponse,
  requestedUsername: string,
): BackendUserDetails {
  const result = String(res?.result ?? "").toUpperCase();
  if (result !== "OK") {
    const msg =
      res?.reason ??
      res?.message ??
      res?.error ??
      `Unexpected result: ${result}`;
    throw new Error(String(msg));
  }

  const data = res?.data ?? {};
  const o = data.overview ?? {};
  const g = data.geography ?? {};
  const e = data.engagement ?? {};

  const placesByCountryArr = Array.isArray(g.placesByCountry)
    ? g.placesByCountry
    : [];
  const placesByCityArr = Array.isArray(g.placesByCity) ? g.placesByCity : [];

  const placesByCountry: Record<string, number> = {};
  for (const x of placesByCountryArr) {
    if (!x || typeof x.country !== "string") continue;
    placesByCountry[x.country] = asNumber(x.count);
  }

  const placesByCity: Record<string, number> = {};
  for (const x of placesByCityArr) {
    if (!x || typeof x.city !== "string") continue;
    placesByCity[x.city] = asNumber(x.count);
  }

  const placesByCategory = Array.isArray(data.categories)
    ? data.categories.map((c) => ({
        category: String(c.category ?? ""),
        count: asNumber(c.count),
        percentage: String(c.percentage ?? "0"),
      }))
    : [];

  return {
    username: String(o.username ?? requestedUsername),
    joinedDate: String(o.joinedDate ?? ""),
    totalPlaces: asNumber(o.totalPlaces),
    totalPhotos: asNumber(o.totalPhotos),
    friendCount: asNumber(o.friendCount),
    placesByCountry,
    placesByCity,
    placesByCategory,
    avgPhotosPerPlace: String(e.averagePhotosPerPlace ?? "0"),
    photosWithStoryPercentage: String(e.photosWithStoryPct ?? "0"),
    audioCaptionPercentage: String(e.photosWithAudioPct ?? "0"),
    avgStoryLength: asNumber(e.averageStoryLengthChars),
  };
}

type RealApiUsageResponse = {
  result?: "OK" | "FAIL" | string;
  data?: {
    totalByService?: {
      google?: number;
      openai?: number;
      unsplash?: number;
      osmCityName?: number;
      osmAddress?: number;
    };
    costPerUserAvgUsd?: number;
    perUserBreakdown?: any[];
  };
  totalByService?: {
    google?: number;
    openai?: number;
    unsplash?: number;
    osmCityName?: number;
    osmAddress?: number;
  };
  costPerUserAvgUsd?: number;
  perUserBreakdown?: any[];
  message?: string;
  reason?: string;
  error?: string;
};

function normalizeRealApiUsageToLegacy(
  res: RealApiUsageResponse,
): ApiUsageMetrics {
  const result = String(res?.result ?? "").toUpperCase();
  if (res?.result && result !== "OK") {
    const msg =
      res?.reason ??
      res?.message ??
      res?.error ??
      `Unexpected result: ${result}`;
    throw new Error(String(msg));
  }

  const data = res?.data ?? res;
  const t = data.totalByService ?? {};

  const perUserBreakdown = Array.isArray(data.perUserBreakdown)
    ? data.perUserBreakdown.map((u: any) => ({
        userId: String(u.userId ?? ""),
        username: String(u.username ?? ""),
        placesSaved: asNumber(u.placesSaved),
        friends: asNumber(u.friends),
        highlights: asNumber(u.highlights),
        recapBlogs: asNumber(u.recapBlogs),
        itineraries: asNumber(u.itineraries),
      }))
    : [];

  return {
    totalByService: {
      google: asNumber(t.google),
      openai: asNumber(t.openai),
      unsplash: asNumber(t.unsplash),
      osmCityName: asNumber(t.osmCityName),
      osmAddress: asNumber(t.osmAddress),
    },
    costPerUserAvgUsd: asNumber(data.costPerUserAvgUsd),
    perUserBreakdown,
  };
}

/**
 * Fetch dashboard API usage. Returns 403 if not admin.
 */
export async function fetchApiUsageMetrics(): Promise<ApiUsageMetrics> {
  const token = getAuthToken();
  try {
    const res = await apiFetch<RealApiUsageResponse>(
      "/admin/dashboard/api-usage",
      {
        method: "GET",
        token,
      },
    );
    return normalizeRealApiUsageToLegacy(res);
  } catch (e: unknown) {
    throw e;
  }
}

/**
 * Fetch dashboard analytics (all users). Returns 403 if not admin.
 */
export async function fetchDashboardAnalytics(): Promise<BackendDashboardAnalytics> {
  const token = getAuthToken();
  try {
    // Preferred endpoint (Express server): GET /LS_API/admin/dashboard/analytics
    const res = await apiFetch<RealDashboardAnalyticsResponse>(
      "/admin/dashboard/analytics",
      {
        method: "GET",
        token,
      },
    );
    return normalizeRealAnalyticsToLegacy(res);
  } catch (e: unknown) {
    const status = (e as any)?.status;
    // Fallback: Pocketverse Express server does not implement /admin/* endpoints.
    // Use MyNetwork "dashboard-ish" endpoints to populate what we can.
    if (status !== 404) throw e;

    const [profileSummary, networkInfo, friends] = await Promise.all([
      fetchMyProfileSummary().catch(() => null),
      fetchNetworkInfo().catch(() => ({}) as Record<string, unknown>),
      fetchFriendList().catch(() => [] as unknown[]),
    ]);

    const stats = profileSummary?.stats ?? {};
    const totalPlaces = pickNumber(stats, [
      "totalPlaces",
      "total_places",
      "places",
      "placesCount",
      "totalPlacesSaved",
    ]);
    const totalPhotos = pickNumber(stats, [
      "totalPhotos",
      "total_photos",
      "photos",
      "photosCount",
      "totalImageCount",
    ]);
    const totalComments = pickNumber(stats, ["totalComments", "comments"]);

    const friendCount = pickNumber(networkInfo, [
      "number_of_friends",
      "numberOfFriends",
      "friendCount",
    ]);
    const totalUsers = Math.max(1, friendCount + 1);

    const recentPlaces = getRecentPlaces(profileSummary);
    const placesByCountry = countByField(recentPlaces, (p) => {
      const c =
        (typeof p.country === "string" && p.country) ||
        (typeof p.countryCode === "string" && p.countryCode) ||
        "";
      return c;
    });
    const placesByCity = countByField(recentPlaces, (p) => {
      const city =
        (typeof p.visitedCity === "string" && p.visitedCity) ||
        (typeof p.city === "string" && p.city) ||
        "";
      const country =
        (typeof p.country === "string" && p.country) ||
        (typeof p.countryCode === "string" && p.countryCode) ||
        "";
      return country ? `${city}, ${country}` : city;
    });

    const topActiveUsers: BackendTopActiveUser[] = friends
      .map((f) => normalizeFriendUsername(f))
      .filter(Boolean)
      .slice(0, 10)
      .map((username) => ({
        username: String(username),
        placesAdded: 0,
        photosAdded: 0,
        joinedDate: new Date().toISOString(),
      }));

    const avgPlacesPerUser = totalUsers
      ? (totalPlaces / totalUsers).toFixed(2)
      : "0";
    const avgPhotosPerPlace = totalPlaces
      ? (totalPhotos / Math.max(1, totalPlaces)).toFixed(2)
      : "0";

    return {
      overview: {
        totalUsers,
        totalPlaces,
        totalPhotos,
        totalComments,
        newUsersLast30Days: 0,
        avgPlacesPerUser,
        avgPhotosPerPlace,
      },
      poiAccuracy: {
        topThreeAccuracy: "0",
        topTenAccuracy: "0",
        topFortyAccuracy: "0",
        totalSelections: 0,
      },
      geography: {
        placesByCountry,
        placesByCity,
      },
      categories: [],
      topActiveUsers,
      engagement: {
        photosWithStoryPercentage: "0",
        audioCaptionPercentage: "0",
        totalStories: 0,
        totalAudioCaptions: 0,
      },
    };
  }
}

/**
 * Fetch per-user detailed metrics. Returns 403 if not admin, 404 if user not found.
 */
export async function fetchUserDetails(
  username: string,
): Promise<BackendUserDetails> {
  const token = getAuthToken();
  const encoded = encodeURIComponent(username);
  try {
    console.debug(
      "[admin-dashboard] fetchUserDetails: GET",
      `/LS_API/admin/dashboard/user/${encoded}`,
    );
    const res = await apiFetch<RealPerUserDashboardResponse>(
      `/admin/dashboard/user/${encoded}`,
      {
        method: "GET",
        token,
      },
    );
    return normalizeRealPerUserToLegacy(res, username);
  } catch (e: unknown) {
    const status = (e as any)?.status;
    console.debug("[admin-dashboard] fetchUserDetails failed", {
      status,
      message: (e as any)?.message,
      detail: (e as any)?.detail,
    });
    if (status !== 404) throw e;

    console.debug(
      "[admin-dashboard] fetchUserDetails fallback: GET",
      `/LS_API/mynetwork/profile_summary/${encoded}`,
    );
    const summary = await fetchProfileSummary(username);
    console.debug("[admin-dashboard] fetchUserDetails fallback ok", {
      hasBasicInfo: Boolean((summary as any)?.basicInfo),
      hasStats: Boolean((summary as any)?.stats),
      recentTrips: Array.isArray((summary as any)?.recentTrips)
        ? (summary as any).recentTrips.length
        : null,
      recentPlaces: Array.isArray((summary as any)?.recentPlaces)
        ? (summary as any).recentPlaces.length
        : null,
    });
    const stats = summary?.stats ?? {};
    const totalPlaces = pickNumber(stats, [
      "totalPlaces",
      "total_places",
      "places",
      "placesCount",
      "totalPlacesSaved",
    ]);
    const totalPhotos = pickNumber(stats, [
      "totalPhotos",
      "total_photos",
      "photos",
      "photosCount",
      "totalImageCount",
    ]);

    const recentPlaces = getRecentPlaces(summary);
    const placesByCountry = Object.fromEntries(
      countByField(recentPlaces, (p) => {
        const c =
          (typeof p.country === "string" && p.country) ||
          (typeof p.countryCode === "string" && p.countryCode) ||
          "";
        return c;
      }),
    );
    const placesByCity = Object.fromEntries(
      countByField(recentPlaces, (p) => {
        const city =
          (typeof p.visitedCity === "string" && p.visitedCity) ||
          (typeof p.city === "string" && p.city) ||
          "";
        const country =
          (typeof p.country === "string" && p.country) ||
          (typeof p.countryCode === "string" && p.countryCode) ||
          "";
        return country ? `${city}, ${country}` : city;
      }),
    );

    const joinedDate =
      pickString(summary?.basicInfo, [
        "joinedDate",
        "createdAt",
        "created_at",
      ]) || "";

    const avgPhotosPerPlace = totalPlaces
      ? (totalPhotos / Math.max(1, totalPlaces)).toFixed(2)
      : "0";

    return {
      username,
      joinedDate,
      totalPlaces,
      totalPhotos,
      placesByCountry,
      placesByCity,
      placesByCategory: [],
      avgPhotosPerPlace,
      photosWithStoryPercentage: String(
        pickNumber(stats, [
          "photosWithStoryPercentage",
          "pctPhotosWithStory",
        ]) || 0,
      ),
      audioCaptionPercentage: String(
        pickNumber(stats, ["audioCaptionPercentage", "pctAudioCaptions"]) || 0,
      ),
      avgStoryLength: pickNumber(stats, [
        "avgStoryLength",
        "averageStoryLength",
      ]),
      friendCount: 0,
    };
  }
}
