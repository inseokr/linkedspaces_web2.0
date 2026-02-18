/**
 * Mock data for Admin User Dashboard (Phase 1).
 * ~6 months of history, varied user behaviors. Replace with API calls in Phase 2.
 */

import type {
  OverviewMetrics,
  UserActivityMetrics,
  PerformanceMetrics,
  GeoMetrics,
  PerUserMetrics,
  ApiUsageMetrics,
} from "./types";

const MONTHS_AGO = 6;
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function genTrendDaily(): OverviewMetrics["trendDaily"] {
  const out: OverviewMetrics["trendDaily"] = [];
  const baseDau = 420;
  const baseWau = 2100;
  const baseMau = 8200;
  for (let i = MONTHS_AGO * 30; i >= 0; i--) {
    const date = daysAgo(i);
    const trend = 1 + (i / (MONTHS_AGO * 30)) * 0.4;
    const noise = 0.9 + Math.random() * 0.2;
    out.push({
      date,
      dau: Math.round(baseDau * trend * noise * (0.85 + Math.random() * 0.3)),
      wau: Math.round(baseWau * trend * noise),
      mau: Math.round(baseMau * trend * (0.95 + Math.random() * 0.1)),
    });
  }
  return out;
}

export function getMockOverviewMetrics(): OverviewMetrics {
  const trendDaily = genTrendDaily();
  const latest = trendDaily[trendDaily.length - 1];
  const prevPeriod = trendDaily[Math.max(0, trendDaily.length - 31)];
  const cs = prevPeriod?.mau ?? 7500;
  const ce = latest.mau;
  const cn = 380;
  const retentionRate = cs > 0 ? ((ce - cn) / cs) * 100 : 0;
  const stickiness = latest.mau > 0 ? latest.dau / latest.mau : 0;

  return {
    dau: latest.dau,
    wau: latest.wau,
    mau: latest.mau,
    activeUsersCurrentPeriod: latest.wau,
    newSignupsCurrent: 412,
    newSignupsPrevious: 358,
    userGrowthRatePercent: 358 ? ((412 - 358) / 358) * 100 : 0,
    retentionRatePercent: Math.round(retentionRate * 10) / 10,
    stickinessRatio: Math.round(stickiness * 100) / 100,
    churnRatePercent: 2.4,
    trendDaily,
  };
}

const MOCK_TOP_USERS: UserActivityMetrics["topActiveUsers"] = [
  {
    userId: "u1",
    username: "travel_jane",
    placesAdded: 1240,
    comments: 89,
    savedPlaces: 1240,
  },
  {
    userId: "u2",
    username: "wanderer_alex",
    placesAdded: 980,
    comments: 120,
    savedPlaces: 980,
  },
  {
    userId: "u3",
    username: "foodie_sam",
    placesAdded: 756,
    comments: 45,
    savedPlaces: 756,
  },
  {
    userId: "u4",
    username: "urban_explorer",
    placesAdded: 612,
    comments: 67,
    savedPlaces: 612,
  },
  {
    userId: "u5",
    username: "coffee_lover",
    placesAdded: 534,
    comments: 32,
    savedPlaces: 534,
  },
  {
    userId: "u6",
    username: "weekend_trips",
    placesAdded: 421,
    comments: 28,
    savedPlaces: 421,
  },
  {
    userId: "u7",
    username: "hidden_gems",
    placesAdded: 398,
    comments: 55,
    savedPlaces: 398,
  },
  {
    userId: "u8",
    username: "sunset_chaser",
    placesAdded: 312,
    comments: 19,
    savedPlaces: 312,
  },
  {
    userId: "u9",
    username: "city_hopper",
    placesAdded: 287,
    comments: 41,
    savedPlaces: 287,
  },
  {
    userId: "u10",
    username: "backpacker_lee",
    placesAdded: 256,
    comments: 22,
    savedPlaces: 256,
  },
];

