"use client";

import { Search } from "lucide-react";

export interface HomeStickyBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  newActivityCount?: number;
}

export default function HomeStickyBar({
  searchQuery,
  onSearchChange,
  newActivityCount = 0,
}: HomeStickyBarProps) {
  return (
    <div
      className="sticky z-30 -mx-4 border-b border-[var(--card-border)] bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      style={{ top: "77px" }}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--card-text-muted)]"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search people, places, blogs..."
            className="w-full rounded-lg border border-[var(--card-border)] bg-gray-50 py-2 pl-9 pr-3 text-sm text-[var(--card-text)] placeholder:text-[var(--card-text-muted)] focus:border-[var(--color-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-0"
            aria-label="Search feed"
          />
        </div>
        {newActivityCount > 0 && (
          <span className="shrink-0 rounded-full bg-[var(--color-main)]/15 px-2.5 py-1 text-xs font-medium text-[var(--color-main)]">
            {newActivityCount} new
          </span>
        )}
      </div>
    </div>
  );
}
