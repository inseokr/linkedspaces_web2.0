// RecapBlogPlace.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";

import {
  MapPin,
  ThumbsUp,
  Bookmark,
  Link2,
  Heart,
  MessageSquare,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type RecapEntry = {
  id: string;
  placeName: string;
  timeRangeText: string;
  categoryLabel?: string;
  liked?: boolean;
  likeCount: number;
  commentCount: number;
  caption: string;
  photos: string[];
  coordinate?: { latitude: number; longitude: number };
};

export type RecapDay = {
  dayIndex: number;
  title: string;
  entries: RecapEntry[];
};

type Props = {
  dayIndex: number;
  title: string;
  entries: RecapEntry[];
};

const clampClass = "line-clamp-2";

export function RecapBlogDaySection({ dayIndex, title, entries }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <section className="space-y-4">
      <h2 className="text-[44px] font-extrabold tracking-[-0.8px] text-black">
        Day {dayIndex}: {title}
      </h2>

      <div className="relative">
        <div
          className={[
            "flex overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4",
            "[&>*]:snap-start gap-0",
            "scrollbar-thin scrollbar-thumb-black/10 scrollbar-track-transparent",
          ].join(" ")}
        >
          {entries.map((e) => (
            <div key={e.id} className="w-full shrink-0 px-1">
              <RecapEntryCard
                entry={e}
                expanded={expandedIds.has(e.id)}
                onToggleExpanded={() => toggleExpanded(e.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecapEntryCard({
  entry,
  expanded,
  onToggleExpanded,
}: {
  entry: RecapEntry;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const total = Math.max(entry.photos.length, 1);

  const prev = () => setPhotoIdx((i) => (i - 1 + total) % total);
  const next = () => setPhotoIdx((i) => (i + 1) % total);

  const currentPhoto = entry.photos[photoIdx] ?? "/images/hero/us.jpg";

  return (
    <article
      className={[
        "w-full max-w-[920px] mx-auto overflow-hidden",
        "rounded-[28px] border border-black/15 bg-white shadow-sm",
      ].join(" ")}
    >
      <div className="px-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <MapPin className="h-7 w-7 text-[#B84A2F]" />
              <div className="min-w-0">
                <div className="truncate text-[30px] font-extrabold text-black underline underline-offset-4">
                  {entry.placeName}
                </div>
                <div className="mt-1 text-[16px] font-medium text-black/70">
                  {entry.timeRangeText}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {entry.categoryLabel && (
              <span className="rounded-full bg-black/5 px-3 py-1 text-[14px] font-semibold text-black/60">
                {entry.categoryLabel}
              </span>
            )}
            <button
              type="button"
              className={[
                "inline-flex h-11 w-11 items-center justify-center rounded-full",
                entry.liked
                  ? "bg-emerald-200 text-emerald-900"
                  : "bg-black/5 text-black/60",
              ].join(" ")}
              aria-label="Like"
            >
              <ThumbsUp className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative mt-4">
        <div className="relative mx-6 aspect-[16/9] overflow-hidden rounded-2xl bg-black/5">
          <Image
            src={currentPhoto}
            alt={`${entry.placeName} photo ${photoIdx + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 90vw, 680px"
          />

          <div className="absolute left-4 top-4 rounded-full bg-white/40 px-3 py-1 text-[14px] font-bold text-white backdrop-blur">
            {entry.photos.length
              ? `${photoIdx + 1}/${entry.photos.length}`
              : "—"}
          </div>

          {entry.photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 shadow-sm backdrop-blur hover:bg-white"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6 text-black/70" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 shadow-sm backdrop-blur hover:bg-white"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6 text-black/70" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="px-6 pb-4 pt-5">
        <div className="flex items-end justify-between gap-6">
          <p
            className={[
              "text-[22px] leading-[1.35] text-black/85",
              expanded ? "" : clampClass,
            ].join(" ")}
          >
            {entry.caption}
          </p>

          <button
            type="button"
            onClick={onToggleExpanded}
            className="shrink-0 text-[22px] font-extrabold text-black hover:opacity-80"
          >
            {expanded ? "See Less" : "See More"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-black/10 px-6 py-4">
        <div className="flex items-center gap-5 text-black/70">
          <button
            type="button"
            className="inline-flex items-center gap-2 hover:text-black"
          >
            <Bookmark className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 hover:text-black"
          >
            <Link2 className="h-6 w-6" />
          </button>
        </div>

        <div className="flex items-center gap-6 text-[20px] font-semibold text-black/80">
          <div className="inline-flex items-center gap-2">
            <span>{entry.likeCount}</span>
            <Heart className="h-6 w-6" />
          </div>
          <div className="inline-flex items-center gap-2">
            <span>{entry.commentCount}</span>
            <MessageSquare className="h-6 w-6" />
          </div>
          <button type="button" aria-label="More" className="hover:text-black">
            <MoreVertical className="h-6 w-6" />
          </button>
        </div>
      </div>
    </article>
  );
}
