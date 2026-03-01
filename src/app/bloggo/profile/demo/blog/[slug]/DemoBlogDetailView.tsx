"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { use } from "react";
import { notFound, useRouter } from "next/navigation";

import { getBlogBySlug } from "@/bloggo/lib/mock-data";

// ── Reuse the exact same Trip-page components ─────────────────────────────────
import RecapBlogTopBar from "@/views/Profile/Trip/section/RecapBlogTopBar";
import RecapBlogHero from "@/views/Profile/Trip/component/RecapBlogTopImage";
import { RecapBlogDaySection } from "@/views/Profile/Trip/component/RecapBlogPlace";
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
  const days = useMemo(() => {
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
          coordinate: {
            latitude: place.coordinate.lat,
            longitude: place.coordinate.lng,
          },
        })),
      };
    });
  }, [blog]);

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
        title={blog.title}
        onGoBack={() => router.push("/bloggo/profile/demo")}
        brand="bloggo"
      />

      <div className="p-3 sm:p-5">
        <RecapBlogHero {...hero} />

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
                      onEntryMount={(entryId, el) => {
                        entryRefs.current[entryId] = el;
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
          {/* Map container — position:relative so day tabs can overlay */}
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
              useSimpleMarkers
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
      <ScrollToTopButton
        scrollContainerRef={isLg ? leftScrollRef : undefined}
      />
    </div>
  );
}
