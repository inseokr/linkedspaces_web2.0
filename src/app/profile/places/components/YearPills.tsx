"use client";

export interface YearPillsProps {
  years: number[];
  selectedYear: number;
  onSelect: (year: number) => void;
}

export default function YearPills({
  years,
  selectedYear,
  onSelect,
}: YearPillsProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Filter by year"
    >
      {years.map((y) => {
        const isActive = selectedYear === y;
        return (
          <button
            key={y}
            type="button"
            onClick={() => onSelect(y)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 ${
              isActive
                ? "bg-[var(--color-main)] text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            aria-pressed={isActive}
            aria-label={`Filter year ${y}`}
          >
            {y}
          </button>
        );
      })}
    </div>
  );
}
