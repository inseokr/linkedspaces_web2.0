/**
 * Maps backend dashboard API response to frontend dashboard types.
 * Merges real data with mock fallbacks for metrics the backend doesn't yet provide.
 */

import type {
  BackendDashboardAnalytics,
  BackendUserDetails,
} from "@/api/admin-dashboard";
import type {
  OverviewMetrics,
  UserActivityMetrics,
  PerformanceMetrics,
  GeoMetrics,
  PerUserMetrics,
  TopUserRow,
  POIAccuracy,
} from "./types";
import {
  getMockOverviewMetrics,
  getMockUserActivityMetrics,
  getMockPerformanceMetrics,
  getMockGeoMetrics,
  getMockPerUserMetrics,
} from "./mockData";

function parseNum(s: string | number): number {
  if (typeof s === "number") return s;
  const n = parseFloat(String(s));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Merge backend analytics with mock overview (backend has no DAU/WAU/MAU/trend).
 */
export function mapToOverviewMetrics(
  backend: BackendDashboardAnalytics | null,
): OverviewMetrics {
  const mock = getMockOverviewMetrics();
  if (!backend) return mock;

  const o = backend.overview;
  return {
    ...mock,
    mau: o.totalUsers,
    activeUsersCurrentPeriod: o.totalUsers,
    newSignupsCurrent: o.newUsersLast30Days,
    newSignupsPrevious: mock.newSignupsPrevious,
    userGrowthRatePercent:
      mock.newSignupsPrevious > 0
        ? ((o.newUsersLast30Days - mock.newSignupsPrevious) /
            mock.newSignupsPrevious) *
          100
        : 0,
    // Keep mock for DAU/WAU/trend until backend supports
    dau: mock.dau,
    wau: mock.wau,
    retentionRatePercent: mock.retentionRatePercent,
    stickinessRatio: mock.stickinessRatio,
    churnRatePercent: mock.churnRatePercent,
    trendDaily: mock.trendDaily,
  };
}

/**
 * Map backend topActiveUsers + engagement to activity metrics; rest from mock.
 */
export function mapToActivityMetrics(
  backend: BackendDashboardAnalytics | null,
): UserActivityMetrics {
  const mock = getMockUserActivityMetrics();
  if (!backend) return mock;

  const topActiveUsers: TopUserRow[] = backend.topActiveUsers.map((u) => ({
    userId: u.username,
    username: u.username,
    placesAdded: u.placesAdded,
    comments: 0,
    savedPlaces: u.placesAdded,
  }));

  return {
    ...mock,
    topActiveUsers,
    totalPlacesSaved: backend.overview.totalPlaces,
    monthlyPlacesSaved: mock.monthlyPlacesSaved,
    engagementByPage: mock.engagementByPage,
    recentActivity: mock.recentActivity,
    backendEngagement: {
      photosWithStoryPct: parseNum(
        backend.engagement.photosWithStoryPercentage,
      ),
      photosWithAudioPct: parseNum(backend.engagement.audioCaptionPercentage),
      totalStories: backend.engagement.totalStories,
      totalAudioCaptions: backend.engagement.totalAudioCaptions,
    },
    mostUsedAddPlaceFlow: mock.mostUsedAddPlaceFlow,
    referralRatePercent: mock.referralRatePercent,
  };
}

/**
 * Map backend POI accuracy to performance; rest from mock.
 */
export function mapToPerformanceMetrics(
  backend: BackendDashboardAnalytics | null,
): PerformanceMetrics {
  const mock = getMockPerformanceMetrics();
  if (!backend) return mock;

  const poi: POIAccuracy = {
    top3: parseNum(backend.poiAccuracy.topThreeAccuracy),
    top10: parseNum(backend.poiAccuracy.topTenAccuracy),
    top40: parseNum(backend.poiAccuracy.topFortyAccuracy),
    googleAutocomplete: mock.poiAccuracy.googleAutocomplete,
  };

  return {
    ...mock,
    poiAccuracy: poi,
  };
}

/**
 * Map backend geography to GeoMetrics; usersPerCountry from mock if not provided.
 */
export function mapToGeoMetrics(
  backend: BackendDashboardAnalytics | null,
): GeoMetrics {
  const mock = getMockGeoMetrics();
  if (!backend) return mock;

  const placesPerCity = backend.geography.placesByCity.map(
    ([cityCountry, count]) => {
      const lastComma = cityCountry.lastIndexOf(", ");
      const city =
        lastComma >= 0 ? cityCountry.slice(0, lastComma) : cityCountry;
      const country = lastComma >= 0 ? cityCountry.slice(lastComma + 2) : "";
      return { city, country, count };
    },
  );

  const popularPlaces = mock.popularPlaces;

  return {
    popularPlaces,
    placesPerCity,
    usersPerCountry: mock.usersPerCountry,
  };
}

/**
 * Map backend user details to PerUserMetrics. Missing fields use 0 or mock.
 */
export function mapToPerUserMetrics(
  username: string,
  backend: BackendUserDetails | null,
): PerUserMetrics | null {
  const mock = getMockPerUserMetrics(username);
  if (!backend) return mock;

  // Backend has flat placesByCountry and placesByCity (no city-per-country breakdown).
  const byCountryCorrect: PerUserMetrics["placesByCountry"] = Object.entries(
    backend.placesByCountry || {},
  ).map(([country, total]) => ({
    country,
    count: total,
    cities: [],
  }));

  const categoryBreakdown = backend.placesByCategory.map((c) => ({
    category: c.category,
    count: c.count,
    pct: parseNum(c.percentage),
  }));

  const avgPhotosPerPlace = parseNum(backend.avgPhotosPerPlace);
  const totalPhotos = backend.totalPhotos;

  return {
    userId: backend.username,
    username: backend.username,
    placesCount: backend.totalPlaces,
    blogsCount: 0,
    placesByCountry: byCountryCorrect,
    categoryBreakdown,
    avgPlacesPerDay: backend.totalPlaces > 0 ? backend.totalPlaces / 365 : 0,
    photosPerPlace: {
      min: 1,
      avg: avgPhotosPerPlace,
      max: Math.max(1, Math.round(avgPhotosPerPlace * 2)),
    },
    pctPhotosWithStory: parseNum(backend.photosWithStoryPercentage),
    poiAccuracy: { top3: 0, top10: 0, top40: 0, googleAutocomplete: 0 },
    addPlaceFlowBreakdown: [],
    pctAudioCaptions: parseNum(backend.audioCaptionPercentage),
    avgStoryLength: backend.avgStoryLength,
    friendsCount: backend.friendCount,
    commentsCount: 0,
    photoStats: {
      totalPhotos,
      avgImageSizeKb: 0,
      avgPhotosPerPlace,
    },
  };
}
