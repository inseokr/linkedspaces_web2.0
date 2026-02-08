"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import type { MockRecapBlog } from "@/lib/mockNetwork";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";

export interface RecapBlogsCarouselProps {
  items: MockRecapBlog[];
  isLoading?: boolean;
  /** When true, left/right arrows are visible (e.g. on Home "All" toggle). */
  showArrows?: boolean;
}

export default function RecapBlogsCarousel({
  items,
  isLoading,
  showArrows = false,
}: RecapBlogsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardWidthRef = useRef(280);
  const gap = 16;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const scrollLeft = el.scrollLeft;
      const width = cardWidthRef.current + gap;
      const index = Math.round(scrollLeft / width);
      setActiveIndex(Math.min(index, Math.max(0, items.length - 1)));
    };
    el.addEventListener("scroll", onScroll);
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [items.length]);

  const goTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const width = cardWidthRef.current + gap;
    el.scrollTo({ left: index * width, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <section className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[200px] w-[280px] shrink-0 animate-pulse rounded-xl bg-gray-200"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--card-text)]">
          Recap Blogs
        </h2>
        {!showArrows && (
          <span className="text-sm text-[var(--card-text-muted)]">
            Swipe to see more →
          </span>
        )}
      </div>
      <div className="relative flex items-stretch">
        {showArrows && items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(Math.max(0, activeIndex - 1))}
              className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--card-text-muted)] shadow-md hover:bg-white hover:text-[var(--card-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
              aria-label="Previous recap"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(Math.min(items.length - 1, activeIndex + 1))}
              className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--card-text-muted)] shadow-md hover:bg-white hover:text-[var(--card-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
              aria-label="Next recap"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {items.map((item) => {
            const { src, unoptimized } = normalizeImageSrc(item.coverImageUrl);
            const href = item.href ?? "#";
            return (
              <div
                key={item.id}
                className="flex w-[280px] shrink-0 flex-col gap-2"
                style={{ scrollSnapAlign: "start" }}
              >
                <Link
                  href={href}
                  className="relative h-[200px] w-full overflow-hidden rounded-xl border border-[var(--card-border)] bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    unoptimized={unoptimized}
                    className="object-cover"
                    sizes="280px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Top left: avatar + username pill */}
                  <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-black/5 pr-2 backdrop-blur-sm">
                    {item.authorAvatarUrl && (
                      <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-white/80">
                        <Image
                          src={normalizeImageSrc(item.authorAvatarUrl).src}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="24px"
                        />
                      </div>
                    )}
                    <span className="text-xs font-medium text-white drop-shadow-sm">
                      {item.authorUsername}
                    </span>
                  </div>
                  {/* Bottom left: location pill */}
                  <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-black/5 px-2 py-1 backdrop-blur-sm">
                    <MapPin className="h-3 w-3 text-white" />
                    <span className="text-xs text-white drop-shadow-sm">
                      {item.locationLabel}
                    </span>
                  </div>
                  {/* Bottom right: date */}
                  <div className="absolute bottom-2 right-2 z-10 text-right text-xs text-white/95 drop-shadow-sm">
                    {item.dateLabel}
                  </div>
                </Link>
                {/* Title under the card — constrained width so it doesn't overflow */}
                <p className="min-w-0 max-w-full break-words line-clamp-2 text-sm font-medium text-[var(--card-text)]">
                  {item.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      {/* Pagination dots (below cards + titles) */}
      {items.length > 1 && (
        <div className="mt-2 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === activeIndex
                  ? "w-6 bg-[var(--color-main)]"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
