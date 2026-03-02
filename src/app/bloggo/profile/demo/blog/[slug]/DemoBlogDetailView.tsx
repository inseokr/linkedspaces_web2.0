"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { use } from "react";
import { notFound, useRouter } from "next/navigation";

import { getBlogBySlug } from "@/bloggo/lib/mock-data";

// ── Reuse the exact same Trip-page components ─────────────────────────────────
import RecapBlogTopBar from "@/views/Profile/Trip/section/RecapBlogTopBar";
import RecapBlogHero, {
  AuthorRow,
} from "@/views/Profile/Trip/component/RecapBlogTopImage";
import { RecapBlogDaySection } from "@/views/Profile/Trip/component/RecapBlogPlace";
import RestoreHiddenPlacesModal from "@/views/Profile/Trip/edit/components/RestoreHiddenPlacesModal";
import RecapDayTabs, {
  type DayTab,
} from "@/views/Profile/Trip/component/RecapDayTabs";
import MapboxMap, {
  type MarkerData,
} from "@/views/Profile/travel-stats/components/MapBoxMap";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

// ── Layout constants (mirrors OwnerTripRecapView / GuestRecapPage) ─────────────
const TOPBAR_OFFSET_PX = 200;
const PANEL_HEIGHT_OFFSET = 210;
const PANEL_HEIGHT = `calc(100vh - ${PANEL_HEIGHT_OFFSET}px)`;

interface Props {
  params: Promise<{ slug: string }>;
}

