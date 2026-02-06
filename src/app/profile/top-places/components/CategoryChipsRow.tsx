"use client";

import * as React from "react";
import type { CategoryWithCount } from "./FiltersPopover";

interface CategoryChipsRowProps {
  categories: CategoryWithCount[];
  selectedCategory: string | "All";
  onSelect: (category: string | "All") => void;
  /** Max chips to show before "+ View more" */
  maxVisible?: number;
  /** When true, keep all chips on one line with horizontal scroll (e.g. for map overlay) */
  singleLine?: boolean;
  /** When true, hide the "Categories:" label (e.g. for map overlay) */
  hideLabel?: boolean;
  /** When false, do not show the "All" chip (e.g. for map overlay) */
  showAllButton?: boolean;
}

export default function CategoryChipsRow({
  categories,
  selectedCategory,
  onSelect,
  maxVisible = 9,
  singleLine = false,
  hideLabel = false,
  showAllButton = true,
}: CategoryChipsRowProps) {
  const [expanded, setExpanded] = React.useState(false);
  const mainCategories = categories.filter(
    (c) => c.id !== "All" && c.name !== "All",
  );
  const visibleCategories = singleLine
    ? mainCategories
    : expanded
      ? mainCategories
      : mainCategories.slice(0, maxVisible);
  const hasMore = !singleLine && mainCategories.length > maxVisible;

  const containerClass = singleLine
    ? "flex flex-nowrap items-center gap-2 overflow-x-auto overflow-y-hidden pb-1 -mb-1"
    : "flex flex-wrap items-center gap-2";
  const chipClass =
    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2";

  return (
    <div
      className={containerClass}
      role="group"
      aria-label="Filter by category"
    >
      {!hideLabel && (
        <span className="shrink-0 text-sm font-medium text-gray-600">
          Categories:
        </span>
      )}
      {showAllButton && (
        <button
          type="button"
          onClick={() => onSelect("All")}
          className={`${chipClass} ${
            selectedCategory === "All"
              ? "bg-[var(--color-main)] text-white"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
          aria-pressed={selectedCategory === "All"}
          aria-label="Show all categories"
        >
          All
        </button>
      )}
      {visibleCategories.map((cat) => {
        const isActive = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`${chipClass} ${
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
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className={`${chipClass} bg-gray-100 text-gray-700 hover:bg-gray-200`}
          aria-label={
            expanded ? "Show fewer categories" : "View more categories"
          }
        >
          {expanded ? "View less" : "+ View more"}
        </button>
      )}
    </div>
  );
}
