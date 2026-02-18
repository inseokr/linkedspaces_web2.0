"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TopPlaceCardModel } from "../types";

export interface TopPlacesHorizontalListProps {
  places: TopPlaceCardModel[];
  selectedPlaceId: string | null;
  onPlaceSelect: (place: TopPlaceCardModel) => void;
}

const CARD_WIDTH = 140;
const GAP = 10;
const CARDS_PER_PAGE = 2;
const PAGE_SCROLL = CARDS_PER_PAGE * CARD_WIDTH + (CARDS_PER_PAGE - 1) * GAP;

export default function TopPlacesHorizontalList({
  places,
  selectedPlaceId,
  onPlaceSelect,
}: TopPlacesHorizontalListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const withCoords = places.filter(
    (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude),
  );

  const scroll = React.useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;
    const target =
      direction === "right"
        ? Math.min(scrollLeft + PAGE_SCROLL, maxScroll)
        : Math.max(scrollLeft - PAGE_SCROLL, 0);
    el.scrollTo({ left: target, behavior: "smooth" });
  }, []);

  // Scroll selected item into view when selection changes
  React.useEffect(() => {
    if (!selectedPlaceId || !scrollRef.current) return;
    const el = itemRefs.current.get(selectedPlaceId);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedPlaceId]);

  if (withCoords.length === 0) return null;

  return (
    <div
      className="flex min-h-0 shrink flex-col gap-2"
      role="region"
      aria-label="Top places list"
    >
      <p className="shrink-0 text-xs font-medium uppercase tracking-wide text-gray-500">
        Explore top places
      </p>
      <div className="flex min-h-0 items-center gap-1">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          aria-label="Scroll list left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div
          ref={scrollRef}
          className="flex min-w-0 flex-1 overflow-x-auto pb-1 scroll-smooth [scrollbar-width:thin]"
          style={{ gap: GAP, scrollbarGutter: "stable" }}
        >
          {withCoords.map((place) => {
            const isSelected = place.id === selectedPlaceId;
            return (
              <button
                key={place.id}
                ref={(node) => {
                  if (node) itemRefs.current.set(place.id, node);
                }}
                type="button"
                onClick={() => onPlaceSelect(place)}
                className="group flex shrink-0 flex-col overflow-hidden rounded-xl border-2 bg-white text-left shadow-md transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
                style={{
                  width: CARD_WIDTH,
                  borderColor: isSelected ? "var(--color-main)" : "transparent",
                  boxShadow: isSelected
                    ? "0 0 0 2px var(--color-main)"
                    : undefined,
                }}
                aria-label={`${place.title}, ${place.city}. ${isSelected ? "Selected" : "Select"}`}
                aria-pressed={isSelected}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  {place.imageUrl ? (
                    <img
                      src={place.imageUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300"
                      aria-hidden
                    />
                  )}
                  <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-xs font-semibold text-white">
                    #{place.rank}
                  </div>
                </div>
                <div className="truncate px-2 py-1.5 text-sm font-medium text-gray-900">
                  {place.title}
                </div>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => scroll("right")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          aria-label="Scroll list right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
