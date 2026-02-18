"use client";

import type { TimeScopeKey } from "@/views/Profile/travel-stats/statsTypes";

const SCOPE_LABELS: Record<TimeScopeKey, string> = {
  lifetime: "Lifetime",
  thisYear: "This Year",
  last6Months: "Last 6 Months",
  "2025": "2025",
  "2024": "2024",
  "2023": "2023",
};

const SCOPE_ORDER: TimeScopeKey[] = [
  "lifetime",
  "thisYear",
  "last6Months",
  "2025",
  "2024",
  "2023",
];

type Props = {
  scope: TimeScopeKey;
  onScopeChange: (s: TimeScopeKey) => void;
};

export default function TravelStatsHeader({ scope, onScopeChange }: Props) {
  return (
    <header className="space-y-3">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Travel Stats
      </h1>
      <p className="text-sm text-gray-500">A snapshot of how you explore</p>
      <div
        className="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1"
        role="tablist"
        aria-label="Time scope"
      >
        {SCOPE_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={scope === s}
            onClick={() => onScopeChange(s)}
            className={`min-w-[80px] rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 ${
              scope === s
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {SCOPE_LABELS[s]}
          </button>
        ))}
      </div>
    </header>
  );
}
