/**
 * Types for the Admin User Dashboard.
 * Designed so mock data can be swapped for real API responses in Phase 2.
 */

export type DateRange = { start: string; end: string };

// --- Overview ---
export type OverviewMetrics = {
  dau: number;
  wau: number;
  mau: number;
  activeUsersCurrentPeriod: number;
  newSignupsCurrent: number;
  newSignupsPrevious: number;
  userGrowthRatePercent: number;
  retentionRatePercent: number;
  stickinessRatio: number;
  churnRatePercent: number;
  trendDaily: { date: string; dau: number; wau: number; mau: number }[];
};

// --- User Activity ---
export type TopUserRow = {
  userId: string;
  username: string;
  placesAdded: number;
  comments: number;
  savedPlaces: number;
};

export type RecentActivityItem = {
  id: string;
  userId: string;
  username: string;
  type: "place_saved" | "comment" | "blog_created";
  placeName?: string;
  caption?: string;
  hasVoiceMemo: boolean;
  vibe?: string;
  timestamp: string;
};

export type EngagementByPage = {
  page: string;
  visits: number;
  uniqueUsers: number;
};

export type AddPlaceFlowStep = "photo" | "story" | "place_name" | "vibe";
export type AddPlaceFlowStats = {
  step: AddPlaceFlowStep;
  label: string;
  count: number;
  pct: number;
}[];

export type UserActivityMetrics = {
  topActiveUsers: TopUserRow[];
  recentActivity: RecentActivityItem[];
  totalPlacesSaved: number;
  monthlyPlacesSaved: number;
  totalBlogs: number;
  engagementByPage: EngagementByPage[];
  /**
   * Aggregate engagement numbers that come directly from the backend analytics
   * endpoint (when available). This is separate from the mock "engagementByPage"
   * chart, which requires page-analytics instrumentation.
   */
  backendEngagement?: {
    photosWithStoryPct: number;
    photosWithAudioPct: number;
    totalStories: number;
    totalAudioCaptions: number;
  };
  mostUsedAddPlaceFlow: AddPlaceFlowStats;
  referralRatePercent: number;
};

// --- Performance ---
export type POIAccuracy = {
  top3: number;
  top10: number;
  top40: number;
  googleAutocomplete: number;
};

export type PerformanceMetrics = {
  poiAccuracy: POIAccuracy;
  crashRatePercent: number;
  loadTimeAvgMs: number;
  apiFailureRatePercent: number;
  cacUsd: number;
};

// --- Geographical ---
export type PlaceCountByCity = { city: string; country: string; count: number };
export type UsersByCountry = {
  country: string;
  countryCode: string;
  count: number;
};
export type GeoMetrics = {
  popularPlaces: {
    placeName: string;
    city: string;
    country: string;
    visits: number;
  }[];
  placesPerCity: PlaceCountByCity[];
  usersPerCountry: UsersByCountry[];
};

// --- Per-user detail ---
export type PerUserMetrics = {
  userId: string;
  username: string;
  placesCount: number;
  blogsCount: number;
  placesByCountry: {
    country: string;
    count?: number;
    cities: { city: string; count: number }[];
  }[];
  categoryBreakdown: { category: string; count: number; pct: number }[];
  avgPlacesPerDay: number;
  photosPerPlace: { min: number; avg: number; max: number };
  pctPhotosWithStory: number;
  poiAccuracy: POIAccuracy;
  addPlaceFlowBreakdown: AddPlaceFlowStats;
  pctAudioCaptions: number;
  avgStoryLength: number;
  friendsCount: number;
  commentsCount: number;
  photoStats: {
    totalPhotos: number;
    avgImageSizeKb: number;
    avgPhotosPerPlace: number;
  };
};

// --- API Usage ---
export type ApiServiceCalls = {
  google: number;
  openai: number;
  unsplash: number;
  osmCityName: number;
  osmAddress: number;
};

export type ApiUsageMetrics = {
  totalByService: ApiServiceCalls;
  costPerUserAvgUsd: number;
  perUserBreakdown: {
    userId: string;
    username: string;
    placesSaved: number;
    friends: number;
    highlights: number;
    recapBlogs: number;
    itineraries: number;
  }[];
};

// --- Dashboard state (filters) ---
export type DashboardFilters = {
  dateRange: DateRange;
  segment?: string;
  country?: string;
  city?: string;
};
