"use client";

import * as React from "react";
import { useRef, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { CountryWithCount, SortOption } from "../mockData";
import { SORT_OPTIONS } from "../mockData";

export interface FiltersState {
  countryIds: Set<string>;
  categoryIds: Set<string>;
  sort: SortOption;
}

export interface CategoryWithCount {
  id: string;
  name: string;
  count?: number;
}

interface FiltersPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FiltersState;
  onApply: (filters: FiltersState) => void;
  onReset: () => void;
  countries: CountryWithCount[];
  categories: CategoryWithCount[];
}

export function getDefaultFilters(): FiltersState {
  return {
    countryIds: new Set(),
    categoryIds: new Set<string>(["All"]),
    sort: "rank",
  };
}

function filtersKey(f: FiltersState): string {
  return JSON.stringify({
    countryIds: [...f.countryIds].sort(),
    categoryIds: [...f.categoryIds].sort(),
    sort: f.sort,
  });
}

interface FiltersFormContentProps {
  initialFilters: FiltersState;
  onApply: (filters: FiltersState) => void;
  onReset: () => void;
  onOpenChange: (open: boolean) => void;
  countries: CountryWithCount[];
  categories: CategoryWithCount[];
}

function FiltersFormContent({
  initialFilters,
  onApply,
  onReset,
  onOpenChange,
  countries,
  categories,
}: FiltersFormContentProps) {
  const [localFilters, setLocalFilters] =
    React.useState<FiltersState>(initialFilters);

  const toggleCountry = (id: string) => {
    setLocalFilters((prev) => {
      const next = new Set(prev.countryIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, countryIds: next };
    });
  };

  const toggleCategory = (cat: string) => {
    setLocalFilters((prev) => {
      const next = new Set(prev.categoryIds);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return { ...prev, categoryIds: next };
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalFilters(getDefaultFilters());
    onReset();
    onOpenChange(false);
  };

  const countriesWithoutAll = countries.filter((c) => c.id !== "all");
  const categoriesWithoutAll = categories.filter(
    (c) => c.id !== "All" && c.name !== "All",
  );

  return (
    <>
      <div className="max-h-[70vh] overflow-y-auto px-4">
        <div className="mb-4">
          <div className="mb-2 text-sm font-semibold text-gray-900">
            Country
          </div>
          <ul className="space-y-1">
            {countriesWithoutAll.map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-gray-700 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={localFilters.countryIds.has(c.id)}
                    onChange={() => toggleCountry(c.id)}
                    className="h-4 w-4 rounded border-gray-300 text-[var(--color-main)] focus:ring-[var(--color-main)]"
                  />
                  <span>
                    {c.name} ({c.count})
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              Category
            </span>
            <button
              type="button"
              onClick={() => {
                const allSelected = localFilters.categoryIds.has("All");
                setLocalFilters((prev) => ({
                  ...prev,
                  categoryIds: allSelected
                    ? new Set<string>()
                    : new Set<string>(["All"]),
                }));
              }}
              className="text-sm font-medium text-[var(--color-main)] hover:underline"
              aria-label={
                localFilters.categoryIds.has("All")
                  ? "Clear all categories"
                  : "Select all categories"
              }
            >
              {localFilters.categoryIds.has("All") ? "Clear All" : "Select All"}
            </button>
          </div>
          <ul className="space-y-1">
            <li>
              <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-gray-700 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={localFilters.categoryIds.has("All")}
                  onChange={() => toggleCategory("All")}
                  className="h-4 w-4 rounded border-gray-300 text-[var(--color-main)] focus:ring-[var(--color-main)]"
                />
                <span>All</span>
              </label>
            </li>
            {categoriesWithoutAll.map((cat) => (
              <li key={cat.id}>
                <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-gray-700 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={localFilters.categoryIds.has(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="h-4 w-4 rounded border-gray-300 text-[var(--color-main)] focus:ring-[var(--color-main)]"
                  />
                  <span>
                    {cat.name}
                    {cat.count != null ? ` (${cat.count})` : ""}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <label
            htmlFor="top-places-sort"
            className="mb-2 block text-sm font-semibold text-gray-900"
          >
            Sort by
          </label>
          <select
            id="top-places-sort"
            value={localFilters.sort}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                sort: e.target.value as SortOption,
              }))
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[var(--color-main)] focus:outline-none focus:ring-1 focus:ring-[var(--color-main)]"
            aria-label="Sort order"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 border-t border-gray-100 px-4 pt-3">
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          aria-label="Reset filters"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="flex-1 rounded-lg bg-[var(--color-main)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          aria-label="Apply filters"
        >
          Apply
        </button>
      </div>
    </>
  );
}

export default function FiltersPopover({
  open,
  onOpenChange,
  filters,
  onApply,
  onReset,
  countries,
  categories,
}: FiltersPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onOpenChange]);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
        aria-label="Open filters"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white py-4 shadow-lg"
          role="dialog"
          aria-label="Filters: country, category, sort"
        >
          <FiltersFormContent
            key={filtersKey(filters)}
            initialFilters={filters}
            onApply={onApply}
            onReset={onReset}
            onOpenChange={onOpenChange}
            countries={countries}
            categories={categories}
          />
        </div>
      )}
    </div>
  );
}
