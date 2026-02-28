"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  MapPin,
  Bookmark,
  Link2,
  Heart,
  MessageSquare,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Eye,
  EyeOff,
} from "lucide-react";

import PhotoLightbox from "@/components/ui/PhotoLightbox";
import { idbGetBlob } from "@/views/Profile/Trip/edit/utils/imageIdb";
import { normalizeExternalUrl, openExternalUrl } from "@/utils/externalLinks";

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
  originalPlaceName?: string;
  /** Optional place deep link (e.g., Google Maps / website). */
  externalUrl?: string;
  timeRangeText: string;
  categoryLabel?: string;
  liked?: boolean;
  likeCount: number;
  commentCount: number;

  /** Place-level story (not tied to any specific photo). */
  placeStory?: string;

  // 기존 단일 캡션 호환
  caption?: string;

  // 사진별 캡션
  captions?: string[];

  // 사진: remote url or "idb:<key>"
  photos: string[];

  coordinate?: { latitude: number; longitude: number };
  markerRole?: "start" | "end" | "poi";
  visitIndex?: number;
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
    avatarUrl?: string;
    placesCount?: number;
    lastEditedAt?: string;
  };
  days: RecapDay[];
};

type Mode = "view" | "edit";

type Props = {
  dayIndex: number;
  title: string;
  entries: RecapEntry[];
  mode?: Mode;

  onPlaceStoryChange?: (entryId: string, next: string) => void;
  onPlaceNameChange?: (entryId: string, next: string) => void;
  onTogglePlaceHide?: (entryId: string) => void;
  onCaptionChange?: (entryId: string, photoIndex: number, next: string) => void;
  onRemovePhoto?: (entryId: string, photoIndex: number) => void;

  /** Edit mode: open the Mapbox place editor popup for a given entry */
  onOpenPlaceMapEditor?: (entryId: string) => void;

  onEntryMount?: (entryId: string, el: HTMLDivElement | null) => void;
  onEditBlog?: (entryId?: string) => void;
  hiddenCount?: number;
  onOpenHiddenPlaces?: () => void;
};

// Collapsed caption preview:
// - mobile: 3 lines
// - sm+: 4 lines
const collapsedClampClass = "line-clamp-3 sm:line-clamp-4";

/** ----------------------------
 *  Day section
 *  ---------------------------- */
