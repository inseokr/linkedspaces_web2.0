"use client";

import type { PlaceCategory } from "../mockData";

export type MapCategoryFilter = "All" | PlaceCategory;

interface MapCategoryChipsProps {
  categories: PlaceCategory[];
  selected: MapCategoryFilter;
  onSelect: (filter: MapCategoryFilter) => void;
}

const CHIP_CLASS =
  "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2";

export default function MapCategoryChips({
  categories,
  selected,
  onSelect,
}: MapCategoryChipsProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Filter map by category"
    >
      <button
        type="button"
        onClick={() => onSelect("All")}
        className={`${CHIP_CLASS} ${
          selected === "All"
            ? "bg-[var(--color-main)] text-white shadow-sm"
            : "bg-white/95 text-gray-700 shadow-md border border-gray-200 hover:bg-gray-50"
        }`}
        aria-pressed={selected === "All"}
        aria-label="Show all places"
      >
        All
      </button>
      {categories.map((cat) => {
        const isActive = selected === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className={`${CHIP_CLASS} ${
              isActive
                ? "bg-[var(--color-main)] text-white shadow-sm"
                : "bg-white/95 text-gray-700 shadow-md border border-gray-200 hover:bg-gray-50"
            }`}
            aria-pressed={isActive}
            aria-label={`Filter map by ${cat}`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
