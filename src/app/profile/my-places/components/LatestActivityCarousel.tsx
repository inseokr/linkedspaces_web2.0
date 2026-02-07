"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LatestActivityPlace } from "../mockData";
import PlaceCard from "./PlaceCard";

interface LatestActivityCarouselProps {
  places: LatestActivityPlace[];
  /** When set, clicking a card opens the place detail lightbox (pass place id to look up full place) */
  onPlaceClick?: (placeId: string) => void;
  /** When set, clicking the comment button opens the lightbox with comments panel open */
  onCommentClick?: (placeId: string) => void;
}

/** PlaceCard width and gap must match PlaceCard.tsx (w-[320px]) and gap-4 */
const CARD_WIDTH = 320;
const GAP = 16;
/** Scroll by this many cards so the next set is visible (responsive: ~4 cards on small, more on wide) */
const CARDS_PER_PAGE = 4;
const PAGE_SCROLL = CARDS_PER_PAGE * CARD_WIDTH + (CARDS_PER_PAGE - 1) * GAP;

export default function LatestActivityCarousel({
  places,
  onPlaceClick,
  onCommentClick,
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
    <div className="relative flex w-full min-w-0 items-center gap-2">
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
        className="min-w-0 flex-1 overflow-x-auto scroll-smooth scrollbar-hide py-2 flex gap-4"
        role="region"
        aria-label="Latest activity carousel"
      >
        {places.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            onPlaceClick={onPlaceClick}
            onCommentClick={onCommentClick}
          />
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
