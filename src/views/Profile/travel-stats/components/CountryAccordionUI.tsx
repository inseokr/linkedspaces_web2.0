"use client";

import React, { useId, useMemo, useState } from "react";
import CountryHeaderRow from "@/views/Profile/travel-stats/components/CountryHeaderRow";
import CityRow from "@/views/Profile/travel-stats/components/CityRow";

export type CityStat = { city: string; places: number };

type Props = {
  country: string;
  countryCode?: string;
  citiesCount: number;
  placesCount: number;
  cities: CityStat[];
  className?: string;

  /**
   * If true, show all cities by default.
   * If false, show only top 3 cities by default.
   */
  defaultExpanded?: boolean;
};

export default function CountryAccordionUI({
  country,
  countryCode,
  citiesCount,
  placesCount,
  cities,
  className = "",
  defaultExpanded = false,
}: Props) {
  /**
   * Collapsed means "show top 3 cities", not "show nothing".
   * Expanded means "show all cities".
   */
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const panelId = useId();

  /**
   * Sort cities by places (descending) so top 3 is meaningful.
   */
  const sortedCities = useMemo(() => {
    return [...(cities ?? [])].sort(
      (a, b) => (b.places ?? 0) - (a.places ?? 0),
    );
  }, [cities]);

  /**
   * Collapsed: top 3 cities.
   * Expanded: all cities.
   */
  const displayCities = useMemo(() => {
    return isExpanded ? sortedCities : sortedCities.slice(0, 3);
  }, [isExpanded, sortedCities]);

  const hasMoreThan3 = (sortedCities?.length ?? 0) > 3;

  return (
    <div
      className={[
        "w-full rounded-2xl border border-slate-200 bg-white shadow-sm",
        "px-6 py-5",
        className,
      ].join(" ")}
    >
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
        aria-controls={panelId}
      >
        <CountryHeaderRow
          country={country}
          countryCode={countryCode}
          citiesCount={citiesCount}
          placesCount={placesCount}
          rightSlot={
            <span
              className={[
                "text-[#8B949E] inline-block transition-transform duration-200 text-[20px]",
                isExpanded ? "rotate-180" : "rotate-0",
              ].join(" ")}
            >
              ⌄
            </span>
          }
        />
      </button>

      <div className="my-4 h-px bg-slate-200" />

      <div id={panelId}>
        {displayCities.map((c) => (
          <CityRow key={c.city} city={c.city} places={c.places} />
        ))}
      </div>
    </div>
  );
}
