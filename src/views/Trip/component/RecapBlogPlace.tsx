//recapblogPlaces

"use client";

import React, { useEffect, useRef, useState } from "react";
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

/** ----------------------------
 *  데이터 타입 (Day/Entries)
 *  ---------------------------- */

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

export type RecapBlogPageData = {
  hero: {
    coverImageUrl: string;
    title: string;
    dateText: string;
    locationText: string;
    authorName: string;
    postedLabel: string;
    avatarUrl: string;
  };
  days: RecapDay[];
};

// >>>>>>> origin/develop
type Props = {
  dayIndex: number;
  title: string;
  entries: RecapEntry[];

  onEntryMount?: (entryId: string, el: HTMLDivElement | null) => void; // 장소 별 맵 이동을 위한 콜백 추가
};

const clampClass = "line-clamp-2";

export function RecapBlogDaySection({
  dayIndex,
  title,
  entries,
  onEntryMount,
}: Props) {
  // entry별 See More 상태
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <section className="space-y-6">
      <div className='text-black text-left font-["Nunito_Sans"] text-[40px] font-bold leading-normal'>
        Day {dayIndex}: {title}
      </div>

      {/* <<<<<<< HEAD */}
      {/* 장소(Entry)들을 vertical로 쌓는다 */}
      <div className="space-y-10">
        {entries.map((entry) => (
          <div
            key={entry.id}
            ref={(el) => onEntryMount?.(entry.id, el)}
            data-entry-id={entry.id}
          >
            <RecapPlaceBlock
              entry={entry}
              expanded={expandedIds.has(entry.id)}
              onToggleExpanded={() => toggleExpanded(entry.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

{
  /* 
<<<<<<< HEAD */
}
/** ----------------------------
 *  장소 블록: (카드 외부에 장소/시간/태그)
 *  - 아래에 사진 카드 캐러셀(가로)
 *  ---------------------------- */
function RecapPlaceBlock({
  // =======
  // function RecapEntryCard({
  // >>>>>>> origin/develop
  entry,
  expanded,
  onToggleExpanded,
}: {
  entry: RecapEntry;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  // <<<<<<< HEAD
  return (
    <div className="space-y-4">
      {/* ✅ 장소/시간/태그는 카드 외부 */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <MapPin className="h-7 w-7 text-[#B84A2F]" />
            <div className="min-w-0">
              <div className="truncate text-[24px] font-extrabold text-black underline underline-offset-4">
                {entry.placeName}
              </div>
              <div className="mt-1 text-[16px] font-medium text-black/70">
                {entry.timeRangeText}
                {/* =======
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
>>>>>>> origin/develop */}
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

      {/* <<<<<<< HEAD */}
      {/* ✅ 이 장소의 사진들은 horizontal 캐러셀 (카드 단위로 넘어감) */}
      <RecapPhotoCarousel
        entry={entry}
        expanded={expanded}
        onToggleExpanded={onToggleExpanded}
      />
    </div>
  );
}

/** ----------------------------
 *  사진 캐러셀:
 *  - 사진 1장 = 카드 1개
 *  - 좌/우 버튼 누르면 다음 카드로 이동 (scrollIntoView)
 *  ---------------------------- */
function RecapPhotoCarousel({
  entry,
  expanded,
  onToggleExpanded,
}: {
  entry: RecapBlogPageData["days"][number]["entries"][number];
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  const total = entry.photos.length;
  const [activeIdx, setActiveIdx] = useState(0);

  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  // activeIdx가 바뀌면 해당 카드로 스크롤 이동
  useEffect(() => {
    itemRefs.current[activeIdx]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }, [activeIdx]);

  const prev = () => setActiveIdx((i) => (i - 1 + total) % total);
  const next = () => setActiveIdx((i) => (i + 1) % total);

  const showNav = total > 1;

  return (
    <div className="relative">
      <div
        className={[
          "flex overflow-x-auto",
          "snap-x snap-mandatory",
          "scroll-smooth",
          "gap-4 pb-2",
          "scrollbar-thin scrollbar-thumb-black/10 scrollbar-track-transparent",
          "[&>*]:snap-start",
        ].join(" ")}
      >
        {entry.photos.map((photoUrl, idx) => (
          <div
            key={`${entry.id}-photo-${idx}`}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            className="w-full shrink-0"
          >
            <RecapPhotoCard
              entry={entry}
              photoUrl={photoUrl}
              photoIndex={idx}
              totalPhotos={total}
              expanded={expanded}
              onToggleExpanded={onToggleExpanded}
            />
          </div>
        ))}
      </div>

      {/* 좌/우 버튼: 카드 외부(캐러셀 위)에서 다음 카드로 */}
      {showNav && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 shadow-sm backdrop-blur hover:bg-white"
            aria-label="Previous card"
          >
            <ChevronLeft className="h-6 w-6 text-black/70" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 shadow-sm backdrop-blur hover:bg-white"
            aria-label="Next card"
          >
            <ChevronRight className="h-6 w-6 text-black/70" />
          </button>
        </>
      )}
    </div>
  );
}

/** ----------------------------
 *  카드:
 *  카드에는 사진 1장 + 캡션 + 액션바만 포함
 *  (장소/시간/태그는 PlaceBlock에 있음)
 *  ---------------------------- */

function RecapPhotoCard({
  entry,
  photoUrl,
  photoIndex,
  totalPhotos,
  expanded,
  onToggleExpanded,
}: {
  entry: RecapBlogPageData["days"][number]["entries"][number];
  photoUrl: string;
  photoIndex: number;
  totalPhotos: number;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  return (
    <article
      className={[
        "w-full",
        "max-w-[920px]",
        "mx-auto",
        "overflow-hidden rounded-[28px] border border-black/15 bg-white shadow-sm",
      ].join(" ")}
    >
      {/* 사진 */}
      <div className="relative">
        <div className="relative m-6 aspect-[16/9] overflow-hidden rounded-2xl bg-black/5">
          <Image
            src={photoUrl}
            alt={`${entry.placeName} photo ${photoIndex + 1}`}
            // =======
            //       <div className="relative mt-4">
            //         <div className="relative mx-6 aspect-[16/9] overflow-hidden rounded-2xl bg-black/5">
            //           <Image
            //             src={currentPhoto}
            //             alt={`${entry.placeName} photo ${photoIdx + 1}`}
            // >>>>>>> origin/develop
            fill
            className="object-cover"
            sizes="(max-width: 768px) 90vw, 680px"
          />

          <div className="absolute left-4 top-4 rounded-full bg-white/40 px-3 py-1 text-[14px] font-bold text-white backdrop-blur">
            {/* <<<<<<< HEAD */}
            {photoIndex + 1}/{totalPhotos}
          </div>
        </div>
      </div>

      {/* 캡션 + See More */}
      <div className="px-6 pb-4">
        {/* =======
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
>>>>>>> origin/develop */}
        <div className="flex items-end justify-between gap-6">
          <p
            className={[
              "text-[22px] leading-[1.35] text-black/85",
              expanded ? "" : clampClass,
            ].join(" ")}
          >
            {entry.caption}
          </p>
          {/* 
          <button
            type="button"
            onClick={onToggleExpanded}
            className="shrink-0 text-[22px] font-extrabold text-black hover:opacity-80"
          >
            {expanded ? "See Less" : "See More"}
          </button> */}
        </div>
      </div>

      {/* 액션 바 */}
      <div className="flex items-center justify-between border-t border-black/10 px-6 py-4">
        <div className="flex items-center gap-5 text-black/70">
          <button
            type="button"
            className="inline-flex items-center gap-2 hover:text-black"
            aria-label="Bookmark"
          >
            <Bookmark className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 hover:text-black"
            aria-label="Copy link"
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
