"use client";

import type { PlaceWithSavedAt } from "../mockData";
import PlaceCard from "./PlaceCard";

interface PlacesByMonthProps {
  /** Groups of places by month label (e.g. "November 2025"), newest first. */
  groups: { monthLabel: string; places: PlaceWithSavedAt[] }[];
}

const MONTH_HEADING_STYLE =
  "text-2xl font-bold text-gray-900 tracking-tight mt-8 first:mt-0 mb-4";

export default function PlacesByMonth({ groups }: PlacesByMonthProps) {
  return (
    <div className="pb-12">
      {groups.map(({ monthLabel, places }) => (
        <section
          key={monthLabel}
          aria-labelledby={`month-${monthLabel.replace(/\s/g, "-")}`}
        >
          <h2 id={`month-${monthLabel.replace(/\s/g, "-")}`} className={MONTH_HEADING_STYLE}>
            {monthLabel}
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <li key={place.id}>
                <PlaceCard place={place} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
