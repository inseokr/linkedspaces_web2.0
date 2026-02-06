"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { TopPlaceCardModel } from "../types";
import TopPlaceCard from "./TopPlaceCard";
import PlaceLightboxModal, { type LightboxImage } from "./PlaceLightboxModal";

const INITIAL_VISIBLE = 6;

function formatVisitDate(isoOrYmd: string): string {
  const s = String(isoOrYmd).trim();
  if (!s) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (!Number.isNaN(d.getTime())) {
      const day = d.getDate();
      const month = d.toLocaleString("en-US", { month: "long" });
      return `${day} ${month} ${d.getFullYear()} at 00:00`;
    }
  }
  return s;
}
const LOAD_MORE_COUNT = 6;

interface CardInteractionState {
  bookmarked: Set<string>;
  liked: Set<string>;
  /** Override likes count when user toggles heart (delta per place) */
  likeDelta: Record<string, number>;
}

interface TopPlacesGridProps {
  places: TopPlaceCardModel[];
}

export default function TopPlacesGrid({ places }: TopPlacesGridProps) {
  const [selectedPlace, setSelectedPlace] = React.useState<TopPlaceCardModel | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(INITIAL_VISIBLE);
  const [interaction, setInteraction] = React.useState<CardInteractionState>({
    bookmarked: new Set(),
    liked: new Set(),
    likeDelta: {},
  });

  const visiblePlaces = places.slice(0, visibleCount);
  const hasMore = visibleCount < places.length;
  const isExpanded = visibleCount > INITIAL_VISIBLE;

  const onBookmarkToggle = React.useCallback((placeId: string) => {
    setInteraction((prev) => {
      const next = new Set(prev.bookmarked);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return { ...prev, bookmarked: next };
    });
  }, []);

  const onLikeToggle = React.useCallback((placeId: string) => {
    setInteraction((prev) => {
      const nextSet = new Set(prev.liked);
      const nextDelta = { ...prev.likeDelta };
      if (nextSet.has(placeId)) {
        nextSet.delete(placeId);
        nextDelta[placeId] = (nextDelta[placeId] ?? 0) - 1;
      } else {
        nextSet.add(placeId);
        nextDelta[placeId] = (nextDelta[placeId] ?? 0) + 1;
      }
      return { ...prev, liked: nextSet, likeDelta: nextDelta };
    });
  }, []);

  const handleShowMore = () => {
    if (hasMore) {
      setVisibleCount((c) => Math.min(c + LOAD_MORE_COUNT, places.length));
    } else {
      setVisibleCount(INITIAL_VISIBLE);
    }
  };

  const lightboxImages: LightboxImage[] = selectedPlace
    ? (() => {
        const uris = selectedPlace.photoListUris ?? [selectedPlace.imageUrl];
        const dateTime =
          selectedPlace.visitedTime != null
            ? formatVisitDate(selectedPlace.visitedTime)
            : "";
        return uris.length > 0
          ? uris.map((src) => ({
              src,
              placeName: selectedPlace.title,
              dateTime,
            }))
          : [
              {
                src: selectedPlace.imageUrl,
                placeName: selectedPlace.title,
                dateTime,
              },
            ];
      })()
    : [];

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePlaces.map((place) => (
          <TopPlaceCard
            key={place.id}
            place={place}
            displayLikes={
              place.likesCount + (interaction.likeDelta[place.id] ?? 0)
            }
            isBookmarked={interaction.bookmarked.has(place.id)}
            isLiked={interaction.liked.has(place.id)}
            onBookmarkToggle={() => onBookmarkToggle(place.id)}
            onLikeToggle={() => onLikeToggle(place.id)}
            onPlaceClick={setSelectedPlace}
          />
        ))}
      </div>

      <PlaceLightboxModal
        isOpen={!!selectedPlace}
        onClose={() => setSelectedPlace(null)}
        images={lightboxImages}
        startIndex={0}
      />

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={handleShowMore}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          aria-label={
            hasMore
              ? "Show more spaces"
              : "Show less spaces"
          }
        >
          {hasMore ? "Show more spaces" : "Show less"}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}
