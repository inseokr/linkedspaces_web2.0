"use client";

import * as React from "react";

interface CityChipsRowProps {
  /** Country name for label, e.g. "Cities in Japan:" */
  countryName: string;
  /** First item should be "All cities", then city names sorted by activity */
  cities: string[];
  selectedCity: string;
  onSelect: (city: string) => void;
}

export default function CityChipsRow({
  countryName,
  cities,
  selectedCity,
  onSelect,
}: CityChipsRowProps) {
  if (cities.length === 0) return null;

  return (
    <div
      className="flex items-center gap-2 overflow-x-auto overflow-y-hidden py-1 [scrollbar-width:thin]"
      role="group"
      aria-label={`Filter by city in ${countryName}`}
    >
      <span className="shrink-0 text-sm font-medium text-gray-600">
        Cities in {countryName}:
      </span>
      <div className="flex shrink-0 flex-nowrap items-center gap-2">
        {cities.map((city) => {
          const isActive = selectedCity === city;
          return (
            <button
              key={city}
              type="button"
              onClick={() => onSelect(city)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 ${
                isActive
                  ? "bg-[var(--color-main)] text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
              aria-pressed={isActive}
              aria-label={
                city === "All cities"
                  ? "Show all cities"
                  : `Filter by city ${city}`
              }
            >
              {city}
            </button>
          );
        })}
      </div>
    </div>
  );
}
