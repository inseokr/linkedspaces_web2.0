"use client";

import { useMemo, useEffect, useState } from "react";
import { useTravelStatsVM } from "@/views/Profile/travel-stats/hooks/useTravelStatsVM";
import OverallJourney from "./components/OverallJourney";
import MostVisitedSection from "./section/MostVisitedSection";
import AllCountriesSection from "./section/AllCountry";
import MapboxMap, { CountryStat } from "./components/MapBoxMap";
import { getCountryName } from "@/utils/countryName";

type MostVisitedItem = {
  country: string;
  countryCode?: string;
  visits: number;
  highlight: boolean;
  subtitle?: string;
};

export default function ProfileStatsPageView() {
  const { vm } = useTravelStatsVM();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const countryStats = useMemo<CountryStat[]>(() => {
    const all = vm?.allCountries ?? [];
    const stats = all
      .map((c: any) => ({
        code: (c.countryCode?.toUpperCase()?.trim() || "") as string,
        value: (c.totalPlaces ?? 0) as number,
      }))
      .filter((item: any): item is CountryStat => !!item.code);

    console.log("Mapped Country Stats:", stats);

    return stats;
  }, [vm]);

  const allVisitedIso2 = useMemo(() => {
    return countryStats.map((s) => s.code);
  }, [countryStats]);

  const mostVisitedItems: MostVisitedItem[] = useMemo(() => {
    const topCountries = vm?.topCountries ?? [];

    return topCountries.map((c: any, index: number) => {
      const code = c.countryCode?.toUpperCase()?.trim();
      return {
        country: getCountryName(code),
        countryCode: code,
        visits: c.totalPlaces ?? 0,
        highlight: index === 0,
        subtitle: index === 0 ? "Your top destination" : undefined,
      };
    });
  }, [vm]);

  const allCountriesDetail = useMemo(() => {
    const all = vm?.allCountries ?? [];
    return all.map((c: any) => {
      const code = c.countryCode?.toUpperCase()?.trim();
      return {
        country: getCountryName(code),
        countryCode: code,
        citiesCount: c.cities?.length ?? 0,
        placesCount: c.totalPlaces ?? 0,
        cities: (c.cities ?? []).map((city: any) => ({
          city: city.city,
          places: city.totalPlaces ?? 0,
        })),
      };
    });
  }, [vm]);

  if (!isMounted) {
    return null;
  }

  if (!vm?.hasData) {
    return <div>No travel history found.</div>;
  }

  return (
    <div className="p-6 space-y-6">
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
          <OverallJourney deltaPlaces={12} />
        </div>
      </div>

      <MostVisitedSection items={mostVisitedItems} />

      <div className="ml-12 mr-12 w-[90%] h-[400px] rounded-3xl overflow-hidden border border-black/10">
        <MapboxMap highlightIso2={allVisitedIso2} countryStats={countryStats} />
      </div>

      <AllCountriesSection items={allCountriesDetail} />
    </div>
  );
}
