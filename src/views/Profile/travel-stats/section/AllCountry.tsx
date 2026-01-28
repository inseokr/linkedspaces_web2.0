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
      <h2 className="ml-12 font-[Inter] text-[18px] font-semibold leading-[28px] tracking-[-0.5px] text-[#7C7C7C]">
        All Countries
      </h2>

      <div className="space-y-4">
        {sortedCountries.map((c) => (
          <CountryAccordionUI
            key={`${c.country}-${c.countryCode ?? ""}`}
            country={c.country}
            countryCode={c.countryCode}
            citiesCount={c.citiesCount}
            placesCount={c.placesCount}
            cities={c.cities} // IMPORTANT: pass ALL cities, do not slice here
            className="ml-12 w-[85%]"
            defaultExpanded={false} // default: show top 3 cities
          />
        ))}
      </div>
    </section>
  );
}
