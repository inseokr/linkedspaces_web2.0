// mappers/mapUserToTravelStatsVM.ts
import { TravelStatsVM } from "../types";

// mappers/mapUserToTravelStatsVM.ts

export function mapUserToTravelStatsVM(user: any): TravelStatsVM {
  const countriesVisited = user?.countriesVisited ?? [];
  const citiesVisited = user?.citiesVisited ?? [];

  const sortedCountries = [...countriesVisited].sort(
    (a: any, b: any) => (b.totalPlaces ?? 0) - (a.totalPlaces ?? 0),
  );

  const processedCountries = sortedCountries.map((country: any) => {
    const citiesInCountry = citiesVisited
      .filter((city: any) => city.countryCode === country.countryCode)
      .sort((a: any, b: any) => (b.totalPlaces ?? 0) - (a.totalPlaces ?? 0));

    return {
      ...country,
      cities: citiesInCountry,
    };
  });

  return {
    totals: {
      countries: processedCountries.length,
      cities: citiesVisited.length,
      places: processedCountries.reduce(
        (sum: number, c: any) => sum + (c.totalPlaces ?? 0),
        0,
      ),
    },
    topCountries: processedCountries.slice(0, 3),
    allCountries: processedCountries,
    hasData: processedCountries.length > 0,

    countriesVisited: processedCountries, // 또는 원본 sortedCountries
    citiesVisited: citiesVisited,
    allCountriesItems: processedCountries,
    mostVisitedItems: processedCountries.slice(0, 5), // 예시로 상위 5개 설정
  };
}
