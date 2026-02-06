"use client";

import { useCallback, useRef } from "react";
import { ExternalLink } from "lucide-react";
import type { SavedPlace } from "../mockData";

interface PlacesListProps {
  places: SavedPlace[];
  /** Single source of truth from parent: which place is selected (drives map highlight). */
  activePlaceId?: string | null;
  /** Called when user clicks a list item; parent sets activePlaceId. */
  onSelectPlace?: (placeId: string) => void;
  /** When set, clicking a place row also opens the place detail lightbox */
  onPlaceClick?: (place: SavedPlace) => void;
}

function ThumbnailPlaceholder() {
  return (
    <div
      className="h-full w-full bg-cover bg-center"
      style={{
        background:
          "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
      }}
    />
  );
}

function PlaceRow({
  place,
  isActive,
  onSelect,
  onPlaceClick,
}: {
  place: SavedPlace;
  isActive: boolean;
  onSelect: () => void;
  onPlaceClick?: (place: SavedPlace) => void;
}) {
  const handleSearchGoogle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const query = encodeURIComponent(place.name);
      window.open(
        `https://www.google.com/search?q=${query}`,
        "_blank",
        "noopener,noreferrer",
      );
    },
    [place.name],
  );

  const handleRowClick = useCallback(() => {
    onSelect();
    onPlaceClick?.(place);
  }, [onSelect, onPlaceClick, place]);

  return (
    <div
      data-place-id={place.id}
      role="article"
      aria-label={`Saved place: ${place.name}`}
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleRowClick();
        }
      }}
      className={`flex gap-4 rounded-lg border p-4 shadow-sm transition-shadow cursor-pointer ${
        isActive
          ? "border-[var(--color-main)] ring-2 ring-[var(--color-main)] ring-offset-2 bg-[var(--color-main)]/5"
          : "border-gray-200 bg-white hover:shadow-md"
      }`}
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {place.thumbnailUrl ? (
          <img
            src={place.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const next = e.currentTarget.nextElementSibling;
              if (next instanceof HTMLElement) next.style.display = "block";
            }}
          />
        ) : null}
        <div
          className={
            place.thumbnailUrl ? "hidden h-full w-full" : "block h-full w-full"
          }
          aria-hidden
        >
          <ThumbnailPlaceholder />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {place.name}
          </h3>
          <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
            {place.category}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">{place.visitedDate}</p>
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
          {place.snippet}
        </p>
        <button
          type="button"
          onClick={handleSearchGoogle}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--color-main)] px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          aria-label={`Search for ${place.name} on Google`}
          tabIndex={-1}
        >
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
          Search on Google
        </button>
      </div>
    </div>
  );
}

export default function PlacesList({
  places,
  activePlaceId = null,
  onSelectPlace,
  onPlaceClick,
}: PlacesListProps) {
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

  if (places.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
        No places match the current filter.
      </p>
    );
  }

  return (
    <ul
      ref={listRef}
      className="flex flex-col gap-3"
      aria-label="Saved places list"
    >
      {places.map((place) => (
        <li key={place.id}>
          <PlaceRow
            place={place}
            isActive={activePlaceId === place.id}
            onSelect={() => handleSelectPlace(place.id)}
            onPlaceClick={onPlaceClick}
          />
        </li>
      ))}
    </ul>
  );
}
