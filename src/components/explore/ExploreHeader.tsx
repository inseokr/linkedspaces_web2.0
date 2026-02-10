"use client";

import { Search } from "lucide-react";
import type {
  ExploreTimeFilter,
  ExploreContentFilter,
  ExploreRadiusMi,
  ExploreSortMode,
} from "@/lib/explore/exploreTypes";

const CHIP_BASE =
  "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2";

export interface ExploreHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  timeFilter: ExploreTimeFilter;
  onTimeFilterChange: (value: ExploreTimeFilter) => void;
  contentFilter: ExploreContentFilter;
  onContentFilterChange: (value: ExploreContentFilter) => void;
  radiusMi: ExploreRadiusMi;
  onRadiusChange: (value: ExploreRadiusMi) => void;
  sortMode: ExploreSortMode;
  onSortChange: (value: ExploreSortMode) => void;
}

const TIME_OPTIONS: { value: ExploreTimeFilter; label: string }[] = [
  { value: "Today", label: "Today" },
  { value: "7D", label: "7D" },
  { value: "30D", label: "30D" },
  { value: "All", label: "All" },
];

const CONTENT_OPTIONS: { value: ExploreContentFilter; label: string }[] = [
  { value: "Moments", label: "Moments" },
  { value: "Recap Blogs", label: "Recap Blogs" },
  { value: "Places", label: "Places" },
];

const RADIUS_OPTIONS: { value: ExploreRadiusMi; label: string }[] = [
  { value: 50, label: "50 mi" },
  { value: 200, label: "200 mi" },
  { value: 500, label: "500 mi" },
];

const SORT_OPTIONS: { value: ExploreSortMode; label: string }[] = [
  { value: "Trending", label: "Trending" },
  { value: "New", label: "New" },
  { value: "Near Me", label: "Near Me" },
];

export default function ExploreHeader({
  searchQuery,
  onSearchChange,
  timeFilter,
  onTimeFilterChange,
  contentFilter,
  onContentFilterChange,
  radiusMi,
  onRadiusChange,
  sortMode,
  onSortChange,
}: ExploreHeaderProps) {
  return (
    <header className="shrink-0 space-y-4">
      <div className="pt-4 pl-4 border-l-2 border-[var(--card-border)]">
        <h1 className="text-2xl font-bold text-[var(--card-text)]">Explore</h1>
        <p className="mt-0.5 text-sm text-[var(--card-text-muted)]">
          See what your network is up to.
        </p>
      </div>

      <div className="flex w-[98%] mx-auto items-center gap-2 rounded-full border-2 border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 transition-colors focus-within:border-[var(--color-main)] focus-within:ring-2 focus-within:ring-[var(--color-main)] focus-within:ring-offset-2">
        <Search
          className="h-4 w-4 shrink-0 text-[var(--card-text-muted)]"
          aria-hidden
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search places, cities, friends"
          className="min-w-0 flex-1 bg-transparent text-[var(--card-text)] placeholder:text-[var(--card-text-muted)] focus:outline-none"
          aria-label="Search places, cities, friends"
        />
      </div>

      <div className="flex flex-wrap gap-2 w-[98%] mx-auto items-center">
        <span className="sr-only">Time</span>
        {TIME_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onTimeFilterChange(value)}
            className={`${CHIP_BASE} ${
              timeFilter === value
                ? "bg-[var(--color-main)] text-white shadow-sm"
                : "border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--card-text)] hover:bg-[var(--color-neutral)]"
            }`}
            aria-pressed={timeFilter === value}
          >
            {label}
          </button>
        ))}
        <span
          className="mx-1 w-px self-center bg-[var(--card-border)]"
          aria-hidden
        />
        <span className="sr-only">Content</span>
        {CONTENT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onContentFilterChange(value)}
            className={`${CHIP_BASE} ${
              contentFilter === value
                ? "bg-[var(--color-main)] text-white shadow-sm"
                : "border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--card-text)] hover:bg-[var(--color-neutral)]"
            }`}
            aria-pressed={contentFilter === value}
          >
            {label}
          </button>
        ))}
        <span
          className="mx-1 w-px self-center bg-[var(--card-border)]"
          aria-hidden
        />
        <span className="sr-only">Radius</span>
        {RADIUS_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onRadiusChange(value)}
            className={`${CHIP_BASE} ${
              radiusMi === value
                ? "bg-[var(--color-main)] text-white shadow-sm"
                : "border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--card-text)] hover:bg-[var(--color-neutral)]"
            }`}
            aria-pressed={radiusMi === value}
          >
            {label}
          </button>
        ))}
        <span
          className="mx-1 w-px self-center bg-[var(--card-border)]"
          aria-hidden
        />
        <span className="sr-only">Sort</span>
        {SORT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSortChange(value)}
            className={`${CHIP_BASE} ${
              sortMode === value
                ? "bg-[var(--color-main)] text-white shadow-sm"
                : "border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--card-text)] hover:bg-[var(--color-neutral)]"
            }`}
            aria-pressed={sortMode === value}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
