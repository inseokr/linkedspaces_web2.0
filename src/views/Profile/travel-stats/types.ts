// src/views/Profile/travel-stats/types.ts
import type { CountryVisited, CityVisited } from "@/api/user";

export type TravelStatsVM = {
  totals: {
    countries: number;
    cities: number;
    places: number;
  };
  topCountries: CountryVisited[];
  countriesVisited: CountryVisited[];
  citiesVisited: CityVisited[];
  hasData: boolean;
};