export function RecapBlogDaySection({
  dayIndex,
  title,
  entries,
  mode = "view",
  onPlaceStoryChange,
  onPlaceNameChange,
  onTogglePlaceHide,
  onCaptionChange,
  onRemovePhoto,
  onOpenPlaceMapEditor,
  onEntryMount,
  onEditBlog,
  hiddenCount,
  onOpenHiddenPlaces,
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
    <section className="space-y-8">
      <div className="flex flex-col items-start gap-1 w-full">
        <span className="text-[14px] font-bold text-black/30 tracking-[0.2em] uppercase">
          Day {dayIndex}
        </span>
        <div className="flex items-center justify-between w-full">
          <h2 className='text-black font-["Inter"] text-[32px] sm:text-[44px] font-extrabold tracking-tight leading-[1.1]'>
            {title}
          </h2>
          {mode === "edit" && (hiddenCount ?? 0) > 0 && (
            <button
              type="button"
              onClick={onOpenHiddenPlaces}
              className="group flex items-center gap-1.5 shrink-0 rounded-full border border-black/10 bg-black/[0.03] px-3.5 py-1.5 text-[14px] font-bold text-black/70 hover:bg-black/[0.06] hover:text-black transition-colors"
            >
              <EyeOff className="h-4 w-4 text-black/40 group-hover:text-black/60 transition-colors" />
              Hidden Places ({hiddenCount})
            </button>
          )}
        </div>
        <div className="mt-4 h-[1px] w-12 bg-black/10" />
      </div>

      <div className="space-y-6">
        {entries.map((entry) => {
          const entryRole = entry.markerRole ?? "poi";
          return (
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
                entryRole={entryRole}
                onPlaceStoryChange={onPlaceStoryChange}
                onPlaceNameChange={onPlaceNameChange}
                onTogglePlaceHide={onTogglePlaceHide}
                onCaptionChange={onCaptionChange}
                onRemovePhoto={onRemovePhoto}
                onOpenPlaceMapEditor={onOpenPlaceMapEditor}
                onEditBlog={onEditBlog}
              />
            </div>
          );
        })}
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
  entryRole = "poi",
  onPlaceStoryChange,
  onPlaceNameChange,
  onTogglePlaceHide,
  onCaptionChange,
  onRemovePhoto,
  onOpenPlaceMapEditor,
  onEditBlog,
  photoLayout = "default",
}: {
  entry: RecapEntry;
  expanded: boolean;
  onToggleExpanded: () => void;
  mode: Mode;
  entryRole?: "start" | "end" | "poi";
  onPlaceStoryChange?: (entryId: string, next: string) => void;
  onPlaceNameChange?: (entryId: string, next: string) => void;
  onTogglePlaceHide?: (entryId: string) => void;
  onCaptionChange?: (entryId: string, photoIndex: number, next: string) => void;
  onRemovePhoto?: (entryId: string, photoIndex: number) => void;
  onOpenPlaceMapEditor?: (entryId: string) => void;
  onEditBlog?: (entryId?: string) => void;
  photoLayout?: "default" | "sheet";
}) {
  const placeStoryTrimmed = (entry.placeStory ?? "").trim();
  const [placeStoryExpanded, setPlaceStoryExpanded] = useState(false);
  const canTogglePlaceStory = placeStoryTrimmed.length > 160;

  return (
    <div
      className={[
        "space-y-5 bg-white rounded-2xl border border-slate-100 p-6 md:p-8",
        "shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]",
        "transition-shadow duration-300",
        mode === "edit"
          ? "hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.10)] focus-within:ring-2 focus-within:ring-blue-500/20"
          : "",
      ].join(" ")}
    >
      {/* Header: Place Name and Time/Category/Actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-3 sm:gap-4 w-full min-w-0">
              {typeof entry.visitIndex === "number" && (
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white sm:h-8 sm:w-8 ${
                    entryRole === "start"
                      ? "bg-green-500"
                      : entryRole === "end"
                        ? "bg-orange-500"
                        : "bg-blue-500"
                  }`}
                >
                  {entry.visitIndex}
                </div>
              )}
              <div className="min-w-0 w-full flex-1">
                {mode === "edit" ? (
                  <button
                    type="button"
                    onClick={() => onOpenPlaceMapEditor?.(entry.id)}
                    className="group flex items-center gap-2 text-left w-full rounded-lg px-1 py-0.5 hover:bg-black/[0.03] transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    title="Click to open map and edit location"
                  >
                    <span className="truncate text-[24px] sm:text-[32px] font-extrabold text-black tracking-tight">
                      {entry.placeName || (
                        <span className="text-black/30">Enter place name…</span>
                      )}
                    </span>
                    <Pencil className="shrink-0 h-4 w-4 text-black/30 group-hover:text-black/60 transition-colors mt-1" />
                  </button>
                ) : (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      entry.placeName,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <h3 className="truncate text-[24px] sm:text-[32px] font-extrabold text-black tracking-tight">
                      {entry.placeName}
                    </h3>
                  </a>
                )}
              </div>
            </div>
            {/* If no photos exist, keep time visible here as fallback */}
            {(!entry.photos || entry.photos.length === 0) &&
              !!entry.timeRangeText?.trim() && (
                <div
                  className={`text-[14px] font-bold text-black/30 tracking-tight ${typeof entry.visitIndex === "number" ? "pl-10 sm:pl-12" : ""}`}
                >
                  {entry.timeRangeText}
                </div>
              )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {entry.categoryLabel && (
            <span className="hidden sm:inline-block rounded-full bg-sky-50 px-3 py-1 text-[14px] font-semibold text-sky-600">
              {entry.categoryLabel}
            </span>
          )}

          {mode === "edit" && (
            <button
              type="button"
              onClick={() => onTogglePlaceHide?.(entry.id)}
              className={[
                "inline-flex h-11 px-4 items-center justify-center rounded-full text-sm font-bold transition-colors gap-1.5",
                (entry as any).status === "hidden"
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "bg-red-50 text-red-600 hover:bg-red-100",
              ].join(" ")}
            >
              {(entry as any).status === "hidden" ? (
                <>
                  Unhide <Eye className="w-4 h-4 ml-0.5" />
                </>
              ) : (
                <>
                  Hide <EyeOff className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Place Story Section */}
      {mode === "edit" ? (
        <div className="w-full">
          <textarea
            value={entry.placeStory ?? ""}
            placeholder="Write a story for this place..."
            rows={3}
            onChange={(e) => onPlaceStoryChange?.(entry.id, e.target.value)}
            className="w-full resize-none rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-lg leading-relaxed text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition min-h-[80px]"
          />
        </div>
      ) : (
        placeStoryTrimmed && (
          <div className="w-full max-w-[920px] 2xl:max-w-[1100px]">
            <div className="rounded-2xl bg-black/5 px-6 py-5">
              <p
                className={[
                  "text-[20px] leading-[1.55] text-black/80",
                  placeStoryExpanded ? "" : "line-clamp-3",
                ].join(" ")}
              >
                {placeStoryTrimmed}
              </p>
              {canTogglePlaceStory && (
                <button
                  type="button"
                  onClick={() => setPlaceStoryExpanded((v) => !v)}
                  className="mt-3 text-[16px] font-extrabold text-black hover:opacity-80"
                >
                  {expanded ? "See Less" : "See More"}
                </button>
              )}
            </div>
          </div>
        )
      )}

      {/* Photo Section */}
      {mode === "edit" ? (
        <RecapPhotoEditList entry={entry} onCaptionChange={onCaptionChange} />
      ) : (
        <RecapPhotoCarousel
          entry={entry}
          expanded={expanded}
          onToggleExpanded={onToggleExpanded}
          layout={photoLayout}
          entryRole={entryRole}
          onEditBlog={onEditBlog}
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
  entryRole = "poi",
  onEditBlog,
}: {
  entry: RecapEntry;
  expanded: boolean;
  onToggleExpanded: () => void;
  layout?: "default" | "sheet";
  entryRole?: "start" | "end" | "poi";
  onEditBlog?: (entryId?: string) => void;
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
      {/* Start / End label pill above the first photo */}
      {entryRole !== "poi" && (
        <div className="mb-2">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-[13px] font-bold text-white"
            style={{
              background:
                entryRole === "start"
                  ? "rgb(34, 197, 94)" /* green-500 */
                  : "rgb(249, 115, 22)" /* orange-500 */,
            }}
          >
            {entryRole === "start" ? "Start" : "End"}
          </span>
        </div>
      )}

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
              onEditBlog={onEditBlog}
            />
          </div>
        ))}
      </div>

      {showNav && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 shadow-sm backdrop-blur hover:bg-black/70 transition-colors"
            aria-label="Previous card"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 shadow-sm backdrop-blur hover:bg-black/70 transition-colors"
            aria-label="Next card"
          >
            <ChevronRight className="h-6 w-6 text-white" />
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
  onEditBlog,
}: {
  entry: RecapEntry;
  photoUrl: string;
  photoIndex: number;
  totalPhotos: number;
  expanded: boolean;
  onToggleExpanded?: () => void;
  mode?: Mode;
  layout?: "default" | "sheet";
  onEditBlog?: (entryId?: string) => void;
}) {
  const captionText =
    entry.captions?.[photoIndex] ??
    (photoIndex === 0 ? (entry.caption ?? "") : "");
  const captionTrimmed = captionText?.trim() ?? "";

  const [captionEl, setCaptionEl] = useState<HTMLParagraphElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);
  const placeExternalUrl = useMemo(
    () => String(entry.externalUrl ?? "").trim(),
    [entry.externalUrl],
  );

  const measureTruncation = useCallback(() => {
    if (!captionEl) return;
    if (expanded) {
      // Expanded view is never "truncated" (we still show "See Less" if it was truncated).
      setIsTruncated(false);
      return;
    }

    // With line-clamp + overflow hidden, scrollHeight/scrollWidth still represent full content.
    const next =
      captionEl.scrollHeight > captionEl.clientHeight + 1 ||
      captionEl.scrollWidth > captionEl.clientWidth + 1;
    setIsTruncated(next);
  }, [captionEl, expanded]);

  useLayoutEffect(() => {
    // Avoid synchronous setState in effect body (lint rule).
    const raf = requestAnimationFrame(() => measureTruncation());
    return () => cancelAnimationFrame(raf);
  }, [measureTruncation, captionTrimmed, layout]);

  useEffect(() => {
    if (!captionEl) return;
    const ro = new ResizeObserver(() => measureTruncation());
    ro.observe(captionEl);
    return () => ro.disconnect();
  }, [captionEl, measureTruncation]);

  const canToggle = captionTrimmed.length > 0 && (expanded || isTruncated);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  return (
    <>
      <article
        className={[
          "w-full",
          "overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]",
        ].join(" ")}
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className={[
              layout === "sheet"
                ? "relative mx-4 my-3 h-[32dvh] min-h-[240px] max-h-[420px] w-[calc(100%-2rem)]"
                : "relative mx-4 my-4 aspect-[4/5] w-[calc(100%-2rem)]",
              "sm:m-6 sm:aspect-[16/9] sm:w-[calc(100%-3rem)]",
              "overflow-hidden rounded-[24px] bg-black/[0.03] focus:outline-none focus:ring-2 focus:ring-black/10",
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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="relative min-w-0 flex-1">
              <p
                ref={setCaptionEl}
                onClick={() => setLightboxOpen(true)}
                className={[
                  "text-[24px] font-medium leading-[1.3] text-black/90 font-['Inter'] tracking-tight cursor-pointer",
                  expanded ? "" : collapsedClampClass,
                ].join(" ")}
              >
                {captionTrimmed}
              </p>

              {!expanded && isTruncated && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent"
                />
              )}
            </div>

            {mode === "view" && canToggle && (
              <button
                type="button"
                onClick={onToggleExpanded}
                className="self-end shrink-0 text-[18px] font-extrabold text-black hover:opacity-80"
              >
                {expanded ? "See Less" : "See More"}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-5 border-t border-black/10 px-6 py-4">
          <button
            type="button"
            className="inline-flex items-center text-black/70 hover:text-black mb-[2px]"
            aria-label="Open place link"
            onClick={() => {
              if (!placeExternalUrl) return;
              const normalized = normalizeExternalUrl(placeExternalUrl);
              if (!normalized) return;
              // Mark that we intentionally opened an external page, so the recap view can
              // preserve UI state (avoid refetch/reset) when the user returns.
              try {
                window.sessionStorage.setItem(
                  `ls:externalNav:tripRecap`,
                  String(Date.now()),
                );
              } catch {
                // ignore
              }
              openExternalUrl(normalized);
            }}
            disabled={!placeExternalUrl}
            title={placeExternalUrl ? "Open link" : "No link available"}
          >
            <Link2 className="h-6 w-6" />
          </button>

          <div
            className="relative flex items-center justify-center text-[20px] font-semibold text-black/80"
            ref={menuRef}
          >
            <button
              type="button"
              aria-label="More"
              className="inline-flex items-center text-black/70 hover:text-black"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical className="h-6 w-6" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-3 w-56 rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden z-20">
                <button
                  type="button"
                  className="w-full px-5 py-3.5 text-left text-[14px] font-bold text-black border-b border-black/5 hover:bg-black/5 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Edit Place name
                </button>
                <button
                  type="button"
                  className="w-full px-5 py-3.5 text-left text-[14px] font-bold text-black border-b border-black/5 hover:bg-black/5 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Manage Photos
                </button>
                <button
                  type="button"
                  className="w-full px-5 py-3.5 text-left text-[14px] font-bold text-black border-b border-black/5 hover:bg-black/5 transition-colors"
                  onClick={() => {
                    setMenuOpen(false);
                    onEditBlog?.(entry.id);
                  }}
                >
                  Edit Caption & Details
                </button>
                <button
                  type="button"
                  className="w-full px-5 py-3.5 text-left text-[14px] font-bold text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Hide from blog
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      {lightboxOpen && (
        <PhotoLightbox
          photos={entry.photos}
          initialIndex={photoIndex}
          title={entry.placeName}
          dateTime={entry.timeRangeText}
          captions={entry.captions}
          caption={entry.caption}
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
}: {
  entry: RecapEntry;
  onCaptionChange?: (entryId: string, photoIndex: number, next: string) => void;
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
          dateTime={entry.timeRangeText}
          captions={entry.captions}
          caption={entry.caption}
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
  onOpenPhoto,
}: {
  entryId: string;
  photoUrl: string;
  index: number;
  total: number;
  caption: string;
  timeLabel?: string;
  onCaptionChange?: (entryId: string, photoIndex: number, next: string) => void;
  onOpenPhoto: () => void;
}) {
  return (
    <div className="flex gap-4 items-center rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-xl bg-black/10">
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
      </div>

      <div className="w-full">
        <textarea
          value={caption}
          placeholder="Write a caption"
          rows={2}
          onChange={(e) => onCaptionChange?.(entryId, index, e.target.value)}
          className="w-full resize-none rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-base leading-relaxed text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
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
