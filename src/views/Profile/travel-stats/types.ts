// src/views/Profile/travel-stats/types.ts
import type { CountryVisited, CityVisited } from "@/api/user";
import type { CountryStat } from "./section/MostVisitedSection";
import type { CountryDetail } from "./section/AllCountry";

export type TravelStatsVM = {
  totals: {
    countries: number;
    cities: number;
    places: number;
  };

  // raw
  countriesVisited: CountryVisited[];
  citiesVisited: CityVisited[];

  // derived
  topCountries: CountryVisited[];
  mostVisitedItems: CountryStat[];
  allCountriesItems: CountryDetail[];

  hasData: boolean;
};
