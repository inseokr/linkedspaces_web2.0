"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { NetworkTrendingPlace } from "@/lib/explore/exploreTypes";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";

const CARD_WIDTH = 280;
const GAP = 16;

export interface TrendingCarouselProps {
  places: NetworkTrendingPlace[];
  onPlaceClick?: (place: NetworkTrendingPlace) => void;
  isLoading?: boolean;
}

export default function TrendingCarousel({
  places,
  onPlaceClick,
  isLoading,
}: TrendingCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = (CARD_WIDTH + GAP) * 2;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <section className="w-full" aria-label="Trending in your network">
        <h2 className="mb-3 text-xl font-semibold text-[var(--card-text)]">
          Trending in Your Network
        </h2>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[200px] w-[280px] shrink-0 animate-pulse rounded-xl bg-[var(--color-neutral)]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (places.length === 0) return null;

  return (
    <section className="w-full" aria-label="Trending in your network">
      <h2 className="mb-3 text-xl font-semibold text-[var(--card-text)]">
        Trending in Your Network
      </h2>
      <div className="relative flex items-stretch">
        {places.length > 2 && (
          <>
            <button
              type="button"
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm text-[var(--card-text)] hover:bg-[var(--color-neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm text-[var(--card-text)] hover:bg-[var(--color-neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth scrollbar-thin"
          style={{ scrollbarWidth: "thin" }}
        >
          {places.map((place) => {
            const { src, unoptimized } = normalizeImageSrc(place.coverImageUrl);
            return (
              <button
                key={place.id}
                type="button"
                onClick={() => onPlaceClick?.(place)}
                className="flex w-[280px] shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 text-left"
              >
                <div className="relative aspect-[4/3] w-full bg-[var(--color-neutral)]">
                  <Image
                    src={src}
                    alt=""
                    fill
                    unoptimized={unoptimized}
                    className="object-cover"
                    sizes="280px"
                  />
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    {place.badges.slice(0, 2).map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="truncate font-semibold text-[var(--card-text)]">
                    {place.placeName}
                  </h3>
                  <p className="truncate text-xs text-[var(--card-text-muted)]">
                    {place.cityOrCountry}
                  </p>
                  <div className="mt-2 flex gap-3 text-xs text-[var(--card-text-muted)]">
                    <span>{place.likes} likes</span>
                    <span>{place.saves} saves</span>
                    <span>{place.visits} visits</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
