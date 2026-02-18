"use client";

import type { DashboardFilters as Filters, DateRange } from "../types";

type Props = {
  filters: Filters;
  onDateRangeChange: (range: DateRange) => void;
  onSegmentChange?: (segment: string) => void;
  onCountryChange?: (country: string) => void;
  onCityChange?: (city: string) => void;
};

const SEGMENTS = ["All", "Power users", "Casual", "New"];
const COUNTRIES = [
  "All",
  "United States",
  "South Korea",
  "Japan",
  "United Kingdom",
  "France",
];

export default function DashboardFilters({
  filters,
  onDateRangeChange,
  onSegmentChange,
  onCountryChange,
  onCityChange,
}: Props) {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  const defaultStart = start.toISOString().slice(0, 10);
  const defaultEnd = end.toISOString().slice(0, 10);

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium text-gray-600">Date range</label>
        <input
          type="date"
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={filters.dateRange.start}
          onChange={(e) =>
            onDateRangeChange({ ...filters.dateRange, start: e.target.value })
          }
        />
        <span className="text-gray-400">–</span>
        <input
          type="date"
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={filters.dateRange.end}
          onChange={(e) =>
            onDateRangeChange({ ...filters.dateRange, end: e.target.value })
          }
        />
        <button
          type="button"
          className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
          onClick={() =>
            onDateRangeChange({ start: defaultStart, end: defaultEnd })
          }
        >
          Last 6 months
        </button>
      </div>
      {onSegmentChange && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Segment</label>
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filters.segment ?? "All"}
            onChange={(e) => onSegmentChange(e.target.value)}
          >
            {SEGMENTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}
      {onCountryChange && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Country</label>
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filters.country ?? "All"}
            onChange={(e) => onCountryChange(e.target.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