const MOCK_RECENT_ACTIVITY: UserActivityMetrics["recentActivity"] = [
  {
    id: "a1",
    userId: "u1",
    username: "travel_jane",
    type: "place_saved",
    placeName: "Blue Bottle Coffee",
    caption: "Best oat latte here.",
    hasVoiceMemo: true,
    vibe: "Cozy",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "a2",
    userId: "u2",
    username: "wanderer_alex",
    type: "place_saved",
    placeName: "Central Park Bow Bridge",
    caption: "Sunset spot.",
    hasVoiceMemo: false,
    vibe: "Scenic",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "a3",
    userId: "u3",
    username: "foodie_sam",
    type: "comment",
    placeName: "Joe's Pizza",
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
  },
  {
    id: "a4",
    userId: "u4",
    username: "urban_explorer",
    type: "place_saved",
    placeName: "The High Line",
    caption: "Great walk with city views.",
    hasVoiceMemo: true,
    vibe: "Urban",
    timestamp: new Date(Date.now() - 58 * 60 * 1000).toISOString(),
  },
  {
    id: "a5",
    userId: "u1",
    username: "travel_jane",
    type: "blog_created",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a6",
    userId: "u5",
    username: "coffee_lover",
    type: "place_saved",
    placeName: "Devoción",
    caption: "",
    hasVoiceMemo: false,
    vibe: "Work",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_ENGAGEMENT_BY_PAGE: UserActivityMetrics["engagementByPage"] = [
  { page: "My Places", visits: 45200, uniqueUsers: 8200 },
  { page: "Top Places", visits: 38100, uniqueUsers: 7100 },
  { page: "Profile / Map", visits: 28900, uniqueUsers: 6500 },
  { page: "Recap Blog", visits: 19500, uniqueUsers: 4200 },
  { page: "Highlights", visits: 8200, uniqueUsers: 2100 },
];

const MOCK_ADD_PLACE_FLOW: UserActivityMetrics["mostUsedAddPlaceFlow"] = [
  { step: "photo", label: "Photo selection", count: 9200, pct: 98 },
  { step: "story", label: "Story", count: 6100, pct: 65 },
  { step: "place_name", label: "Click place name", count: 8800, pct: 94 },
  { step: "vibe", label: "Capture the vibe", count: 4200, pct: 45 },
];

export function getMockUserActivityMetrics(): UserActivityMetrics {
  return {
    topActiveUsers: MOCK_TOP_USERS,
    recentActivity: MOCK_RECENT_ACTIVITY,
    totalPlacesSaved: 124_500,
    monthlyPlacesSaved: 18_200,
    totalBlogs: 3_840,
    engagementByPage: MOCK_ENGAGEMENT_BY_PAGE,
    backendEngagement: {
      photosWithStoryPct: 62,
      photosWithAudioPct: 18,
      totalStories: 48_200,
      totalAudioCaptions: 12_400,
    },
    mostUsedAddPlaceFlow: MOCK_ADD_PLACE_FLOW,
    referralRatePercent: 12.5,
  };
}

export function getMockPerformanceMetrics(): PerformanceMetrics {
  return {
    poiAccuracy: {
      top3: 78.2,
      top10: 91.5,
      top40: 97.1,
      googleAutocomplete: 88.0,
    },
    crashRatePercent: 0.12,
    loadTimeAvgMs: 1240,
    apiFailureRatePercent: 0.35,
    cacUsd: 4.2,
  };
}

const MOCK_POPULAR_PLACES: GeoMetrics["popularPlaces"] = [
  {
    placeName: "Central Park",
    city: "New York",
    country: "United States",
    visits: 3420,
  },
  {
    placeName: "Shibuya Crossing",
    city: "Tokyo",
    country: "Japan",
    visits: 2890,
  },
  { placeName: "Eiffel Tower", city: "Paris", country: "France", visits: 2650 },
  {
    placeName: "Café de Flore",
    city: "Paris",
    country: "France",
    visits: 1820,
  },
  {
    placeName: "Tsukiji Outer Market",
    city: "Tokyo",
    country: "Japan",
    visits: 1650,
  },
  {
    placeName: "Brooklyn Bridge",
    city: "New York",
    country: "United States",
    visits: 1520,
  },
  { placeName: "Senso-ji", city: "Tokyo", country: "Japan", visits: 1380 },
  {
    placeName: "Louvre Museum",
    city: "Paris",
    country: "France",
    visits: 1210,
  },
];

const MOCK_PLACES_PER_CITY: GeoMetrics["placesPerCity"] = [
  { city: "New York", country: "United States", count: 18500 },
  { city: "Tokyo", country: "Japan", count: 14200 },
  { city: "Paris", country: "France", count: 11800 },
  { city: "London", country: "United Kingdom", count: 9200 },
  { city: "Seoul", country: "South Korea", count: 8700 },
  { city: "Los Angeles", country: "United States", count: 7600 },
  { city: "Berlin", country: "Germany", count: 5400 },
  { city: "Singapore", country: "Singapore", count: 4800 },
];

const MOCK_USERS_PER_COUNTRY: GeoMetrics["usersPerCountry"] = [
  { country: "United States", countryCode: "US", count: 3200 },
  { country: "South Korea", countryCode: "KR", count: 1800 },
  { country: "Japan", countryCode: "JP", count: 1200 },
  { country: "United Kingdom", countryCode: "GB", count: 950 },
  { country: "France", countryCode: "FR", count: 820 },
  { country: "Germany", countryCode: "DE", count: 610 },
  { country: "Canada", countryCode: "CA", count: 480 },
  { country: "Australia", countryCode: "AU", count: 390 },
];

export function getMockGeoMetrics(): GeoMetrics {
  return {
    popularPlaces: MOCK_POPULAR_PLACES,
    placesPerCity: MOCK_PLACES_PER_CITY,
    usersPerCountry: MOCK_USERS_PER_COUNTRY,
  };
}

export function getMockPerUserMetrics(userId: string): PerUserMetrics | null {
  const users: Record<string, Omit<PerUserMetrics, "userId">> = {
    u1: {
      username: "travel_jane",
      placesCount: 1240,
      blogsCount: 24,
      placesByCountry: [
        {
          country: "United States",
          cities: [
            { city: "New York", count: 320 },
            { city: "Los Angeles", count: 180 },
          ],
        },
        {
          country: "Japan",
          cities: [
            { city: "Tokyo", count: 410 },
            { city: "Kyoto", count: 120 },
          ],
        },
      ],
      categoryBreakdown: [
        { category: "Cafe", count: 380, pct: 30.6 },
        { category: "Restaurant", count: 310, pct: 25.0 },
        { category: "Park", count: 186, pct: 15.0 },
        { category: "Bar", count: 124, pct: 10.0 },
        { category: "Place", count: 240, pct: 19.4 },
      ],
      avgPlacesPerDay: 2.8,
      photosPerPlace: { min: 1, avg: 4.2, max: 24 },
      pctPhotosWithStory: 62,
      poiAccuracy: { top3: 82, top10: 94, top40: 98, googleAutocomplete: 90 },
      addPlaceFlowBreakdown: MOCK_ADD_PLACE_FLOW,
      pctAudioCaptions: 18,
      avgStoryLength: 42,
      friendsCount: 85,
      commentsCount: 89,
      photoStats: {
        totalPhotos: 5208,
        avgImageSizeKb: 890,
        avgPhotosPerPlace: 4.2,
      },
    },
    u2: {
      username: "wanderer_alex",
      placesCount: 980,
      blogsCount: 12,
      placesByCountry: [
        {
          country: "France",
          cities: [
            { city: "Paris", count: 280 },
            { city: "Lyon", count: 45 },
          ],
        },
        { country: "United Kingdom", cities: [{ city: "London", count: 190 }] },
      ],
      categoryBreakdown: [
        { category: "Restaurant", count: 294, pct: 30 },
        { category: "Cafe", count: 196, pct: 20 },
        { category: "Park", count: 147, pct: 15 },
        { category: "Place", count: 343, pct: 35 },
      ],
      avgPlacesPerDay: 1.9,
      photosPerPlace: { min: 1, avg: 3.8, max: 18 },
      pctPhotosWithStory: 48,
      poiAccuracy: { top3: 75, top10: 90, top40: 96, googleAutocomplete: 85 },
      addPlaceFlowBreakdown: MOCK_ADD_PLACE_FLOW,
      pctAudioCaptions: 8,
      avgStoryLength: 28,
      friendsCount: 120,
      commentsCount: 120,
      photoStats: {
        totalPhotos: 3724,
        avgImageSizeKb: 920,
        avgPhotosPerPlace: 3.8,
      },
    },
  };
  const u = users[userId];
  if (!u) return null;
  return { userId, ...u };
}

export function getMockApiUsageMetrics(): ApiUsageMetrics {
  return {
    totalByService: {
      google: 2_450_000,
      openai: 890_000,
      unsplash: 45_000,
      osmCityName: 1_120_000,
      osmAddress: 980_000,
    },
    costPerUserAvgUsd: 1.85,
    perUserBreakdown: [
      {
        userId: "u1",
        username: "travel_jane",
        placesSaved: 1240,
        friends: 85,
        highlights: 12,
        recapBlogs: 24,
        itineraries: 8,
      },
      {
        userId: "u2",
        username: "wanderer_alex",
        placesSaved: 980,
        friends: 120,
        highlights: 6,
        recapBlogs: 12,
        itineraries: 4,
      },
      {
        userId: "u3",
        username: "foodie_sam",
        placesSaved: 756,
        friends: 45,
        highlights: 4,
        recapBlogs: 6,
        itineraries: 2,
      },
      {
        userId: "u4",
        username: "urban_explorer",
        placesSaved: 612,
        friends: 68,
        highlights: 8,
        recapBlogs: 10,
        itineraries: 5,
      },
      {
        userId: "u5",
        username: "coffee_lover",
        placesSaved: 534,
        friends: 32,
        highlights: 3,
        recapBlogs: 2,
        itineraries: 0,
      },
    ],
  };
}
