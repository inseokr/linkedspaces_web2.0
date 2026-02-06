"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LatestActivityPlace } from "../mockData";
import PlaceCard from "./PlaceCard";

interface LatestActivityCarouselProps {
  places: LatestActivityPlace[];
  /** When set, clicking a card opens the place detail lightbox (pass place id to look up full place) */
  onPlaceClick?: (placeId: string) => void;
}

/** PlaceCard width and gap must match PlaceCard.tsx (w-[320px]) and gap-4 */
const CARD_WIDTH = 320;
const GAP = 16;
/** Scroll by 4 full cards so the next 4 are fully visible */
const PAGE_SCROLL = 4 * CARD_WIDTH + 3 * GAP;
/** Viewport shows 4 full cards + slight peek of 5th (4.2 cards) */
const VIEWPORT_MAX_WIDTH = 4.2 * CARD_WIDTH + 3.2 * GAP;

export default function LatestActivityCarousel({
  places,
  onPlaceClick,
}: LatestActivityCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;

    let target: number;
    if (direction === "right") {
      const next = scrollLeft + PAGE_SCROLL;
      target = next >= maxScroll ? maxScroll : next;
    } else {
      const prev = scrollLeft - PAGE_SCROLL;
      target = prev <= 0 ? 0 : prev;
    }
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => scroll("left")}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
        aria-label="Scroll carousel left"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        ref={scrollRef}
        className="flex flex-1 gap-4 overflow-x-auto scroll-smooth scrollbar-hide py-2"
        style={{ maxWidth: VIEWPORT_MAX_WIDTH }}
        role="region"
        aria-label="Latest activity carousel"
      >
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} onPlaceClick={onPlaceClick} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll("right")}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
        aria-label="Scroll carousel right"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
