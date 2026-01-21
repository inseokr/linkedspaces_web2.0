import type { TravelStatsVM } from "../types";

export function mapUserToTravelStatsVM(user: any): TravelStatsVM {
  const countriesVisited = user?.countriesVisited ?? [];
  const citiesVisited = user?.citiesVisited ?? [];

  const totals = {
    countries: countriesVisited.length,
    cities: citiesVisited.length,
    // Same rule as mobile Snapshot: sum of country.totalPlaces
    places: countriesVisited.reduce(
      (sum: number, c: any) => sum + (c.totalPlaces ?? 0),
      0,
    ),
  };

  const topCountries = [...countriesVisited]
    .sort((a: any, b: any) => (b.totalPlaces ?? 0) - (a.totalPlaces ?? 0))
    .slice(0, 3);

  return {
    totals,
    topCountries,
    countriesVisited,
    citiesVisited,
    hasData: totals.countries > 0 || totals.cities > 0,
  };
}
