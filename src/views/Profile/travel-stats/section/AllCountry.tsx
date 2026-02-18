"use client";

import React, { useMemo } from "react";
import CountryAccordionUI, {
  CityStat,
} from "@/views/Profile/travel-stats/components/CountryAccordionUI";

export type CountryDetail = {
  country: string;
  countryCode?: string;
  citiesCount: number;
  placesCount: number;
  cities: CityStat[];
};

type Props = {
  items: CountryDetail[];
  className?: string;
};

export default function AllCountriesSection({ items, className = "" }: Props) {
  /**
   * Sort countries by total places visited (descending).
   */
  const sortedCountries = useMemo(() => {
    return [...items].sort((a, b) => b.placesCount - a.placesCount);
  }, [items]);

  return (
    <section className={`space-y-4 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900">All Countries</h2>

      <div className="space-y-4 w-full">
        {sortedCountries.map((c) => (
          <CountryAccordionUI
            key={`${c.country}-${c.countryCode ?? ""}`}
            country={c.country}
            countryCode={c.countryCode}
            citiesCount={c.citiesCount}
            placesCount={c.placesCount}
            cities={c.cities} // IMPORTANT: pass ALL cities, do not slice here
            className="w-full"
            defaultExpanded={false} // default: show top 3 cities
          />
        ))}
      </div>
    </section>
  );
}
