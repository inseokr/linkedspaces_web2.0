"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import type { PlaceCategory } from "../mockData";

interface CategoriesFilterRowProps {
  categories: PlaceCategory[];
  selectedCategory: PlaceCategory | "All";
  onSelect: (category: PlaceCategory | "All") => void;
  /** Max pills in the first row before "View more". Rest show when expanded. */
  maxFirstRow?: number;
}

export default function CategoriesFilterRow({
  categories,
  selectedCategory,
  onSelect,
  maxFirstRow = 9,
}: CategoriesFilterRowProps) {
  const [expanded, setExpanded] = React.useState(false);
  const firstRow = categories.slice(0, maxFirstRow);
  const rest = categories.slice(maxFirstRow);
  const hasMore = rest.length > 0;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Filter by category"
    >
      <span className="shrink-0 text-sm font-medium text-gray-600">
        Categories:
      </span>
      {/* Indent wrapper: pl-6 so wrapped lines indent; first pill has -ml-6 */}
      <div className="flex flex-wrap items-center gap-2 pl-6">
        <button
          type="button"
          onClick={() => onSelect("All")}
          className={`-ml-6 shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 ${
            selectedCategory === "All"
              ? "bg-[var(--color-main)] text-white"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
          aria-pressed={selectedCategory === "All"}
          aria-label="Show all categories"
        >
          All
        </button>
        {firstRow.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelect(cat)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 ${
                isActive
                  ? "bg-[var(--color-main)] text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
              aria-pressed={isActive}
              aria-label={`Filter by ${cat}`}
            >
              {cat}
            </button>
          );
        })}
        {hasMore && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
            aria-label="View more categories"
          >
            <Plus className="h-4 w-4" aria-hidden />
            View more
          </button>
        )}
        {hasMore && expanded && (
          <>
            {rest.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelect(cat)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 ${
                    isActive
                      ? "bg-[var(--color-main)] text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  aria-pressed={isActive}
                  aria-label={`Filter by ${cat}`}
                >
                  {cat}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
              aria-label="Close category list"
            >
              <X className="h-4 w-4" aria-hidden />
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
