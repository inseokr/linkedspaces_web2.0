"use client";

import { useCallback, useMemo, useRef } from "react";
import SentimentIcon from "@/components/ui/SentimentIcon";
import type { MockPlace } from "@/lib/mockNetwork";
import type { UserSentiment } from "@/app/profile/mapbox-category-pins";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80";

function normalizeSentiment(s: unknown): UserSentiment | undefined {
  const t =
    typeof s === "string"
      ? s.trim().toLowerCase()
      : String(s ?? "")
          .trim()
          .toLowerCase();
  if (!t) return undefined;
  if (t === "positive" || t === "neutral" || t === "negative")
    return t as UserSentiment;
  return undefined;
}

function PlaceRow({
  place,
  isActive,
  onSelect,
  onPlaceClick,
}: {
  place: MockPlace;
  isActive: boolean;
  onSelect: () => void;
  onPlaceClick?: (place: MockPlace) => void;
}) {
  const handleRowClick = useCallback(() => {
    onSelect();
    onPlaceClick?.(place);
  }, [onSelect, onPlaceClick, place]);

  const sentiment = normalizeSentiment(place.sentiment);
  const category = (place.category ?? "Others").trim()
    ? String(place.category).charAt(0).toUpperCase() +
      String(place.category).slice(1).toLowerCase()
    : "Others";

  return (
    <div
      data-place-id={place.id}
      role="article"
      aria-label={`Place: ${place.name}`}
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleRowClick();
        }
      }}
      className={`relative flex gap-4 rounded-lg border p-4 shadow-sm transition-shadow cursor-pointer ${
        isActive
          ? "border-[var(--color-main)] ring-2 ring-[var(--color-main)] ring-offset-2 bg-[var(--color-main)]/5"
          : "border-gray-200 bg-white hover:shadow-md"
      }`}
    >
      {sentiment && (
        <div className="absolute right-4 top-4 z-10">
          <SentimentIcon sentiment={sentiment} size={32} />
        </div>
      )}
      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <img
          src={place.imageUrl || PLACEHOLDER_IMAGE}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.src = PLACEHOLDER_IMAGE;
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {place.name}
          </h3>
          <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
            {category}
          </span>
        </div>
        {place.username && (
          <p className="mt-0.5 text-xs text-gray-500">by {place.username}</p>
        )}
        {place.caption && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {place.caption}
          </p>
        )}
      </div>
    </div>
  );
}

export interface ExplorePlacesListProps {
  places: MockPlace[];
  /** Which place is selected (e.g. from map click); drives highlight and scroll-into-view */
  activePlaceId?: string | null;
  onSelectPlace?: (placeId: string) => void;
  onPlaceClick?: (place: MockPlace) => void;
}

export default function ExplorePlacesList({
  places,
  activePlaceId = null,
  onSelectPlace,
  onPlaceClick,
}: ExplorePlacesListProps) {
  const listRef = useRef<HTMLUListElement>(null);

  const handleSelectPlace = useCallback(
    (placeId: string) => {
      onSelectPlace?.(placeId);
      const el = listRef.current?.querySelector<HTMLElement>(
        `[data-place-id="${placeId}"]`,
      );
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    },
    [onSelectPlace],
  );

  /** Deduplicate by string id (place.id may be ObjectId from API; same value different refs => duplicate keys) */
  const uniquePlaces = useMemo(() => {
    const seen = new Set<string>();
    return places.filter((p) => {
      const idStr = String(p.id ?? "");
      if (seen.has(idStr)) return false;
      seen.add(idStr);
      return true;
    });
  }, [places]);

  if (uniquePlaces.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
        No places in this category.
      </p>
    );
  }

  return (
    <ul
      ref={listRef}
      className="flex flex-col gap-3"
      aria-label="Explore places list"
    >
      {uniquePlaces.map((place) => {
        const placeIdStr = String(place.id ?? "");
        return (
          <li key={placeIdStr}>
            <PlaceRow
              place={place}
              isActive={
                activePlaceId === place.id ||
                String(activePlaceId) === placeIdStr
              }
              onSelect={() => handleSelectPlace(placeIdStr)}
              onPlaceClick={onPlaceClick}
            />
          </li>
        );
      })}
    </ul>
  );
}
