"use client";

import type { ScopeStats } from "@/views/Profile/travel-stats/statsTypes";
import HighlightCard from "./HighlightCard";

type Props = {
  highlights: ScopeStats["highlights"];
  onHighlightClick?: (key: string) => void;
};

export default function HighlightsSection({
  highlights,
  onHighlightClick,
}: Props) {
  const items: {
    key: string;
    title: string;
    subtitle: string;
    photoUrl: string | null;
    categoryForIcon?: string | null;
  }[] = [];

  if (highlights.mostVisitedPlace) {
    items.push({
      key: "mostVisited",
      title: "Most visited",
      subtitle: `${highlights.mostVisitedPlace.name}${highlights.mostVisitedPlace.city ? ` · ${highlights.mostVisitedPlace.city}` : ""} (${highlights.mostVisitedPlace.visitsCount} visits)`,
      photoUrl: highlights.mostVisitedPlace.photoUrl,
    });
  }
  if (highlights.firstSavedPlace) {
    items.push({
      key: "firstSaved",
      title: "First saved place",
      subtitle: `${highlights.firstSavedPlace.name} · ${highlights.firstSavedPlace.date}`,
      photoUrl: highlights.firstSavedPlace.photoUrl,
    });
  }
  if (highlights.mostRecentPlace) {
    items.push({
      key: "mostRecent",
      title: "Most recent",
      subtitle: `${highlights.mostRecentPlace.name} · ${highlights.mostRecentPlace.date}`,
      photoUrl: highlights.mostRecentPlace.photoUrl,
    });
  }
  if (highlights.longestTrip) {
    items.push({
      key: "longestTrip",
      title: "Longest trip",
      subtitle: `${highlights.longestTrip.title} · ${highlights.longestTrip.days} days`,
      photoUrl: highlights.longestTrip.coverPhotoUrl,
    });
  }
  if (highlights.mostActiveMonth) {
    items.push({
      key: "mostActiveMonth",
      title: "Most active month",
      subtitle: `${highlights.mostActiveMonth.monthLabel} · ${highlights.mostActiveMonth.placesSavedCount} places`,
      photoUrl: null,
    });
  }
  if (highlights.returningPlace) {
    items.push({
      key: "returning",
      title: "Place you keep returning to",
      subtitle: `${highlights.returningPlace.name} · ${highlights.returningPlace.visitsCount} visits`,
      photoUrl: highlights.returningPlace.photoUrl,
    });
  }
  if (highlights.mostAddedCategory) {
    items.push({
      key: "mostAddedCategory",
      title: "Most added category",
      subtitle: `${highlights.mostAddedCategory.category} · ${highlights.mostAddedCategory.count} places`,
      photoUrl: null,
      categoryForIcon: highlights.mostAddedCategory.category,
    });
  }

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">Your Story</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <HighlightCard
            key={item.key}
            title={item.title}
            subtitle={item.subtitle}
            photoUrl={item.photoUrl}
            categoryForIcon={item.categoryForIcon}
            onClick={
              onHighlightClick ? () => onHighlightClick(item.key) : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}
