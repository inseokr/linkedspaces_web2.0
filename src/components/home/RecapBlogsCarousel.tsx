"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { MockRecapBlog } from "@/lib/mockNetwork";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";

export interface RecapBlogsCarouselProps {
  items: MockRecapBlog[];
}

export default function RecapBlogsCarousel({ items }: RecapBlogsCarouselProps) {
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
      setActiveIndex(Math.min(index, items.length - 1));
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

  return (
    <section className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--card-text)]">
          Recap Blogs
        </h2>
        <span className="text-sm text-[var(--card-text-muted)]">
          Swipe to see more trips →
        </span>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:thin]"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((item) => {
          const { src, unoptimized } = normalizeImageSrc(item.coverImageUrl);
          const href = item.href ?? "#";
          return (
            <Link
              key={item.id}
              href={href}
              className="relative h-[200px] w-[280px] shrink-0 overflow-hidden rounded-xl border border-[var(--card-border)] bg-white shadow-sm transition-shadow hover:shadow-md"
              style={{ scrollSnapAlign: "start" }}
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
          );
        })}
      </div>
      {/* Pagination dots */}
      {items.length > 1 && (
        <div className="flex justify-center gap-2">
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
      {/* Title below carousel (first item or active) */}
      {items[activeIndex] && (
        <p className="mt-3 line-clamp-2 text-sm font-medium text-[var(--card-text)]">
          {items[activeIndex].title}
        </p>
      )}
    </section>
  );
}
