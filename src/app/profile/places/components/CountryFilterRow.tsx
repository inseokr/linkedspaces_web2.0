"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import type { CountryWithCount } from "../mockData";

interface CountryFilterRowProps {
  countries: CountryWithCount[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Max pills in the first row before "View More". Rest show when expanded. */
  maxFirstRow?: number;
}

export default function CountryFilterRow({
  countries,
  selectedId,
  onSelect,
  maxFirstRow = 5,
}: CountryFilterRowProps) {
  const [expanded, setExpanded] = React.useState(false);
  const allExceptAll = countries.filter((c) => c.id !== "all");
  const firstRow = allExceptAll.slice(0, maxFirstRow);
  const rest = allExceptAll.slice(maxFirstRow);
  const hasMore = rest.length > 0;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Filter by country"
    >
      {/* Indent wrapper: pl-6 so wrapped lines indent; first pill has -ml-6 so first row aligns left */}
      <div className="flex flex-wrap items-center gap-2 pl-6">
        {countries.find((c) => c.id === "all") && (
          <button
            type="button"
            onClick={() => onSelect("all")}
            className={`-ml-6 shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 ${
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
        {firstRow.map((c) => {
          const isActive = selectedId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 ${
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
        {hasMore && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
            aria-label="View more countries"
          >
            <Plus className="h-4 w-4" aria-hidden />
            View More
          </button>
        )}
        {hasMore && expanded && (
          <>
            {rest.map((c) => {
              const isActive = selectedId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelect(c.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 ${
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
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
              aria-label="Close country list"
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
