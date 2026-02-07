"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import {
  ExternalLink,
  MessageCircle,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import type { SavedPlace } from "../mockData";

interface PlacesListProps {
  places: SavedPlace[];
  /** Single source of truth from parent: which place is selected (drives map highlight). */
  activePlaceId?: string | null;
  /** Called when user clicks a list item; parent sets activePlaceId. */
  onSelectPlace?: (placeId: string) => void;
  /** When set, clicking a place row also opens the place detail lightbox */
  onPlaceClick?: (place: SavedPlace) => void;
  /** When set, clicking the comment button opens the lightbox with the comments panel open */
  onCommentClick?: (place: SavedPlace) => void;
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

/** Sentiment icon for top-right of place card: thumbs up (green), thumbs to the side (yellow), thumbs down (red). */
function SentimentBadge({
  sentiment,
}: {
  sentiment: "positive" | "neutral" | "negative";
}) {
  const config = {
    positive: {
      Icon: ThumbsUp,
      iconClass: "h-4 w-4",
      className: "text-green-600 bg-green-50 ring-green-200",
      label: "Positive",
    },
    neutral: {
      Icon: ThumbsUp,
      iconClass: "h-4 w-4 rotate-[-90deg]",
      className: "text-amber-600 bg-amber-50 ring-amber-200",
      label: "Neutral (thumbs to the side)",
    },
    negative: {
      Icon: ThumbsDown,
      iconClass: "h-4 w-4",
      className: "text-red-600 bg-red-50 ring-red-200",
      label: "Negative",
    },
  };
  const { Icon, iconClass, className, label } = config[sentiment];
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ${className}`}
      title={`Sentiment: ${label}`}
      aria-label={`Sentiment: ${label}`}
    >
      <Icon className={iconClass} strokeWidth={2} aria-hidden />
    </span>
  );
}

function PlaceRow({
  place,
  isActive,
  onSelect,
  onPlaceClick,
  onCommentClick,
}: {
  place: SavedPlace;
  isActive: boolean;
  onSelect: () => void;
  onPlaceClick?: (place: SavedPlace) => void;
  onCommentClick?: (place: SavedPlace) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleCommentClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onCommentClick) onCommentClick(place);
      else {
        onSelect();
        onPlaceClick?.(place);
      }
    },
    [onSelect, onPlaceClick, onCommentClick, place],
  );

  const handleKebabClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (ev: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(ev.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

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
      className={`relative flex gap-4 rounded-lg border p-4 pb-12 shadow-sm transition-shadow cursor-pointer ${
        isActive
          ? "border-[var(--color-main)] ring-2 ring-[var(--color-main)] ring-offset-2 bg-[var(--color-main)]/5"
          : "border-gray-200 bg-white hover:shadow-md"
      }`}
    >
      {/* Sentiment: top-right corner */}
      {place.sentiment && (
        <div className="absolute right-4 top-4 z-10">
          <SentimentBadge sentiment={place.sentiment} />
        </div>
      )}
      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
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
        <p className="mt-1 line-clamp-3 text-sm text-gray-600 min-h-[2.5rem]">
          {place.snippet || place.caption || " "}
        </p>
      </div>

      {/* Bottom action row: Search on Google (left) + Comment + Kebab (right) */}
      <div className="absolute left-4 right-4 bottom-3 z-10 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleSearchGoogle}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          aria-label={`Search for ${place.name} on Google`}
          tabIndex={-1}
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Search on Google
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCommentClick}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
            aria-label="Comments"
            tabIndex={-1}
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={handleKebabClick}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
              aria-label="More options"
              aria-expanded={menuOpen}
              tabIndex={-1}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 bottom-full z-20 mb-1 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onSelect();
                    onPlaceClick?.(place);
                  }}
                >
                  View details
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    handleSearchGoogle(e);
                  }}
                >
                  Search on Google
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlacesList({
  places,
  activePlaceId = null,
  onSelectPlace,
  onPlaceClick,
  onCommentClick,
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
            onCommentClick={onCommentClick}
          />
        </li>
      ))}
    </ul>
  );
}