function useIsDesktopLg() {
  const [isLg, setIsLg] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsLg(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return isLg;
}

export default function DemoBlogDetailView({ params }: Props) {
  const router = useRouter();
  const { slug } = use(params);
  const blog = getBlogBySlug(slug);
  if (!blog) notFound();

  // ── Build page model from mock data ────────────────────────────────────────
  const hero = useMemo(
    () => ({
      coverImageUrl: blog.coverImage,
      title: blog.title,
      dateText: new Date(blog.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      locationText: blog.coordinate.label,
      authorName: blog.author.name,
      postedLabel: `@${blog.author.username}`,
      avatarUrl: blog.author.avatar,
      lastEditedAt: "2 hrs ago",
    }),
    [blog],
  );

  // Convert blog.places → RecapDay entries so we reuse RecapBlogDaySection
  const computedDays = useMemo(() => {
    // Group places into days (2 places per day for the demo)
    const PLACES_PER_DAY = 2;
    const dayCount = Math.ceil(blog.places.length / PLACES_PER_DAY);

    return Array.from({ length: dayCount }, (_, di) => {
      const dayPlaces = blog.places.slice(
        di * PLACES_PER_DAY,
        di * PLACES_PER_DAY + PLACES_PER_DAY,
      );
      return {
        dayIndex: di + 1,
        title: dayPlaces.map((p) => p.name).join(" & "),
        entries: dayPlaces.map((place, pi) => ({
          id: `${di + 1}-${pi}`,
          placeName: place.name,
          timeRangeText: "",
          categoryLabel: undefined as string | undefined,
          liked: Math.random() > 0.4,
          likeCount: Math.floor(Math.random() * 30) + 3,
          commentCount: Math.floor(Math.random() * 8),
          caption: place.description,
          placeStory: place.description,
          photos: place.photos.length > 0 ? place.photos : [blog.coverImage],
          allPhotos: (place.photos.length > 0
            ? place.photos
            : [blog.coverImage]
          ).map((url) => ({
            url,
            selected: true,
          })),
          coordinate: {
            latitude: place.coordinate.lat,
            longitude: place.coordinate.lng,
          },
        })),
      };
    });
  }, [blog]);

  const [days, setDays] = useState(computedDays);

  // ── Edit-place-name dialog ─────────────────────────────────────────────────
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [editingPlaceName, setEditingPlaceName] = useState("");

  const openPlaceNameEditor = useCallback(
    (entryId: string) => {
      let currentName = "";
      for (const day of days) {
        const entry = day.entries.find((e) => e.id === entryId);
        if (entry) {
          currentName = entry.placeName;
          break;
        }
      }
      setEditingPlaceName(currentName);
      setEditingPlaceId(entryId);
    },
    [days],
  );

  const commitPlaceNameEdit = useCallback(() => {
    if (!editingPlaceId) return;
    const trimmed = editingPlaceName.trim();
    if (!trimmed) {
      setEditingPlaceId(null);
      return;
    }
    setDays((prev) =>
      prev.map((day) => ({
        ...day,
        entries: day.entries.map((e) =>
          e.id === editingPlaceId ? { ...e, placeName: trimmed } : e,
        ),
        title: day.entries
          .map((e) => (e.id === editingPlaceId ? trimmed : e.placeName))
          .join(" & "),
      })),
    );
    setEditingPlaceId(null);
  }, [editingPlaceId, editingPlaceName]);

  const handlePlaceNameChange = useCallback((entryId: string, next: string) => {
    setDays((prev) =>
      prev.map((day) => ({
        ...day,
        entries: day.entries.map((e) =>
          e.id === entryId ? { ...e, placeName: next } : e,
        ),
        title: day.entries
          .map((e) => (e.id === entryId ? next : e.placeName))
          .join(" & "),
      })),
    );
  }, []);

  // Sync state if blog changes (e.g. navigation)
  useEffect(() => {
    setDays(computedDays);
  }, [computedDays]);

  // ── Edit mode state ─────────────────────────────────────────────────────────
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableTitle, setEditableTitle] = useState(blog.title);

  // Reset editable title when blog changes (navigation)
  useEffect(() => {
    setEditableTitle(blog.title);
    setIsEditMode(false);
  }, [blog.title]);

  const handleEditBlog = () => setIsEditMode(true);
  const handleCloseEdit = () => setIsEditMode(false);
  const handleUpdate = () => setIsEditMode(false); // changes already in state
  const handleDiscardLocal = () => {
    setDays(computedDays);
    setEditableTitle(blog.title);
    setIsEditMode(false);
  };

  const handlePlaceStoryChange = useCallback(
    (entryId: string, next: string) => {
      setDays((prev) =>
        prev.map((day) => ({
          ...day,
          entries: day.entries.map((entry) =>
            entry.id === entryId
              ? { ...entry, placeStory: next, caption: next }
              : entry,
          ),
        })),
      );
    },
    [],
  );

  // ── Restore hidden places modal ─────────────────────────────────────────────
  const [restoreDayId, setRestoreDayId] = useState<string | null>(null);

  // ── Hide / Restore photo ────────────────────────────────────────────────────
  const handleHidePhoto = useCallback((entryId: string, photoIndex: number) => {
    setDays((prev) =>
      prev.map((day) => ({
        ...day,
        entries: day.entries.map((entry) => {
          if (entry.id !== entryId) return entry;
          const hidden = Array.from(
            new Set([...((entry as any).hiddenPhotoIndices ?? []), photoIndex]),
          );
          return { ...entry, hiddenPhotoIndices: hidden } as any;
        }),
      })),
    );
  }, []);

  const handleRestorePhoto = useCallback(
    (entryId: string, originalPhotoIndex: number) => {
      setDays((prev) =>
        prev.map((day) => ({
          ...day,
          entries: day.entries.map((entry) => {
            if (entry.id !== entryId) return entry;
            const hidden = ((entry as any).hiddenPhotoIndices ?? []).filter(
              (i: number) => i !== originalPhotoIndex,
            );
            return { ...entry, hiddenPhotoIndices: hidden } as any;
          }),
        })),
      );
    },
    [],
  );

  // ── Hide / Restore place ────────────────────────────────────────────────────
  const handleTogglePlaceHide = useCallback((entryId: string) => {
    setDays((prev) =>
      prev.map((day) => {
        const index = day.entries.findIndex((e) => e.id === entryId);
        if (index === -1) return day;
        const entry = day.entries[index];
        const isHidden = (entry as any).status === "hidden";
        const newEntries = [...day.entries];
        if (!isHidden) {
          // Hide: find anchors for restore ordering
          let beforeId: string | undefined;
          for (let i = index - 1; i >= 0; i--) {
            if ((day.entries[i] as any).status !== "hidden") {
              beforeId = day.entries[i].id;
              break;
            }
          }
          let afterId: string | undefined;
          for (let i = index + 1; i < day.entries.length; i++) {
            if ((day.entries[i] as any).status !== "hidden") {
              afterId = day.entries[i].id;
              break;
            }
          }
          newEntries[index] = {
            ...entry,
            status: "hidden",
            originalIndex: index,
            anchorBeforeId: beforeId,
            anchorAfterId: afterId,
          } as any;
        } else {
          // Restore: insert back near original position
          const toRestore = {
            ...entry,
            status: "saved",
            isHidden: false,
          } as any;
          newEntries.splice(index, 1);
          let insertIndex = newEntries.length;
          const bIdx = toRestore.anchorBeforeId
            ? newEntries.findIndex(
                (e) =>
                  e.id === toRestore.anchorBeforeId &&
                  (e as any).status !== "hidden",
              )
            : -1;
          const aIdx = toRestore.anchorAfterId
            ? newEntries.findIndex(
                (e) =>
                  e.id === toRestore.anchorAfterId &&
                  (e as any).status !== "hidden",
              )
            : -1;
          if (bIdx !== -1) insertIndex = bIdx + 1;
          else if (aIdx !== -1) insertIndex = aIdx;
          else if (toRestore.originalIndex !== undefined)
            insertIndex = Math.min(toRestore.originalIndex, newEntries.length);
          newEntries.splice(insertIndex, 0, toRestore);
        }
        return { ...day, entries: newEntries };
      }),
    );
  }, []);

  const dayTabs: DayTab[] = useMemo(
    () =>
      days.map((d) => ({
        id: `day-${d.dayIndex}`,
        label: `Day ${d.dayIndex}`,
      })),
    [days],
  );

  // All markers — one per place
  const allMarkers = useMemo<MarkerData[]>(() => {
    return blog.places.map((place, idx) => {
      const dayIndex = Math.floor(idx / 2) + 1;
      const posIdx = idx % 2;
      return {
        id: `${dayIndex}-${posIdx}`,
        lat: place.coordinate.lat,
        lng: place.coordinate.lng,
        year: new Date(blog.publishedAt).getFullYear(),
        label: place.name,
        imageUrl: place.photos[0] ?? blog.coverImage,
        visitIndex: idx + 1,
      };
    });
  }, [blog]);

  // Entry id → day id map
  const entryIdToDayId = useMemo(() => {
    const map = new Map<string, string>();
    days.forEach((d) => {
      const dayId = `day-${d.dayIndex}`;
      d.entries.forEach((e) => map.set(e.id, dayId));
    });
    return map;
  }, [days]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [activeDayId, setActiveDayId] = useState<string>(
    dayTabs[0]?.id ?? "day-1",
  );
  const activeDayIdRef = useRef(activeDayId);
  useEffect(() => {
    activeDayIdRef.current = activeDayId;
  }, [activeDayId]);

  const [focusLatLng, setFocusLatLng] = useState<
    { lat: number; lng: number } | undefined
  >();
  const [userInteracted, setUserInteracted] = useState(false);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const activeEntryIdRef = useRef<string | null>(null);
  const focusTimerRef = useRef<number | null>(null);
  const isProgrammaticScrollRef = useRef(false);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const entryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mapStickyRef = useRef<HTMLElement | null>(null);
  const isLg = useIsDesktopLg();

  // Initial focus on first marker — defer setState to avoid synchronous
  // setState-in-effect lint error (react-hooks/set-state-in-effect)
  useEffect(() => {
    if (focusLatLng) return;
    if (!allMarkers.length) return;
    const first = allMarkers[0];
    activeEntryIdRef.current = first.id;
    const timer = setTimeout(() => {
      setActiveEntryId(first.id);
      setFocusLatLng({ lat: first.lat, lng: first.lng });
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMarkers.length]);

  // Mark user interaction
  useEffect(() => {
    const mark = () => setUserInteracted(true);
    window.addEventListener("pointerdown", mark, { once: true });
    window.addEventListener("keydown", mark, { once: true });
    window.addEventListener("wheel", mark, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", mark);
      window.removeEventListener("keydown", mark);
      window.removeEventListener("wheel", mark);
    };
  }, []);

  // Reset scroll on mount
  useLayoutEffect(() => {
    const root = leftScrollRef.current;
    if (!root) return;
    if (userInteracted) return;
    root.style.scrollBehavior = "auto";
    root.scrollTop = 0;
    let raf = 0;
    const start = performance.now();
    const pump = () => {
      if (userInteracted || isProgrammaticScrollRef.current) return;
      if (root.scrollTop !== 0) root.scrollTop = 0;
      if (performance.now() - start < 1200) raf = requestAnimationFrame(pump);
    };
    raf = requestAnimationFrame(pump);
    return () => cancelAnimationFrame(raf);
  }, [userInteracted]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const focusToEntryId = useCallback(
    (entryId: string) => {
      const m = allMarkers.find((x) => x.id === entryId);
      if (!m) return;
      setFocusLatLng({ lat: m.lat, lng: m.lng });
    },
    [allMarkers],
  );

  const getClosestEntryToCenter = useCallback(() => {
    const root = leftScrollRef.current;
    if (!root) return null;
    const rootRect = root.getBoundingClientRect();
    const centerY = rootRect.top + rootRect.height * 0.6;
    let bestId: string | null = null;
    let bestDist = Infinity;
    for (const [id, el] of Object.entries(entryRefs.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const dist = Math.abs(r.top + r.height / 2 - centerY);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = id;
      }
    }
    return bestId;
  }, []);

  const scheduleFocusToEntry = useCallback(
    (entryId: string) => {
      if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current);
      focusTimerRef.current = window.setTimeout(() => {
        if (activeEntryIdRef.current === entryId) return;
        activeEntryIdRef.current = entryId;
        setActiveEntryId(entryId);
        focusToEntryId(entryId);
        const dayId = entryIdToDayId.get(entryId);
        if (dayId && dayId !== activeDayIdRef.current) setActiveDayId(dayId);
      }, 120);
    },
    [focusToEntryId, entryIdToDayId],
  );

  const scrollToDay = useCallback((dayId: string) => {
    const root = leftScrollRef.current;
    const el = daySectionRefs.current[dayId];
    if (!root || !el) return;
    isProgrammaticScrollRef.current = true;
    const rootRect = root.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    root.scrollTo({
      top: elRect.top - rootRect.top + root.scrollTop - 12,
      behavior: "smooth",
    });
    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 650);
  }, []);

  const scrollToEntry = useCallback((entryId: string) => {
    const root = leftScrollRef.current;
    const el = entryRefs.current[entryId];
    if (!root || !el) return;
    isProgrammaticScrollRef.current = true;
    const rootRect = root.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const targetTop = elRect.top - rootRect.top + root.scrollTop - 12;
    const maxTop = root.scrollHeight - root.clientHeight;
    root.scrollTo({
      top: Math.min(Math.max(0, targetTop), Math.max(0, maxTop)),
      behavior: "smooth",
    });
    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 650);
  }, []);

  // ── Scroll spy ────────────────────────────────────────────────────────────
  useEffect(() => {
    const root = leftScrollRef.current;
    if (!root || !dayTabs.length) return;

    const computeActive = () => {
      if (isProgrammaticScrollRef.current) return;
      const rootRect = root.getBoundingClientRect();
      const triggerY = rootRect.top + 16;
      let chosen: string | null = null;
      for (const t of dayTabs) {
        const el = daySectionRefs.current[t.id];
        if (!el) continue;
        if (el.getBoundingClientRect().top <= triggerY) chosen = t.id;
        else break;
      }
      if (!chosen) {
        const first = dayTabs[0]?.id;
        if (first && first !== activeDayIdRef.current) setActiveDayId(first);
      } else if (chosen !== activeDayIdRef.current) {
        setActiveDayId(chosen);
      }
      const closestEntryId = getClosestEntryToCenter();
      if (closestEntryId) scheduleFocusToEntry(closestEntryId);
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        computeActive();
      });
    };

    const ro = new ResizeObserver(() => computeActive());
    ro.observe(root);
    requestAnimationFrame(computeActive);
    setTimeout(computeActive, 150);
    setTimeout(computeActive, 600);
    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", computeActive);
    return () => {
      ro.disconnect();
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", computeActive);
      if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current);
    };
  }, [dayTabs, allMarkers, getClosestEntryToCenter, scheduleFocusToEntry]);

  // Wheel hijack (map area → left panel scroll) — same as GuestRecapPage
  useLayoutEffect(() => {
    const root = leftScrollRef.current;
    if (!root) return;

    const canScrollLeftPanel = (dy: number) => {
      const max = root.scrollHeight - root.clientHeight;
      if (max <= 0) return false;
      if (dy > 0 && root.scrollTop >= max - 1) return false;
      if (dy < 0 && root.scrollTop <= 0) return false;
      return true;
    };

    const onWheel = (e: WheelEvent) => {
      if (!userInteracted || isProgrammaticScrollRef.current || e.ctrlKey)
        return;
      const mapEl = mapStickyRef.current;
      if (!mapEl) return;
      const rect = mapEl.getBoundingClientRect();
      if (rect.top > TOPBAR_OFFSET_PX + 1) return;
      if (!canScrollLeftPanel(e.deltaY)) return;
      e.preventDefault();
      e.stopPropagation();
      root.scrollTop += e.deltaY;
    };

    const opts: AddEventListenerOptions = { passive: false, capture: true };
    window.addEventListener("wheel", onWheel, opts);
    document.addEventListener("wheel", onWheel, opts);
    return () => {
      window.removeEventListener("wheel", onWheel, opts);
      document.removeEventListener("wheel", onWheel, opts);
    };
  }, [userInteracted]);

  // ── Day tab click ─────────────────────────────────────────────────────────
  const handleDayChange = useCallback(
    (dayId: string) => {
      setActiveDayId(dayId);
      scrollToDay(dayId);
      const dayIndex = Number(dayId.replace("day-", ""));
      const firstEntry = days.find((d) => d.dayIndex === dayIndex)
        ?.entries?.[0];
      if (firstEntry) {
        activeEntryIdRef.current = firstEntry.id;
        setActiveEntryId(firstEntry.id);
        focusToEntryId(firstEntry.id);
      }
    },
    [days, scrollToDay, focusToEntryId],
  );

  // ── Marker click ──────────────────────────────────────────────────────────
  const onMarkerClick = useCallback(
    (markerId: string) => {
      activeEntryIdRef.current = markerId;
      setActiveEntryId(markerId);
      focusToEntryId(markerId);
      const dayId = entryIdToDayId.get(markerId);
      if (dayId) setActiveDayId(dayId);
      scrollToEntry(markerId);
    },
    [focusToEntryId, entryIdToDayId, scrollToEntry],
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <RecapBlogTopBar
        title={editableTitle}
        onGoBack={() => router.push("/bloggo/profile/demo")}
        brand="bloggo"
        mode={isEditMode ? "edit" : "view"}
        dayTabs={dayTabs}
        activeDayId={activeDayId}
        onDayChange={(id) => handleDayChange(id)}
        onEditBlog={handleEditBlog}
        onCloseEdit={handleCloseEdit}
        onUpdate={handleUpdate}
        onDiscardLocal={handleDiscardLocal}
        discardDisabled={false}
        updateDisabled={false}
      />

      {/* Edit-mode banner */}
      {isEditMode && (
        <div className="sticky top-[57px] z-40 flex items-center justify-center gap-2 bg-sky-500/10 border-b border-sky-500/20 px-4 py-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-[12px] font-bold text-sky-700">
            ✏️ Demo Edit Mode — edits reset when you leave this page
          </span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          EDIT MODE — full-width single column, no map (matches owner view)
          ═══════════════════════════════════════════════════════════════════ */}
      {isEditMode ? (
        /* ═══════════════════════════════════════════════════════════════════
           EDIT MODE — matches BloggoRecapEditView (no map, page scroll)
           ═══════════════════════════════════════════════════════════════════ */
        <>
          {/* Cover photo — bare image + ImageFieldEditor-style hover overlay */}
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-6">
            <div className="group relative w-full overflow-hidden rounded-2xl aspect-[21/7] cursor-default">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.coverImageUrl}
                alt="cover"
                className="h-full w-full object-cover"
              />
              {/* Dark scrim + Change Cover pill (matches ImageFieldEditor) */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div
                  className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-500 shadow-md border border-slate-200 cursor-not-allowed"
                  title="Cover photo is fixed in the demo"
                >
                  Change Cover
                </div>
              </div>
            </div>
          </div>

          {/* Editable title */}
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pb-2">
            <div className="mt-6 pb-6 border-b border-slate-200">
              <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-3 text-center">
                Blog Title
              </p>
              <textarea
                value={editableTitle}
                onChange={(e) => {
                  setEditableTitle(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                rows={2}
                className="w-full resize-none overflow-hidden bg-transparent px-2 py-1 text-center text-[32px] sm:text-[48px] font-extrabold tracking-tighter text-black placeholder:text-black/20 outline-none focus:outline-none transition"
                placeholder="Blog title…"
              />
            </div>
          </div>

          {/* Itinerary content */}
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pb-24">
            <div className="mt-10 space-y-20">
              {days.map((d) => {
                const id = `day-${d.dayIndex}`;
                return (
                  <div
                    key={id}
                    data-day-id={id}
                    ref={(el) => {
                      daySectionRefs.current[id] = el;
                    }}
                    style={{ scrollMarginTop: TOPBAR_OFFSET_PX + 12 }}
                  >
                    <RecapBlogDaySection
                      dayIndex={d.dayIndex}
                      title={d.title}
                      entries={d.entries
                        .filter((e) => (e as any).status !== "hidden")
                        .map((e) => {
                          const hiddenIndices =
                            (e as any).hiddenPhotoIndices ?? [];
                          const allPhotos =
                            (e as any).allPhotos ??
                            e.photos.map((url: string) => ({
                              url,
                              selected: true,
                            }));
                          const hiddenPhotos = hiddenIndices
                            .map((origIdx: number) => ({
                              url: e.photos[origIdx] ?? "",
                              caption: "",
                              originalIndex: origIdx,
                            }))
                            .filter((h: any) => !!h.url);
                          return {
                            ...e,
                            photos: e.photos.filter(
                              (_: any, i: number) => !hiddenIndices.includes(i),
                            ),
                            hiddenPhotos,
                            allPhotos,
                          } as any;
                        })}
                      mode="edit"
                      hiddenCount={
                        d.entries.filter((e) => (e as any).status === "hidden")
                          .length
                      }
                      onOpenHiddenPlaces={() =>
                        setRestoreDayId(`day-${d.dayIndex}`)
                      }
                      onPlaceStoryChange={handlePlaceStoryChange}
                      onEntryMount={(entryId, el) => {
                        entryRefs.current[entryId] = el;
                      }}
                      onOpenPlaceMapEditor={openPlaceNameEditor}
                      onPlaceNameChange={handlePlaceNameChange}
                      onTogglePlaceHide={handleTogglePlaceHide}
                      onHidePhoto={handleHidePhoto}
                      onRestorePhoto={handleRestorePhoto}
                      onManagePhotosConfirm={(
                        entryId: string,
                        selectedUrls: string[],
                      ) => {
                        setDays((prev) =>
                          prev.map((day) => ({
                            ...day,
                            entries: day.entries.map((entry) =>
                              entry.id === entryId
                                ? {
                                    ...entry,
                                    photos: selectedUrls,
                                    allPhotos: entry.allPhotos?.map((p) => ({
                                      ...p,
                                      selected: selectedUrls.includes(p.url),
                                    })),
                                  }
                                : entry,
                            ),
                          })),
                        );
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* ════════════════════════════════════════════════════════════════
           VIEW MODE — original split-layout: left blog + right map
           ════════════════════════════════════════════════════════════════ */
        <>
          <div className="p-3 sm:p-5">
            <RecapBlogHero {...hero} title={editableTitle} />

            {/* Mobile day tabs */}
            {!isLg && (
              <div className="sticky top-[48px] z-20 border-b border-black/10 bg-white/80 backdrop-blur-md">
                <div className="w-full px-3 py-2">
                  <RecapDayTabs
                    tabs={dayTabs}
                    activeId={activeDayId}
                    onChange={(id) => handleDayChange(id)}
                    size="sm"
                    className="max-w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Body: left scroll + right sticky map */}
          <div className="flex flex-col gap-4 p-3 sm:p-4 lg:flex-row lg:items-start">
            {/* Left: scrollable day/place list */}
            <section
              className="min-w-0 flex-1 lg:sticky lg:self-start"
              style={{ top: TOPBAR_OFFSET_PX }}
            >
              <div
                ref={leftScrollRef}
                className="w-full overflow-y-auto overscroll-contain touch-pan-y rounded-2xl scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                style={{
                  height: isLg ? PANEL_HEIGHT : "auto",
                  maxHeight: isLg ? undefined : "none",
                  scrollBehavior: "auto",
                  overflowAnchor: "none",
                }}
              >
                {/* Author row - only visible on mobile, right above Day 1 */}
                <div className="sm:hidden px-4 pt-4 pb-2">
                  <AuthorRow
                    name={hero.authorName}
                    postedLabel={hero.postedLabel}
                    avatarUrl={hero.avatarUrl}
                  />
                </div>
                <div className="space-y-12 p-4">
                  {days.map((d) => {
                    const id = `day-${d.dayIndex}`;
                    return (
                      <div
                        key={id}
                        data-day-id={id}
                        ref={(el) => {
                          daySectionRefs.current[id] = el;
                        }}
                        style={{ scrollMarginTop: 12 }}
                      >
                        <RecapBlogDaySection
                          dayIndex={d.dayIndex}
                          title={d.title}
                          entries={d.entries as any}
                          mode="view"
                          onEntryMount={(entryId, el) => {
                            entryRefs.current[entryId] = el;
                          }}
                          onOpenPlaceMapEditor={openPlaceNameEditor}
                          onPlaceNameChange={handlePlaceNameChange}
                          onManagePhotosConfirm={(
                            entryId: string,
                            selectedUrls: string[],
                          ) => {
                            setDays((prev) =>
                              prev.map((day) => ({
                                ...day,
                                entries: day.entries.map((entry) =>
                                  entry.id === entryId
                                    ? {
                                        ...entry,
                                        photos: selectedUrls,
                                        allPhotos: entry.allPhotos?.map(
                                          (p) => ({
                                            ...p,
                                            selected: selectedUrls.includes(
                                              p.url,
                                            ),
                                          }),
                                        ),
                                      }
                                    : entry,
                                ),
                              })),
                            );
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Right: sticky map */}
            <section
              ref={(el) => {
                mapStickyRef.current = el;
              }}
              className="min-w-0 flex-1 hidden lg:block lg:sticky lg:self-start"
              style={{ top: TOPBAR_OFFSET_PX }}
            >
              <div
                className="relative w-full overflow-hidden rounded-2xl border border-black/10"
                style={{ height: PANEL_HEIGHT }}
              >
                <MapboxMap
                  mode="place"
                  focusLatLng={focusLatLng}
                  placeMarkers={allMarkers}
                  onPlaceMarkerClick={onMarkerClick}
                  activePlaceMarkerId={activeEntryId ?? undefined}
                  overlayTopRight={
                    <div className="rounded-full bg-white/70 backdrop-blur-md border border-white/50 px-2 py-2 shadow-sm">
                      <RecapDayTabs
                        tabs={dayTabs}
                        activeId={activeDayId}
                        onChange={(id) => handleDayChange(id)}
                        className="max-w-[min(72vw,420px)] [&>button]:!h-7 [&>button]:!px-3 [&>button]:!text-[13px]"
                      />
                    </div>
                  }
                />
              </div>
            </section>
          </div>
        </>
      )}
      <ScrollToTopButton
        scrollContainerRef={isLg ? leftScrollRef : undefined}
      />

      {/* ── Inline Place Name Edit Dialog ───────────────────────────────── */}
      {/* Restore hidden places modal */}
      {restoreDayId &&
        (() => {
          const dayIndex = Number(restoreDayId.replace("day-", ""));
          const day = days.find((d) => d.dayIndex === dayIndex);
          if (!day) return null;
          const hiddenPlaces = day.entries
            .filter((e) => (e as any).status === "hidden")
            .map(
              (e) =>
                ({
                  id: e.id,
                  placeName: e.placeName,
                  status: "hidden" as const,
                  photos: e.photos,
                  timeRangeText: e.timeRangeText ?? "",
                }) as any,
            );
          return (
            <RestoreHiddenPlacesModal
              hiddenPlaces={hiddenPlaces}
              onRestorePlace={(placeId) => handleTogglePlaceHide(placeId)}
              onRestoreAll={() => {
                hiddenPlaces.forEach((p) => handleTogglePlaceHide(p.id));
                setRestoreDayId(null);
              }}
              onClose={() => setRestoreDayId(null)}
            />
          );
        })()}

      {editingPlaceId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setEditingPlaceId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[20px] font-extrabold text-black tracking-tight">
              Edit Place Name
            </h2>
            <input
              autoFocus
              type="text"
              value={editingPlaceName}
              onChange={(e) => setEditingPlaceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitPlaceNameEdit();
                if (e.key === "Escape") setEditingPlaceId(null);
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[16px] font-semibold text-black outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
              placeholder="Place name…"
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setEditingPlaceId(null)}
                className="px-5 py-2.5 rounded-xl text-[14px] font-bold text-black/60 hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={commitPlaceNameEdit}
                className="px-5 py-2.5 rounded-xl bg-black text-white text-[14px] font-bold hover:bg-black/80 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
