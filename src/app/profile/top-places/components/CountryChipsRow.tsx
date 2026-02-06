"use client";

import * as React from "react";
import type { CountryWithCount } from "../mockData";

interface CountryChipsRowProps {
  countries: CountryWithCount[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Max chips to show before "Others" (excluding All). Extra chips hidden until expanded. */
  maxVisible?: number;
}

export default function CountryChipsRow({
  countries,
  selectedId,
  onSelect,
  maxVisible = 4,
}: CountryChipsRowProps) {
  const [expanded, setExpanded] = React.useState(false);
  const allExceptAll = countries.filter((c) => c.id !== "all");
  const visibleCountries = expanded
    ? allExceptAll
    : allExceptAll.slice(0, maxVisible);
  const hasMore = allExceptAll.length > maxVisible;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Filter by country"
    >
      {countries.find((c) => c.id === "all") && (
        <button
          type="button"
          onClick={() => onSelect("all")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 ${
            selectedId === "all" || selectedId === null
              ? "bg-[var(--color-main)] text-white"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
          aria-pressed={selectedId === "all" || selectedId === null}
          aria-label="Show all countries"
        >
          All
        </button>
      )}
      {visibleCountries.map((c) => {
        const isActive = selectedId === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 ${
              isActive
                ? "bg-[var(--color-main)] text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            aria-pressed={isActive}
            aria-label={`Filter by ${c.name}, ${c.count} places`}
          >
            {c.name} ({c.count})
          </button>
        );
      })}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          aria-label={expanded ? "Show fewer countries" : "View more countries"}
        >
          {expanded ? "View less" : "Others"}
        </button>
      )}
    </div>
  );
}
