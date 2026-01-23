"use client";

import { useTravelStatsVM } from "@/views/Profile/travel-stats/hooks/useTravelStatsVM";
import OverallJourney from "./components/OverallJourney";
import MostVisitedSection from "./section/MostVisitedSection";
import AllCountriesSection from "./section/AllCountry";
import MapboxMap from "./components/MapBoxMap";
import { getCountryName } from "@/utils/countryName";

export default function ProfileStatsPageView() {
  const { vm } = useTravelStatsVM();

  // Handle empty state if no travel data exists
  if (!vm.hasData) {
    return <div>No travel history found.</div>;
  }

  // 1. Map VM data to MostVisitedSection items

  const mostVisitedItems = vm.topCountries.map((c: any, index: number) => {
    const code = c.countryCode?.toUpperCase();

    return {
      country: getCountryName(code),
      countryCode: code,
      visits: c.totalPlaces ?? 0,
      highlight: index === 0,
      subtitle: index === 0 ? "Your top destination" : undefined,
    };
  });

  // 2. All Countries Section

  const allCountriesDetail = vm.allCountries.map((c: any) => {
    const code = c.countryCode?.toUpperCase();

    return {
      country: getCountryName(code),
      countryCode: code,
      citiesCount: c.cities?.length ?? 0, // This will now show the correct count (e.g., 12 cities)
      placesCount: c.totalPlaces ?? 0,
      // Cities are already sorted by 'totalPlaces' in the mapper
      cities: c.cities.map((city: any) => ({
        city: city.city, // "Fremont", "Seoul", etc.
        places: city.totalPlaces ?? 0,
      })),
    };
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header Section: Title and Insights */}
      <div className="flex items-start justify-start gap-6">
        <div className="space-y-1">
          <h1 className="ml-6 font-bold text-[24px] text-black">
            Your Travel Journey
          </h1>
          <p className="ml-8 text-[14px] text-[#8B949E]">
            Building memories around the world
          </p>
        </div>

        <div className="pt-1 ml-15">
          {/* Note: deltaPlaces value can be linked to API later */}
          <OverallJourney deltaPlaces={12} />
        </div>
      </div>

      {/* Top Destinations Section */}
      <MostVisitedSection items={mostVisitedItems} />

      {/* MapBox */}
      <div className="ml-12 mr-12 w-[90%] h-[400px] rounded-3xl overflow-hidden border border-black/10">
        <MapboxMap highlightIso2={["US", "GB", "FR"]} worldview="KR" />
      </div>

      <AllCountriesSection items={allCountriesDetail} />
    </div>
  );
}
