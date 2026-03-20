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
  Link2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Eye,
  EyeOff,
  Images,
  X,
  MoreVertical,
} from "lucide-react";
import { createPortal } from "react-dom";

import PhotoLightbox from "@/components/ui/PhotoLightbox";
import { idbGetBlob } from "@/views/Profile/Trip/edit/utils/imageIdb";
import { normalizeExternalUrl, openExternalUrl } from "@/utils/externalLinks";
import { haversineMiles } from "@/lib/haversine";

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

  /** All photos including unselected ones for the "Manage Photos" popup */
  allPhotos?: { url: string; selected: boolean }[];

  coordinate?: { latitude: number; longitude: number };
  markerRole?: "start" | "end" | "poi";
  visitIndex?: number;

  /** Hidden photos for this entry (edit mode only). */
  hiddenPhotos?: { url: string; caption: string; originalIndex: number }[];
};

export type RecapDay = {
  dayIndex: number;
  title: string;
  /** Day-level story (shown above places for this day). */
  story?: string;
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
  /** Day-level story (from trip-recap API). */
  story?: string;
  entries: RecapEntry[];
  mode?: Mode;

  /** Edit mode: change day story */
  onDayStoryChange?: (next: string) => void;
  onPlaceStoryChange?: (entryId: string, next: string) => void;
  onPlaceNameChange?: (entryId: string, next: string) => void;
  onTogglePlaceHide?: (entryId: string) => void;
  onCaptionChange?: (entryId: string, photoIndex: number, next: string) => void;
  onRemovePhoto?: (entryId: string, photoIndex: number) => void;
  /** Edit mode: hide a photo by its current visible index */
  onHidePhoto?: (entryId: string, photoIndex: number) => void;
  /** Edit mode: restore a hidden photo by its original (pre-hide) index */
  onRestorePhoto?: (entryId: string, originalPhotoIndex: number) => void;

  /** Edit mode: open the Mapbox place editor popup for a given entry */
  onOpenPlaceMapEditor?: (entryId: string) => void;

  onEntryMount?: (entryId: string, el: HTMLDivElement | null) => void;
  onEditBlog?: (entryId?: string) => void;
  hiddenCount?: number;
  onOpenHiddenPlaces?: () => void;
  onManagePhotosConfirm?: (entryId: string, selectedUrls: string[]) => void;
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
  story,
  entries,
  mode = "view",
  onDayStoryChange,
  onPlaceStoryChange,
  onPlaceNameChange,
  onTogglePlaceHide,
  onCaptionChange,
  onRemovePhoto,
  onHidePhoto,
  onRestorePhoto,
  onOpenPlaceMapEditor,
  onEntryMount,
  onEditBlog,
  hiddenCount,
  onOpenHiddenPlaces,
  onManagePhotosConfirm,
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

      {/* Day story: view or edit */}
      {(story != null && story !== "") ||
      (mode === "edit" && onDayStoryChange) ? (
        <div className="w-full">
          {mode === "edit" && onDayStoryChange ? (
            <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-black/40 mb-2">
                Day story
              </p>
              <div className="relative">
                <textarea
                  value={story ?? ""}
                  onChange={(e) => onDayStoryChange(e.target.value)}
                  placeholder="What happened this day? (optional)"
                  className="min-h-[80px] w-full resize-y overflow-auto rounded-lg border border-black/10 bg-white px-3 py-2 text-[15px] text-black placeholder:text-black/40 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  rows={3}
                />
                <span
                  className="pointer-events-none absolute bottom-[5px] right-[5px] flex flex-col gap-[3px] opacity-30"
                  aria-hidden="true"
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="flex gap-[3px]"
                      style={{ marginLeft: i * 3 }}
                    >
                      {Array.from({ length: 3 - i }).map((_, j) => (
                        <span
                          key={j}
                          className="block h-[2.5px] w-[2.5px] rounded-full bg-slate-500"
                        />
                      ))}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[15px] text-black/80 leading-relaxed whitespace-pre-wrap">
              {story}
            </p>
          )}
        </div>
      ) : null}

      <div className="flex flex-col w-full gap-2 sm:gap-4">
        {entries.map((entry, idx) => {
          const entryRole = entry.markerRole ?? "poi";

          let distanceMiles: number | null = null;
          if (idx > 0) {
            const prev = entries[idx - 1];
            if (prev.coordinate && entry.coordinate) {
              distanceMiles = haversineMiles(
                prev.coordinate.latitude,
                prev.coordinate.longitude,
                entry.coordinate.latitude,
                entry.coordinate.longitude,
              );
            }
          }

          return (
            <React.Fragment key={entry.id}>
              {idx > 0 && (
                <div className="flex flex-col items-start w-full py-1 sm:py-2">
                  {distanceMiles !== null && distanceMiles > 0 ? (
                    <div className="flex items-center gap-3">
                      <div className="w-[2px] h-6 bg-black/10 rounded-full ml-3" />
                      <span className="text-[14px] font-bold text-black/30 tracking-[0.2em] uppercase">
                        {distanceMiles < 0.1
                          ? "<0.1"
                          : distanceMiles.toFixed(1)}{" "}
                        mi
                      </span>
                    </div>
                  ) : (
                    <div className="h-4" />
                  )}
                </div>
              )}
              <div
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
                  onHidePhoto={onHidePhoto}
                  onRestorePhoto={onRestorePhoto}
                  onOpenPlaceMapEditor={onOpenPlaceMapEditor}
                  onEditBlog={onEditBlog}
                  onManagePhotosConfirm={onManagePhotosConfirm}
                />
              </div>
            </React.Fragment>
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
  onManagePhotosConfirm,
}: {
  entry: RecapEntry;
  className?: string;
  variant?: "default" | "sheet";
  onManagePhotosConfirm?: (entryId: string, selectedUrls: string[]) => void;
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
        onManagePhotosConfirm={onManagePhotosConfirm}
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
  onHidePhoto,
  onRestorePhoto,
  onOpenPlaceMapEditor,
  onEditBlog,
  photoLayout = "default",
  onManagePhotosConfirm,
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
  onHidePhoto?: (entryId: string, photoIndex: number) => void;
  onRestorePhoto?: (entryId: string, originalPhotoIndex: number) => void;
  onOpenPlaceMapEditor?: (entryId: string) => void;
  onEditBlog?: (entryId?: string) => void;
  photoLayout?: "default" | "sheet";
  onManagePhotosConfirm?: (entryId: string, selectedUrls: string[]) => void;
}) {
  const placeStoryTrimmed = (entry.placeStory ?? "").trim();
  const [placeStoryExpanded, setPlaceStoryExpanded] = useState(false);
  const canTogglePlaceStory = placeStoryTrimmed.length > 0;

  const [menuOpen, setMenuOpen] = useState(false);
  const [isManagePhotosPopupOpen, setIsManagePhotosPopupOpen] = useState(false);
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

  return (
    <>
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
                          <span className="text-black/30">
                            Enter place name…
                          </span>
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

          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-black/70 hover:text-black"
              aria-label="Open place link"
              onClick={() => {
                const targetUrl =
                  placeExternalUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(entry.placeName)}`;
                const normalized = normalizeExternalUrl(targetUrl);
                if (!normalized) return;
                try {
                  window.sessionStorage.setItem(
                    `ls:externalNav:tripRecap`,
                    String(Date.now()),
                  );
                } catch {
                  /* ignore */
                }
                openExternalUrl(normalized);
              }}
              title={placeExternalUrl ? "Open link" : "Open in Google Maps"}
            >
              <Link2 className="h-6 w-6" />
            </button>

            {mode === "view" && (
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
                  <div className="absolute right-0 top-full mt-3 w-56 rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden z-20">
                    <button
                      type="button"
                      className="w-full px-5 py-3.5 text-left text-[14px] font-bold text-black border-b border-black/5 hover:bg-black/5 transition-colors"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenPlaceMapEditor?.(entry.id);
                      }}
                    >
                      Edit Place Name
                    </button>
                    <button
                      type="button"
                      className="w-full px-5 py-3.5 text-left text-[14px] font-bold text-black border-b border-black/5 hover:bg-black/5 transition-colors"
                      onClick={() => {
                        setMenuOpen(false);
                        setIsManagePhotosPopupOpen(true);
                      }}
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
                      onClick={() => {
                        setMenuOpen(false);
                        onTogglePlaceHide?.(entry.id);
                      }}
                    >
                      Hide from blog
                    </button>
                  </div>
                )}
              </div>
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

        {/* Start/End and Category labels — shown above place story */}
        {(entryRole !== "poi" || entry.categoryLabel) && (
          <div className="flex items-center gap-2">
            {entryRole !== "poi" && (
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-[13px] font-bold text-white"
                style={{
                  background:
                    entryRole === "start"
                      ? "rgb(34, 197, 94)"
                      : "rgb(249, 115, 22)",
                }}
              >
                {entryRole === "start" ? "Start" : "End"}
              </span>
            )}
            {entry.categoryLabel && (
              <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-[13px] font-bold text-sky-600 shadow-sm">
                {entry.categoryLabel}
              </span>
            )}
          </div>
        )}

        {/* Place Story Section */}
        {mode === "edit" ? (
          <div className="w-full">
            <div className="relative">
              <textarea
                value={entry.placeStory ?? ""}
                placeholder="Write a story for this place..."
                rows={3}
                onChange={(e) => onPlaceStoryChange?.(entry.id, e.target.value)}
                className="w-full resize-y overflow-auto rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-lg leading-relaxed text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition min-h-[80px]"
              />
              {/* Visual resize-grip hint */}
              <span
                className="pointer-events-none absolute bottom-[5px] right-[5px] flex flex-col gap-[3px] opacity-30"
                aria-hidden="true"
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="flex gap-[3px]"
                    style={{ marginLeft: i * 3 }}
                  >
                    {Array.from({ length: 3 - i }).map((_, j) => (
                      <span
                        key={j}
                        className="block h-[2.5px] w-[2.5px] rounded-full bg-slate-500"
                      />
                    ))}
                  </span>
                ))}
              </span>
            </div>
          </div>
        ) : (
          placeStoryTrimmed && (
            <div className="w-full max-w-[920px] 2xl:max-w-[1100px]">
              <div className="rounded-2xl bg-black/5 px-6 py-5">
                <p className="text-[24px] font-medium leading-[1.3] text-black font-['Inter'] tracking-tight">
                  {placeStoryTrimmed}
                </p>
              </div>
            </div>
          )
        )}

        {/* Photo Section */}
        {mode === "edit" ? (
          <RecapPhotoEditList
            entry={entry}
            onCaptionChange={onCaptionChange}
            onHidePhoto={onHidePhoto}
            onRestorePhoto={onRestorePhoto}
          />
        ) : (
          <RecapPhotoCarousel
            entry={entry}
            expanded={expanded}
            onToggleExpanded={onToggleExpanded}
            layout={photoLayout}
            entryRole={entryRole}
            onEditBlog={onEditBlog}
            onOpenPlaceMapEditor={onOpenPlaceMapEditor}
          />
        )}
      </div>

      {isManagePhotosPopupOpen && (
        <ManagePhotosPopup
          placeName={entry.placeName}
          allPhotos={
            entry.allPhotos ||
            entry.photos.map((url) => ({ url, selected: true }))
          }
          onClose={() => setIsManagePhotosPopupOpen(false)}
          onConfirm={(selectedUrls) => {
            onManagePhotosConfirm?.(entry.id, selectedUrls);
            setIsManagePhotosPopupOpen(false);
          }}
        />
      )}
    </>
  );
}

function RecapPhotoCarousel({
  entry,
  expanded,
  onToggleExpanded,
  layout = "default",
  entryRole = "poi",
  onEditBlog,
  onOpenPlaceMapEditor,
}: {
  entry: RecapEntry;
  expanded: boolean;
  onToggleExpanded: () => void;
  layout?: "default" | "sheet";
  entryRole?: "start" | "end" | "poi";
  onEditBlog?: (entryId?: string) => void;
  onOpenPlaceMapEditor?: (entryId: string) => void;
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
          "gap-3 sm:gap-4",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        ].join(" ")}
      >
        {entry.photos.map((photoUrl, idx) => (
          <div
            key={`${entry.id}-photo-${idx}`}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            className={[
              "flex-none min-w-0 snap-center sm:snap-start",
              total > 1 ? "w-[92%] sm:w-[88%]" : "w-full",
            ].join(" ")}
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
              onOpenPlaceMapEditor={onOpenPlaceMapEditor}
              onPhotoClick={() => {
                if (total <= 1) return false;
                const scroller = scrollerRef.current;
                const item = itemRefs.current[idx];
                if (!scroller || !item) return false;

                const scrollerWidth = scroller.clientWidth;
                const scrollLeft = scroller.scrollLeft;
                const itemLeft = item.offsetLeft;
                const itemWidth = item.offsetWidth;

                const isFullyVisible =
                  itemLeft >= scrollLeft - 5 &&
                  itemLeft + itemWidth <= scrollLeft + scrollerWidth + 5;

                if (!isFullyVisible) {
                  userNavRef.current = true;
                  setActiveIdx(idx);
                  // Force scroll immediately in case activeIdx was already idx (e.g., from manual scroll)
                  scroller.scrollTo({ left: itemLeft, behavior: "smooth" });
                  return true;
                }
                return false;
              }}
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
  onOpenPlaceMapEditor,
  onPhotoClick,
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
  onOpenPlaceMapEditor?: (entryId: string) => void;
  onPhotoClick?: () => boolean;
}) {
  const captionText =
    entry.captions?.[photoIndex] ??
    (photoIndex === 0 ? (entry.caption ?? "") : "");
  const captionTrimmed = captionText?.trim() ?? "";

  const [captionEl, setCaptionEl] = useState<HTMLParagraphElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const measureTruncation = useCallback(() => {
    if (!captionEl) return;
    if (expanded) {
      setIsTruncated(false);
      return;
    }
    const next =
      captionEl.scrollHeight > captionEl.clientHeight + 1 ||
      captionEl.scrollWidth > captionEl.clientWidth + 1;
    setIsTruncated(next);
  }, [captionEl, expanded]);

  useLayoutEffect(() => {
    const raf = requestAnimationFrame(() => measureTruncation());
    return () => cancelAnimationFrame(raf);
  }, [measureTruncation, captionTrimmed, layout]);

  useEffect(() => {
    if (!captionEl) return;
    const ro = new ResizeObserver(() => measureTruncation());
    ro.observe(captionEl);
    return () => ro.disconnect();
  }, [captionEl, measureTruncation]);

  // Show See More when text is long enough to likely exceed 3 lines at 24px.
  // We avoid scrollHeight measurement because line-clamp + overflow:hidden causes
  // scrollHeight === clientHeight in most browsers, making detection unreliable.
  const CLAMP_CHAR_THRESHOLD = 120;
  const canToggle = captionTrimmed.length > CLAMP_CHAR_THRESHOLD || expanded;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  return (
    <>
      <article className="w-full">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (onPhotoClick && onPhotoClick()) return;
              setLightboxOpen(true);
            }}
            className={[
              layout === "sheet"
                ? "relative h-[32dvh] min-h-[240px] max-h-[420px] w-full"
                : "relative aspect-[4/5] w-full sm:aspect-[16/9]",
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

        {captionTrimmed && (
          <div className="pt-3 pb-1">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p
                onClick={() => setLightboxOpen(true)}
                className="text-[24px] font-medium leading-[1.3] text-black font-['Inter'] tracking-tight cursor-pointer"
              >
                {captionTrimmed}
              </p>
            </div>
          </div>
        )}
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
  onHidePhoto,
  onRestorePhoto,
}: {
  entry: RecapEntry;
  onCaptionChange?: (entryId: string, photoIndex: number, next: string) => void;
  onHidePhoto?: (entryId: string, photoIndex: number) => void;
  onRestorePhoto?: (entryId: string, originalPhotoIndex: number) => void;
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
  const [manageOpen, setManageOpen] = useState(false);

  const hiddenPhotos = entry.hiddenPhotos ?? [];

  return (
    <div className="w-full flex flex-col">
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
            onHidePhoto={
              onHidePhoto ? () => onHidePhoto(entry.id, idx) : undefined
            }
          />
        ))}
      </div>

      {/* Manage Photos button — only shown when there are hidden photos */}
      {hiddenPhotos.length > 0 && (
        <button
          type="button"
          onClick={() => setManageOpen(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-3 text-[14px] font-bold text-slate-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <Images className="h-4 w-4" />
          Manage Photos
          <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white">
            {hiddenPhotos.length}
          </span>
        </button>
      )}

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

      {manageOpen && (
        <ManagePhotosModal
          placeName={entry.placeName}
          hiddenPhotos={hiddenPhotos}
          onRestorePhoto={(originalIndex) => {
            onRestorePhoto?.(entry.id, originalIndex);
          }}
          onRestoreAll={() => {
            hiddenPhotos.forEach((h) =>
              onRestorePhoto?.(entry.id, h.originalIndex),
            );
            setManageOpen(false);
          }}
          onClose={() => setManageOpen(false)}
        />
      )}
    </div>
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
  onHidePhoto,
}: {
  entryId: string;
  photoUrl: string;
  index: number;
  total: number;
  caption: string;
  timeLabel?: string;
  onCaptionChange?: (entryId: string, photoIndex: number, next: string) => void;
  onOpenPhoto: () => void;
  onHidePhoto?: () => void;
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

        {/* Photo index badge — top left */}
        <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-white/40 px-2 py-0.5 text-[12px] font-bold text-white backdrop-blur">
          {index + 1}/{total}
        </div>

        {/* Hide photo button — top right */}
        {onHidePhoto && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onHidePhoto();
            }}
            title="Hide this photo from the blog"
            className="absolute right-2 top-2 z-10 flex items-center justify-center rounded-full bg-black/50 p-1.5 text-white backdrop-blur hover:bg-red-500 transition-colors"
            aria-label="Hide photo"
          >
            <EyeOff className="h-3.5 w-3.5" />
          </button>
        )}

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
        <div className="relative">
          <textarea
            value={caption}
            placeholder="Write a caption"
            rows={2}
            onChange={(e) => onCaptionChange?.(entryId, index, e.target.value)}
            className="w-full resize-y overflow-auto rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-base leading-relaxed text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
          />
          {/* Visual resize-grip hint */}
          <span
            className="pointer-events-none absolute bottom-[5px] right-[5px] flex flex-col gap-[3px] opacity-30"
            aria-hidden="true"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="flex gap-[3px]"
                style={{ marginLeft: i * 3 }}
              >
                {Array.from({ length: 3 - i }).map((_, j) => (
                  <span
                    key={j}
                    className="block h-[2.5px] w-[2.5px] rounded-full bg-slate-500"
                  />
                ))}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

/** ----------------------------
 *  Manage Photos Modal
 *  ---------------------------- */
export function ManagePhotosModal({
  placeName,
  hiddenPhotos,
  onRestorePhoto,
  onRestoreAll,
  onClose,
}: {
  placeName: string;
  hiddenPhotos: { url: string; caption: string; originalIndex: number }[];
  onRestorePhoto: (originalIndex: number) => void;
  onRestoreAll: () => void;
  onClose: () => void;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 sm:p-6">
        <div className="w-full max-w-[520px] bg-slate-50 rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[85vh]">
          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-black/10 bg-white px-4 py-3 sm:px-6 shadow-sm z-30">
            <button
              type="button"
              onClick={onClose}
              className="z-10 rounded-full p-2 text-black/50 hover:bg-black/5 hover:text-black transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h2 className="text-[18px] font-extrabold text-black tracking-tight">
                Manage Photos
              </h2>
            </div>

            <div className="z-10 flex items-center min-w-[80px] justify-end">
              {hiddenPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={onRestoreAll}
                  className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Restore All
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-[15px] bg-slate-50 relative z-20">
            <div className="w-full space-y-[15px]">
              {hiddenPhotos.length === 0 ? (
                <div className="py-20 text-center text-slate-500">
                  <p>No hidden photos.</p>
                </div>
              ) : (
                hiddenPhotos.map((photo, idx) => (
                  <div
                    key={photo.originalIndex}
                    className="flex flex-col gap-3 bg-white p-4 rounded-2xl shadow-sm border border-black/5"
                  >
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className="relative w-full h-[200px] sm:h-[240px] shrink-0 overflow-hidden rounded-xl bg-slate-100 cursor-pointer hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <ResolvedImage src={photo.url} alt={placeName} />
                    </button>

                    <div className="flex items-center justify-between gap-4 mt-1">
                      <div className="flex-1 min-w-0">
                        {photo.caption ? (
                          <p className="line-clamp-2 text-sm font-medium text-black/70">
                            {photo.caption}
                          </p>
                        ) : (
                          <p className="truncate text-sm font-medium text-black/30 italic">
                            No caption
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onRestorePhoto(photo.originalIndex);
                          if (hiddenPhotos.length === 1) onClose();
                        }}
                        className="shrink-0 rounded-full bg-blue-500 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-600 transition-colors"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={hiddenPhotos.map((p) => p.url)}
          initialIndex={lightboxIndex}
          title={placeName}
          captions={hiddenPhotos.map((p) => p.caption)}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
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

  // blob / S3 signed URLs: use plain img to avoid /_next/image (proxy breaks signed URLs)
  const usePlainImg =
    resolved.startsWith("blob:") ||
    resolved.includes("amazonaws.com") ||
    resolved.includes("X-Amz-");
  if (usePlainImg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  // 일반 url은 next/image
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

/** ----------------------------
 *  Manage Photos Popup (View Mode)
 *  ---------------------------- */
export function ManagePhotosPopup({
  placeName,
  allPhotos,
  onClose,
  onConfirm,
}: {
  placeName: string;
  allPhotos: { url: string; selected: boolean }[];
  onClose: () => void;
  onConfirm: (selectedUrls: string[]) => void;
}) {
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(
    new Set(allPhotos.filter((p) => p.selected).map((p) => p.url)),
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: "left" | "right") => {
    if (scrollerRef.current) {
      const scrollAmount = scrollerRef.current.clientWidth * 0.8;
      scrollerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const toggleSelection = (url: string) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 sm:p-6"
      style={{ zIndex: 99999 }}
    >
      <div
        className={`w-full ${allPhotos.length <= 1 ? "max-w-[648px]" : "max-w-[800px]"} bg-slate-50 rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[85vh]`}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-black/10 bg-white px-4 py-3 sm:px-6 shadow-sm z-30">
          <button
            type="button"
            onClick={onClose}
            className="z-10 text-[14px] font-bold text-black/50 hover:text-black transition-colors"
          >
            Cancel
          </button>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h2 className="text-[16px] font-extrabold text-black tracking-tight">
              Photos Selected {selectedUrls.size}/{allPhotos.length}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onConfirm(Array.from(selectedUrls))}
            className="z-10 text-[14px] font-bold text-blue-500 hover:text-blue-600 transition-colors"
          >
            Confirm
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white relative z-20">
          {allPhotos.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <p>No photos available.</p>
            </div>
          ) : (
            <div className="relative group/nav">
              <div
                ref={scrollerRef}
                className={`flex ${allPhotos.length <= 1 ? "justify-center" : "overflow-x-auto snap-x snap-mandatory gap-4"} pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
              >
                {allPhotos.map((photo, i) => {
                  const isSelected = selectedUrls.has(photo.url);
                  return (
                    <div
                      key={i}
                      className="relative shrink-0 snap-center cursor-pointer overflow-hidden rounded-xl bg-slate-100"
                      style={
                        allPhotos.length <= 1
                          ? { width: "100%", aspectRatio: "4/3" }
                          : { width: "min(85vw, 600px)", aspectRatio: "4/3" }
                      }
                      onClick={() => toggleSelection(photo.url)}
                    >
                      <ResolvedImage
                        src={photo.url}
                        alt={`${placeName} ${i}`}
                      />

                      {/* Selected Overlay */}
                      {isSelected ? (
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center transition-all">
                          <div className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white shadow-md">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-all opacity-0 hover:opacity-100">
                          <div className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-white/90 shadow-sm" />
                        </div>
                      )}

                      {/* Unselected outline circle (always visible) */}
                      {!isSelected && (
                        <div className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-white/90 shadow-sm" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Navigation Arrows */}
              {allPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => scrollBy("left")}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 shadow-sm backdrop-blur hover:bg-black/70 transition-colors opacity-0 group-hover/nav:opacity-100 focus:opacity-100 z-30"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollBy("right")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 shadow-sm backdrop-blur hover:bg-black/70 transition-colors opacity-0 group-hover/nav:opacity-100 focus:opacity-100 z-30"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
