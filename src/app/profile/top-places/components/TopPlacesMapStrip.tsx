"use client";

import * as React from "react";
import {
  MapPin,
  Camera,
  Clock,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { TopPlaceCardModel } from "../types";

interface TopPlacesMapStripProps {
  places: TopPlaceCardModel[];
  onPlaceSelect?: (place: TopPlaceCardModel) => void;
}

/** Card width and gap for scroll-by-page calculation (match card classes: w-[200px] md:w-[220px], gap-4 md:gap-5) */
const CARD_WIDTH = 210;
const GAP = 18;
const CARDS_PER_PAGE = 2;
const PAGE_SCROLL = CARDS_PER_PAGE * CARD_WIDTH + (CARDS_PER_PAGE - 1) * GAP;

export default function TopPlacesMapStrip({
  places,
  onPlaceSelect,
}: TopPlacesMapStripProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
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

  if (withCoords.length === 0) return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-10 px-3 pb-4 pt-2 md:px-6 md:pb-6 md:pt-3"
      aria-label="Top places on map"
    >
      <div className="rounded-2xl border border-white/15 bg-black/35 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/90 text-gray-700 shadow-sm transition-colors hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/30"
            aria-label="Scroll list left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div
            ref={scrollRef}
            className="min-w-0 flex-1 flex gap-4 overflow-x-auto scroll-smooth px-2 py-4 md:gap-5 md:px-2 md:py-5 [scrollbar-width:thin]"
            style={{ scrollbarGutter: "stable" }}
            role="region"
            aria-label="Top places list"
          >
            {withCoords.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => onPlaceSelect?.(place)}
                className="group flex w-[200px] shrink-0 flex-col overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 transition-all duration-200 hover:shadow-xl hover:ring-black/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 focus:ring-offset-black/30 md:w-[220px]"
                aria-label={`Go to ${place.title} on map`}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  {place.imageUrl ? (
                    <img
                      src={place.imageUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300"
                      aria-hidden
                    />
                  )}
                  <div className="absolute inset-0 rounded-t-xl ring-1 ring-inset ring-black/5" />
                  {/* Rank badge - top right */}
                  <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 shadow-sm backdrop-blur-sm">
                    <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" />
                    <span className="text-xs font-semibold text-gray-800">
                      #{place.rank}
                    </span>
                  </div>
                </div>

                {/* Info section - white card body */}
                <div className="flex flex-col px-3 py-2.5 text-left md:px-3.5 md:py-3">
                  <h3 className="truncate text-sm font-semibold text-gray-900 md:text-base">
                    {place.title}
                  </h3>
                  {(place.city || place.country) && (
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
                      <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
                      {[place.city, place.country].filter(Boolean).join(", ") ||
                        place.country}
                    </p>
                  )}
                  {/* Stats row */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Camera className="h-3 w-3 shrink-0 text-gray-400" />
                      {place.photosCount}{" "}
                      {place.photosCount === 1 ? "photo" : "photos"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 shrink-0 text-gray-400" />
                      {place.visitsCount}{" "}
                      {place.visitsCount === 1 ? "visit" : "visits"}
                    </span>
                    <span className="ml-auto flex items-center gap-1">
                      <Heart className="h-3 w-3 shrink-0 text-gray-400" />
                      {place.likesCount}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/90 text-gray-700 shadow-sm transition-colors hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/30"
            aria-label="Scroll list right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
