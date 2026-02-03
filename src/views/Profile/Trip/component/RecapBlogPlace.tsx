"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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

import PhotoLightbox from "@/components/ui/PhotoLightbox";
import { idbGetBlob } from "@/views/Profile/Trip/edit/utils/imageIdb";
import TextRow from "@/views/Profile/Trip/edit/components/TextRow";

/** ----------------------------
 *  Types
 *  ---------------------------- */
export type RecapEntry = {
  id: string;
  /**
   * Backend identifier used by /placeVisitHistory/story.
   * Typically equals PlaceVisitHistoryItem.visitedTimeDigitized (often same as recap place digitizedTime).
   */
  placeKey?: string;
  placeName: string;
  timeRangeText: string;
  categoryLabel?: string;
  liked?: boolean;
  likeCount: number;
  commentCount: number;

  // 기존 단일 캡션 호환
  caption?: string;

  // 사진별 캡션
  captions?: string[];

  // 사진: remote url or "idb:<key>"
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

type Mode = "view" | "edit";

type Props = {
  dayIndex: number;
  title: string;
  entries: RecapEntry[];
  mode?: Mode;

  onCaptionChange?: (entryId: string, photoIndex: number, next: string) => void;
  onReplacePhoto?: (entryId: string, photoIndex: number, file: File) => void;
  onRemovePhoto?: (entryId: string, photoIndex: number) => void;

  onEntryMount?: (entryId: string, el: HTMLDivElement | null) => void;
};

const clampClass = "line-clamp-2";

/** ----------------------------
 *  Day section
 *  ---------------------------- */
export function RecapBlogDaySection({
  dayIndex,
  title,
  entries,
  mode = "view",
  onCaptionChange,
  onReplacePhoto,
  onRemovePhoto,
  onEntryMount,
}: Props) {
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
              mode={mode}
              onCaptionChange={onCaptionChange}
              onReplacePhoto={onReplacePhoto}
              onRemovePhoto={onRemovePhoto}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/** ----------------------------
 *  Single entry card (re-usable, e.g. in mobile bottom sheet)
 *  ---------------------------- */
export function RecapBlogEntryCard({
  entry,
  className = "",
  variant = "default",
}: {
  entry: RecapEntry;
  className?: string;
  variant?: "default" | "sheet";
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={className}>
      <RecapPlaceBlock
        entry={entry}
        expanded={expanded}
        onToggleExpanded={() => setExpanded((v) => !v)}
        mode="view"
        photoLayout={variant === "sheet" ? "sheet" : "default"}
      />
    </div>
  );
}

/** ----------------------------
 *  Place block
 *  ---------------------------- */
function RecapPlaceBlock({
  entry,
  expanded,
  onToggleExpanded,
  mode,
  onCaptionChange,
  onReplacePhoto,
  onRemovePhoto,
  photoLayout = "default",
}: {
  entry: RecapEntry;
  expanded: boolean;
  onToggleExpanded: () => void;
  mode: Mode;
  onCaptionChange?: (entryId: string, photoIndex: number, next: string) => void;
  onReplacePhoto?: (entryId: string, photoIndex: number, file: File) => void;
  onRemovePhoto?: (entryId: string, photoIndex: number) => void;
  photoLayout?: "default" | "sheet";
}) {
  return (
    <div className="space-y-4">
      {/* 장소/태그는 카드 외부 (시간은 사진 위로 오버레이) */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <MapPin className="h-7 w-7 text-[#B84A2F]" />
            <div className="min-w-0">
              <div className="truncate text-[24px] font-extrabold text-black underline underline-offset-4">
                {entry.placeName}
              </div>
              {/* If no photos exist, keep time visible here as fallback */}
              {(!entry.photos || entry.photos.length === 0) &&
                !!entry.timeRangeText?.trim() && (
                  <div className="mt-1 text-[16px] font-medium text-black/70">
                    {entry.timeRangeText}
                  </div>
                )}
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

      {mode === "edit" ? (
        <RecapPhotoEditList
          entry={entry}
          onCaptionChange={onCaptionChange}
          onReplacePhoto={onReplacePhoto}
        />
      ) : (
        <RecapPhotoCarousel
          entry={entry}
          expanded={expanded}
          onToggleExpanded={onToggleExpanded}
          layout={photoLayout}
        />
      )}
    </div>
  );
}

/** ----------------------------
 *  View carousel
 *  ---------------------------- */
function RecapPhotoCarousel({
  entry,
  expanded,
  onToggleExpanded,
  layout = "default",
}: {
  entry: RecapEntry;
  expanded: boolean;
  onToggleExpanded: () => void;
  layout?: "default" | "sheet";
}) {
  const total = entry.photos.length;
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const userNavRef = useRef(false);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    // Important: don't scroll the *page*/outer containers.
    // We only want to nudge the horizontal carousel, and only after user nav.
    if (!userNavRef.current) return;

    const scroller = scrollerRef.current;
    const item = itemRefs.current[activeIdx];
    if (!scroller || !item) return;

    scroller.scrollTo({ left: item.offsetLeft, behavior: "smooth" });
  }, [activeIdx]);

  const prev = () => {
    userNavRef.current = true;
    setActiveIdx((i) => (i - 1 + total) % total);
  };
  const next = () => {
    userNavRef.current = true;
    setActiveIdx((i) => (i + 1) % total);
  };
  const showNav = total > 1;

  return (
    <div className="relative w-full mx-auto max-w-full lg:max-w-[920px] 2xl:max-w-[1100px]">
      <div
        ref={scrollerRef}
        className={[
          "flex w-full min-w-0 overflow-x-auto",
          "snap-x snap-mandatory",
          "scroll-smooth",
          "gap-4 pb-2",
          "scrollbar-thin scrollbar-thumb-black/10 scrollbar-track-transparent",
        ].join(" ")}
      >
        {entry.photos.map((photoUrl, idx) => (
          <div
            key={`${entry.id}-photo-${idx}`}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            className="w-full flex-none min-w-0 snap-start"
          >
            <RecapPhotoCard
              entry={entry}
              photoUrl={photoUrl}
              photoIndex={idx}
              totalPhotos={total}
              expanded={expanded}
              onToggleExpanded={onToggleExpanded}
              layout={layout}
            />
          </div>
        ))}
      </div>

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
  mode = "view",
  layout = "default",
}: {
  entry: RecapEntry;
  photoUrl: string;
  photoIndex: number;
  totalPhotos: number;
  expanded: boolean;
  onToggleExpanded?: () => void;
  mode?: Mode;
  layout?: "default" | "sheet";
}) {
  const captionText =
    entry.captions?.[photoIndex] ??
    (photoIndex === 0 ? (entry.caption ?? "") : "");
  const canToggle = (captionText?.trim().length ?? 0) > 120;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  return (
    <>
      <article
        className={[
          "w-full",
          "overflow-hidden rounded-[28px] border border-black/15 bg-white shadow-sm",
        ].join(" ")}
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className={[
              layout === "sheet"
                ? // Bottom sheet: keep photo shorter so other UI stays visible
                  "relative mx-4 my-3 h-[32dvh] min-h-[240px] max-h-[420px] w-[calc(100%-2rem)]"
                : // Default: use more space (bigger photo, smaller margins)
                  "relative mx-4 my-4 aspect-[4/5] w-[calc(100%-2rem)]",
              // Desktop: keep the wider cinematic ratio
              "sm:m-6 sm:aspect-[16/9] sm:w-[calc(100%-3rem)]",
              "overflow-hidden rounded-2xl bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/30",
            ].join(" ")}
            aria-label="Open photo"
          >
            <ResolvedImage
              src={photoUrl}
              alt={`${entry.placeName} photo ${photoIndex + 1}`}
            />
            <div className="absolute left-4 top-4 rounded-full bg-white/40 px-3 py-1 text-[14px] font-bold text-white backdrop-blur">
              {photoIndex + 1}/{totalPhotos}
            </div>
            {!!entry.timeRangeText?.trim() && (
              <div
                className="absolute right-4 top-4 max-w-[70%] truncate rounded-full bg-black/45 px-3 py-1 text-[14px] font-bold text-white backdrop-blur"
                title={entry.timeRangeText}
              >
                {entry.timeRangeText}
              </div>
            )}
          </button>
        </div>

        <div className="px-6 pb-4">
          <div className="flex items-end justify-between gap-6">
            <p
              className={[
                "text-[22px] leading-[1.35] text-black/85",
                expanded ? "" : clampClass,
              ].join(" ")}
            >
              {captionText}
            </p>

            {mode === "view" && canToggle && (
              <button
                type="button"
                onClick={onToggleExpanded}
                className="shrink-0 text-[18px] font-extrabold text-black hover:opacity-80"
              >
                {expanded ? "See Less" : "See More"}
              </button>
            )}
          </div>
        </div>

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
            <button
              type="button"
              aria-label="More"
              className="hover:text-black"
            >
              <MoreVertical className="h-6 w-6" />
            </button>
          </div>
        </div>
      </article>

      {lightboxOpen && (
        <PhotoLightbox
          photos={entry.photos}
          initialIndex={photoIndex}
          title={entry.placeName}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

/** ----------------------------
 *  Edit list (rows)
 *  ---------------------------- */
function RecapPhotoEditList({
  entry,
  onCaptionChange,
  onReplacePhoto,
}: {
  entry: RecapEntry;
  onCaptionChange?: (entryId: string, photoIndex: number, next: string) => void;
  onReplacePhoto?: (entryId: string, photoIndex: number, file: File) => void;
}) {
  const normalizedCaptions = useMemo(() => {
    return Array.from({ length: entry.photos.length }, (_, i) => {
      const c = entry.captions?.[i];
      if (typeof c === "string") return c;
      if (i === 0 && entry.caption) return entry.caption;
      return "";
    });
  }, [entry.photos.length, entry.captions, entry.caption]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  return (
    <>
      <div className="space-y-4">
        {entry.photos.map((photoUrl, idx) => (
          <PhotoCaptionRow
            key={`${entry.id}-row-${idx}`}
            entryId={entry.id}
            photoUrl={photoUrl}
            index={idx}
            total={entry.photos.length}
            caption={normalizedCaptions[idx]}
            timeLabel={entry.timeRangeText}
            onCaptionChange={onCaptionChange}
            onReplacePhoto={onReplacePhoto}
            onOpenPhoto={() => {
              setLightboxIndex(idx);
              setLightboxOpen(true);
            }}
          />
        ))}
      </div>

      {lightboxOpen && (
        <PhotoLightbox
          photos={entry.photos}
          initialIndex={lightboxIndex}
          title={entry.placeName}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

function PhotoCaptionRow({
  entryId,
  photoUrl,
  index,
  total,
  caption,
  timeLabel,
  onCaptionChange,
  onReplacePhoto,
  onOpenPhoto,
}: {
  entryId: string;
  photoUrl: string;
  index: number;
  total: number;
  caption: string;
  timeLabel?: string;
  onCaptionChange?: (entryId: string, photoIndex: number, next: string) => void;
  onReplacePhoto?: (entryId: string, photoIndex: number, file: File) => void;
  onOpenPhoto: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex gap-4 items-center">
      <div className="relative h-[150px] w-[150px] shrink-0 overflow-hidden rounded-2xl bg-black/10">
        <button
          type="button"
          className="absolute inset-0"
          onClick={onOpenPhoto}
          aria-label={`Open photo ${index + 1} in viewer`}
        >
          <ResolvedImage src={photoUrl} alt="" />
        </button>

        <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-white/40 px-2 py-0.5 text-[12px] font-bold text-white backdrop-blur">
          {index + 1}/{total}
        </div>

        {!!timeLabel?.trim() && (
          <div
            className="pointer-events-none absolute bottom-2 right-2 max-w-[90%] truncate rounded-full bg-black/45 px-2 py-0.5 text-[12px] font-bold text-white backdrop-blur"
            title={timeLabel}
          >
            {timeLabel}
          </div>
        )}

        <button
          type="button"
          className="absolute bottom-2 left-2 rounded-full bg-white/70 px-2 py-1 text-[12px] font-bold text-black/80 backdrop-blur hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            fileRef.current?.click();
          }}
          aria-label={`Replace photo ${index + 1}`}
        >
          Replace
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onReplacePhoto?.(entryId, index, file);
          e.currentTarget.value = "";
        }}
      />

      <div className="w-full">
        <TextRow
          label=""
          value={caption}
          multiline
          placeholder="Write a caption"
          onChange={(v) => onCaptionChange?.(entryId, index, v)}
        />
      </div>
    </div>
  );
}

/** ----------------------------
 *  Resolved image (supports idb:<key>)
 *  ---------------------------- */
function ResolvedImage({ src, alt }: { src: string; alt: string }) {
  const [resolved, setResolved] = useState<string>(src);
  const revokeRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (revokeRef.current) {
        URL.revokeObjectURL(revokeRef.current);
        revokeRef.current = null;
      }

      if (!src?.startsWith("idb:")) {
        setResolved(src);
        return;
      }

      const key = src.replace(/^idb:/, "");
      const blob = await idbGetBlob(key);
      if (!blob) {
        setResolved("");
        return;
      }

      const url = URL.createObjectURL(blob);
      revokeRef.current = url;
      if (!cancelled) setResolved(url);
    }

    run();
    return () => {
      cancelled = true;
      if (revokeRef.current) {
        URL.revokeObjectURL(revokeRef.current);
        revokeRef.current = null;
      }
    };
  }, [src]);

  if (!resolved) return <div className="h-full w-full bg-black/10" />;

  //  blob은 img로 (안전)
  if (resolved.startsWith("blob:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  //  일반 url은 next/image
  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 90vw, 680px"
    />
  );
}
