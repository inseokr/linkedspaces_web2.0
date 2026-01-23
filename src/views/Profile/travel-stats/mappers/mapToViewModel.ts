// mappers/mapUserToTravelStatsVM.ts

export function mapUserToTravelStatsVM(user: any): TravelStatsVM {
  const countriesVisited = user?.countriesVisited ?? [];
  const citiesVisited = user?.citiesVisited ?? [];

  // 1. Sort countries by total places (Descending)
  const sortedCountries = [...countriesVisited].sort(
    (a: any, b: any) => (b.totalPlaces ?? 0) - (a.totalPlaces ?? 0),
  );

  // 2. Map and Group cities by countryCode
  const processedCountries = sortedCountries.map((country: any) => {
    // Filter cities that belong to this country
    const citiesInCountry = citiesVisited
      .filter((city: any) => city.countryCode === country.countryCode)
      // Sort cities by totalPlaces in descending order
      .sort((a: any, b: any) => (b.totalPlaces ?? 0) - (a.totalPlaces ?? 0));

    return {
      ...country,
      cities: citiesInCountry, // Injects grouped & sorted cities
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
  };
}
