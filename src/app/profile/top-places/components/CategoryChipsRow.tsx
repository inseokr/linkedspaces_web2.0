"use client";

import * as React from "react";
import type { CategoryWithCount } from "./FiltersPopover";

interface CategoryChipsRowProps {
  categories: CategoryWithCount[];
  selectedCategory: string | "All";
  onSelect: (category: string | "All") => void;
  /** Max chips to show before "+ View more" */
  maxVisible?: number;
}

export default function CategoryChipsRow({
  categories,
  selectedCategory,
  onSelect,
  maxVisible = 9,
}: CategoryChipsRowProps) {
  const [expanded, setExpanded] = React.useState(false);
  const mainCategories = categories.filter((c) => c.id !== "All" && c.name !== "All");
  const visibleCategories = expanded
    ? mainCategories
    : mainCategories.slice(0, maxVisible);
  const hasMore = mainCategories.length > maxVisible;
  const othersCategory = mainCategories.find((c) => c.id === "Others" || c.name === "Others");
  const restWithoutOthers = mainCategories.filter((c) => c.id !== "Others" && c.name !== "Others");
  const visibleRest = expanded ? restWithoutOthers : restWithoutOthers.slice(0, maxVisible);
  const hasMoreRest = restWithoutOthers.length > maxVisible;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Filter by category"
    >
      <span className="text-sm font-medium text-gray-600">Categories:</span>
      <button
        type="button"
        onClick={() => onSelect("All")}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 ${
          selectedCategory === "All"
            ? "bg-[var(--color-main)] text-white"
            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
        }`}
        aria-pressed={selectedCategory === "All"}
        aria-label="Show all categories"
      >
        All
      </button>
      {visibleRest.map((cat) => {
        const isActive = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 ${
              isActive
                ? "bg-[var(--color-main)] text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            aria-pressed={isActive}
            aria-label={`Filter by ${cat.name}`}
          >
            {cat.name}
            {cat.count != null ? ` (${cat.count})` : ""}
          </button>
        );
      })}
      {hasMoreRest && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          aria-label={expanded ? "Show fewer categories" : "View more categories"}
        >
          {expanded ? "View less" : "+ View more"}
        </button>
      )}
      {othersCategory && (
        <button
          type="button"
          onClick={() => onSelect(othersCategory.id)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 ${
            selectedCategory === othersCategory.id
              ? "bg-[var(--color-main)] text-white"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
          aria-pressed={selectedCategory === othersCategory.id}
          aria-label="Filter by Others"
        >
          Others
          {othersCategory.count != null ? ` (${othersCategory.count})` : ""}
        </button>
      )}
    </div>
  );
}
