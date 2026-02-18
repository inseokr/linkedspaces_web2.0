/**
 * Travel Stats — computed shape for the identity-driven stats page.
 * Used by buildTravelStats() and the Travel Stats UI.
 * File: src/views/Profile/travel-stats/statsTypes.ts
 */

export type TimeScopeKey =
  | "lifetime"
  | "thisYear"
  | "last6Months"
  | "2025"
  | "2024"
  | "2023";

export type HeadlineStats = {
  totalPlacesSaved: number;
  daysExplored: number;
  citiesVisitedCount: number;
  countriesVisitedCount: number;
  recapBlogsCreatedCount: number;
  estimatedDistanceMiles: number;
};

export type MostVisitedPlace = {
  placeId: string;
  name: string;
  city: string;
  country: string;
  photoUrl: string | null;
  visitsCount: number;
};

export type FirstOrRecentPlace = {
  placeId: string;
  name: string;
  date: string;
  photoUrl: string | null;
};

export type LongestTrip = {
  recapBlogId: string;
  title: string;
  dateRange: string;
  days: number;
  placesCount: number;
  coverPhotoUrl: string | null;
};

export type MostActiveMonth = {
  monthLabel: string;
  placesSavedCount: number;
  recapBlogsCount: number;
};

export type ReturningPlace = {
  placeId: string;
  name: string;
  visitsCount: number;
  photoUrl: string | null;
};

export type MostAddedCategory = {
  category: string;
  count: number;
};

export type PeopleAndPatterns = {
  coExploredCount: number;
  soloVsGroupRatio: number; // 0–1, 1 = all solo
};

/** One city with its place count (for All Countries / cities per country list). */
export type CountryCityStat = { city: string; places: number };

/** One country with its cities and counts (for the list under Your Story). */
export type CountryWithCities = {
  country: string;
  countryCode?: string;
  citiesCount: number;
  placesCount: number;
  cities: CountryCityStat[];
};

export type ScopeStats = {
  headlineStats: HeadlineStats;
  /** For map: ISO2 codes and counts */
  geography: {
    countryCodes: string[];
    countryStats: { code: string; value: number }[];
  };
  /** Countries with cities and place counts (for All Countries section). */
  countriesWithCities: CountryWithCities[];
  highlights: {
    mostVisitedPlace: MostVisitedPlace | null;
    firstSavedPlace: FirstOrRecentPlace | null;
    mostRecentPlace: FirstOrRecentPlace | null;
    longestTrip: LongestTrip | null;
    mostActiveMonth: MostActiveMonth | null;
    returningPlace: ReturningPlace | null;
    mostAddedCategory: MostAddedCategory | null;
  };
  peopleAndPatterns: PeopleAndPatterns | null;
};

export type TravelStatsResult = {
  timeScopes: {
    lifetime: ScopeStats;
    thisYear: ScopeStats;
    last6Months: ScopeStats;
    "2025": ScopeStats;
    "2024": ScopeStats;
    "2023": ScopeStats;
  };
};
