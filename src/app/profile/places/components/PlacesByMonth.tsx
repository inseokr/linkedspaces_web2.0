"use client";

import type { PlaceWithSavedAt } from "../mockData";
import PlaceCard from "./PlaceCard";

interface PlacesByMonthProps {
  /** Groups of places by month label (e.g. "November 2025"), newest first. */
  groups: { monthLabel: string; places: PlaceWithSavedAt[] }[];
  /** Called when a place card is clicked (opens lightbox). */
  onPlaceClick?: (place: PlaceWithSavedAt) => void;
}

const MONTH_HEADING_STYLE =
  "text-2xl font-bold text-gray-900 tracking-tight mt-8 first:mt-0 mb-4";

const MONTH_ABBREV: Record<number, string> = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  3: "Apr",
  4: "May",
  5: "Jun",
  6: "Jul",
  7: "Aug",
  8: "Sep",
  9: "Oct",
  10: "Nov",
  11: "Dec",
};

export default function PlacesByMonth({
  groups,
  onPlaceClick,
}: PlacesByMonthProps) {
  return (
    <div className="pb-12">
      {groups.map(({ monthLabel, places }) => (
        <section
          key={monthLabel}
          aria-labelledby={`month-${monthLabel.replace(/\s/g, "-")}`}
        >
          <h2
            id={`month-${monthLabel.replace(/\s/g, "-")}`}
            className={MONTH_HEADING_STYLE}
          >
            {monthLabel}
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {places.map((place) => (
              <li key={place.id}>
                <PlaceCard
                  place={place}
                  onPlaceClick={onPlaceClick}
                  dateLabel={
                    place.savedAt && place.savedAt.getTime() > 0
                      ? `${MONTH_ABBREV[place.savedAt.getMonth()]} ${place.savedAt.getDate()}`
                      : ""
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
