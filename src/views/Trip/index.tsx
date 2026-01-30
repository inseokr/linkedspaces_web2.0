"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/api/client";
// <<<<<<< HEAD
// import { RecapDay } from "./component/RecapBlogPlace";
// import RecapBlogTopBar from "./section/RecapBlogTopBar";
// import type { DayTab } from "./component/RecapDayTabs";
// import type { Crumb } from "./component/RecapBlogCrumbBread";
// import RecapBlogHero from "./component/RecapBlogTopImage";
// =======
import type { TripRecapResponse } from "@/api/trips";

import RecapBlogTopBar from "@/views/Trip/section/RecapBlogTopBar";
import type { DayTab } from "@/views/Trip/component/RecapDayTabs";
import type { Crumb } from "@/views/Trip/component/RecapBlogCrumbBread";
import RecapBlogHero from "@/views/Trip/component/RecapBlogTopImage";

import {
  RecapBlogDaySection,
  type RecapBlogPageData,
} from "@/views/Trip/component/RecapBlogPlace";

import MapboxMap, {
  type MarkerData,
} from "@/views/Profile/travel-stats/components/MapBoxMap";

import { mapTripRecapToPageModel } from "@/views/Trip/utils/mapTripRecap";
import { loadDraft } from "@/views/Trip/edit/utils/draftStorage";
import { applyDraftToPageModel } from "@/views/Trip/edit/utils/editMappers";

interface TripRecapViewProps {
  userId: string;
  tripId: string;
}

import RecapLoginBar from "./component/GuestRBLoginBar";
import GuestRecapPage from "./GuestModeIndex";
import { useLayoutMode } from "@/components/layout/LayoutModeContext";

function GuestTripRecapShell() {
  const { setLayoutMode } = useLayoutMode();

  useEffect(() => {
    setLayoutMode("bare");
    return () => setLayoutMode("profile");
  }, [setLayoutMode]);

  return <GuestRecapPage />;
}

export default function TripRecapView({ userId, tripId }: TripRecapViewProps) {
  const router = useRouter();

  const [recapData, setRecapData] = useState<TripRecapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Layout */
  const TOPBAR_OFFSET_PX = 250;
  const PANEL_HEIGHT_OFFSET = 220;
  const PANEL_HEIGHT = `calc(100vh - ${PANEL_HEIGHT_OFFSET}px)`;

  /** Refs */
  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const entryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const mapStickyRef = useRef<HTMLElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const isProgrammaticScrollRef = useRef(false);

  /** Active day */
  const [activeDayId, setActiveDayId] = useState<string>("day-1");
  const activeDayIdRef = useRef(activeDayId);
  useEffect(() => {
    activeDayIdRef.current = activeDayId;
  }, [activeDayId]);

  /** Map focus */
  const [focusLatLng, setFocusLatLng] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);
  const [userInteracted, setUserInteracted] = useState(false);

  /** Entry focus helpers */
  const activeEntryIdRef = useRef<string | null>(null);
  const focusTimerRef = useRef<number | null>(null);

  /** 1) Fetch */
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!userId || !tripId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch<TripRecapResponse>(
          `/ls-beta-test/trip-recap/${userId}/${tripId}`,
        );
        if (cancelled) return;
        setRecapData(data);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Failed to load recap");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [userId, tripId]);

  /** 2) Effective model = API mapped + draft applied */
  const effectiveModel: RecapBlogPageData | null = useMemo(() => {
    if (!recapData) return null;

    const pm = mapTripRecapToPageModel(recapData);

    const draft = loadDraft(userId, tripId);
    return draft ? applyDraftToPageModel(pm, draft) : pm;
  }, [recapData, userId, tripId]);

  /** 3) Base center */
  const baseCenter = useMemo(() => {
    const first = effectiveModel?.days?.[0]?.entries?.[0]?.coordinate;
    if (first?.latitude && first?.longitude) {
      return { lat: first.latitude, lng: first.longitude };
    }
    return { lat: 37.7749, lng: -122.4194 };
  }, [effectiveModel]);

  /** 4) Tabs / breadcrumb */
  const dayTabs: DayTab[] = useMemo(() => {
    return (
      effectiveModel?.days.map((d) => ({
        id: `day-${d.dayIndex}`,
        label: `Day ${d.dayIndex}`,
      })) ?? []
    );
  }, [effectiveModel]);

  const breadcrumbItems: Crumb[] = useMemo(() => {
    const title = effectiveModel?.hero?.title ?? "Trip";
    return [
      { label: "Recap Blogs", href: "/profile/recap-blogs" },
      { label: "Map", onClick: () => window.history.back() },
      { label: `(${title})` },
    ];
  }, [effectiveModel?.hero?.title]);

  /** 5) Ensure active day valid */
  useEffect(() => {
    if (!dayTabs.length) return;
    if (!dayTabs.some((t) => t.id === activeDayIdRef.current)) {
      setActiveDayId(dayTabs[0].id);
    }
  }, [dayTabs]);

  /** 6) entryId -> dayId */
  const entryIdToDayId = useMemo(() => {
    const map = new Map<string, string>();
    if (!effectiveModel) return map;

    for (const d of effectiveModel.days) {
      const dayId = `day-${d.dayIndex}`;
      for (const e of d.entries) map.set(e.id, dayId);
    }
    return map;
  }, [effectiveModel]);

  /** 7) Markers */
  const markers = useMemo<MarkerData[]>(() => {
    if (!effectiveModel) return [];

    const travelYear =
      (typeof recapData?.trip?.startingYear === "number"
        ? recapData.trip.startingYear
        : Number(recapData?.trip?.startingYear)) || new Date().getFullYear();

    return effectiveModel.days.flatMap((d) =>
      d.entries.map((e: any) => ({
        id: e.id,
        lat: e.coordinate?.latitude ?? baseCenter.lat,
        lng: e.coordinate?.longitude ?? baseCenter.lng,
        year: travelYear,
        label: e.placeName,
        imageUrl: e.photos?.[0] ?? "/images/avatar.png",
      })),
    );
  }, [effectiveModel, baseCenter]);

  /** helpers: scroll & focus */
  const scrollToDay = (dayId: string) => {
    const root = leftScrollRef.current;
    const el = daySectionRefs.current[dayId];
    if (!root || !el) return;

    isProgrammaticScrollRef.current = true;

    const rootRect = root.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const PADDING = 12;

    const nextTop = elRect.top - rootRect.top + root.scrollTop - PADDING;
    root.scrollTo({ top: nextTop, behavior: "smooth" });

    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 650);
  };

  const focusToEntryId = (entryId: string) => {
    const m = markers.find((x) => x.id === entryId);
    if (!m) return;
    setFocusLatLng({ lat: m.lat, lng: m.lng });
  };

  // helper: left panel "가운데"에 가장 가까운 entry 찾기

  const getClosestEntryToCenter = () => {
    const root = leftScrollRef.current;
    if (!root) return null;

    const rootRect = root.getBoundingClientRect();
    const centerY = rootRect.top + rootRect.height * 0.6;

    let bestId: string | null = null;
    let bestDist = Infinity;

    for (const [id, el] of Object.entries(entryRefs.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const entryCenterY = r.top + r.height / 2;
      const dist = Math.abs(entryCenterY - centerY);

      if (dist < bestDist) {
        bestDist = dist;
        bestId = id;
      }
    }
    return bestId;
  };

  //helper: 디바운스(스크롤 중 과도한 이동 방지)
  const scheduleFocusToEntry = (entryId: string) => {
    if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current);

    focusTimerRef.current = window.setTimeout(() => {
      if (activeEntryIdRef.current === entryId) return;

      activeEntryIdRef.current = entryId;
      focusToEntryId(entryId);

      const dayId = entryIdToDayId.get(entryId);
      if (dayId && dayId !== activeDayIdRef.current) setActiveDayId(dayId);
    }, 120);
  };

  /** 8) initial focus to first marker */
  useEffect(() => {
    if (focusLatLng) return;
    if (!markers.length) return;

    const first = markers[0];
    activeEntryIdRef.current = first.id;
    setFocusLatLng({ lat: first.lat, lng: first.lng });
  }, [markers, focusLatLng]);

  /** 9) mark userInteracted once */
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

  /** 10) initial scroll stabilization (친구 로직 유지) */
  useLayoutEffect(() => {
    const root = leftScrollRef.current;
    if (!root) return;

    root.style.scrollBehavior = "auto";
    root.scrollTop = 0;

    let raf = 0;
    const start = performance.now();

    const pump = () => {
      if (userInteracted) return;
      if (isProgrammaticScrollRef.current) return;

      if (root.scrollTop !== 0) root.scrollTop = 0;

      const elapsed = performance.now() - start;
      if (elapsed < 1200) raf = requestAnimationFrame(pump);
    };

    raf = requestAnimationFrame(pump);
    return () => cancelAnimationFrame(raf);
  }, [userInteracted]);

  /** 11) scroll spy: day + entry center focus */
  useEffect(() => {
    const root = leftScrollRef.current;
    if (!root) return;
    if (!dayTabs.length) return;

    const TRIGGER_PX = 16;

    const computeActive = () => {
      if (isProgrammaticScrollRef.current) return;

      const rootRect = root.getBoundingClientRect();
      const triggerY = rootRect.top + TRIGGER_PX;

      let chosen: string | null = null;

      for (const t of dayTabs) {
        const el = daySectionRefs.current[t.id];
        if (!el) continue;

        const top = el.getBoundingClientRect().top;
        if (top <= triggerY) chosen = t.id;
        else break;
      }

      if (!chosen) {
        const first = dayTabs[0]?.id;
        if (first && first !== activeDayIdRef.current) setActiveDayId(first);
      } else if (chosen !== activeDayIdRef.current) {
        setActiveDayId(chosen);
      }

      // --- 추가: entry(장소) 기준 카메라 포커스 ---
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayTabs, markers]);

  /** 12) day change (tab click) */
  const handleDayChange = (dayId: string, fromUser = false) => {
    setActiveDayId(dayId);
    if (fromUser) scrollToDay(dayId);

    const dayIndex = Number(dayId.replace("day-", ""));
    const firstEntryId = effectiveModel?.days.find(
      (d) => d.dayIndex === dayIndex,
    )?.entries?.[0]?.id;

    if (firstEntryId) {
      activeEntryIdRef.current = firstEntryId;
      focusToEntryId(firstEntryId);
    }
  };

  /** 13) marker click: focus + jump to day */
  const focusByMarkerId = (markerId: string) => {
    activeEntryIdRef.current = markerId;
    focusToEntryId(markerId);

    const targetDayId = entryIdToDayId.get(markerId);
    if (targetDayId) handleDayChange(targetDayId, true);
  };

  /** 14) pinned map: wheel consumed by left panel first */
  useLayoutEffect(() => {
    const root = leftScrollRef.current;
    if (!root) return;

    const canScrollLeftPanel = (deltaY: number) => {
      const maxTop = root.scrollHeight - root.clientHeight;
      const cur = root.scrollTop;

      if (maxTop <= 0) return false;
      if (deltaY > 0 && cur >= maxTop - 1) return false;
      if (deltaY < 0 && cur <= 0) return false;
      return true;
    };

    const onWheel = (e: WheelEvent) => {
      if (!userInteracted) return;
      if (isProgrammaticScrollRef.current) return;

      const delta = e.deltaY;
      if (!delta) return;

      const mapEl = mapStickyRef.current;
      if (!mapEl) return;

      const rect = mapEl.getBoundingClientRect();
      const pinnedNow = rect.top <= TOPBAR_OFFSET_PX + 1;
      if (!pinnedNow) return;

      const mapWrap = mapContainerRef.current;
      const isOnMap = !!(mapWrap && mapWrap.contains(e.target as Node));

      // ctrl+wheel => map zoom 허용
      if (isOnMap && e.ctrlKey) return;

      // left panel 더 못 가면 window scroll 허용
      if (!canScrollLeftPanel(delta)) return;

      e.preventDefault();

      if (isOnMap) {
        e.stopPropagation();
        (e as any).stopImmediatePropagation?.();
      }

      root.scrollTop += delta;
    };

    const opts: AddEventListenerOptions = { passive: false, capture: true };
    window.addEventListener("wheel", onWheel, opts);
    document.addEventListener("wheel", onWheel, opts);

    return () => {
      window.removeEventListener("wheel", onWheel, opts);
      document.removeEventListener("wheel", onWheel, opts);
    };
  }, [TOPBAR_OFFSET_PX, userInteracted, markers]);

  /** render */
  if (loading) return <div className="p-6">Loading recap…</div>;

  if (error) {
    return (
      <div className="p-6">
        <div className="font-semibold">Failed to load recap</div>
        <div className="mt-2 text-sm opacity-70">{error}</div>
      </div>
    );
  }

  if (!effectiveModel) return <div className="p-6">No recap data</div>;

  const isGuestMode = true;

  if (isGuestMode) {
    return <GuestTripRecapShell />;
  }

  return (
    <div className="min-h-screen bg-white">
      <RecapBlogTopBar
        title="Recap Blog"
        breadcrumbItems={breadcrumbItems}
        dayTabs={dayTabs}
        activeDayId={activeDayId}
        onDayChange={(id) => handleDayChange(id, true)}
        onGoBack={() => window.history.back()}
        onEditBlog={() => router.push(`/trip/${userId}/${tripId}/edit`)}
        className="sticky top-0 z-50 border-b border-black/10"
      />

      <div className="space-y-10 p-6">
        <RecapBlogHero {...effectiveModel.hero} />

        {(loading || error) && (
          <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm">
            {loading && <div className="font-medium">Loading API recap…</div>}
            {error && <div className="mt-1 opacity-70">API error: {error}</div>}
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Left */}
          <section
            className="min-w-0 flex-1 sticky self-start"
            style={{ top: TOPBAR_OFFSET_PX }}
          >
            <div
              ref={leftScrollRef}
              className="w-full overflow-y-auto overscroll-contain touch-pan-y rounded-2xl"
              style={{
                height: PANEL_HEIGHT,
                scrollBehavior: "auto",
                overflowAnchor: "none",
              }}
            >
              <div className="space-y-12 p-4">
                {effectiveModel.days.map((d) => {
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

          {/* Right (Map) */}
          <section
            ref={(el) => {
              mapStickyRef.current = el;
            }}
            className="min-w-0 flex-1 sticky self-start"
            style={{ top: TOPBAR_OFFSET_PX }}
          >
            <div
              ref={mapContainerRef}
              className="w-full overflow-hidden rounded-2xl border border-black/10"
              style={{ height: PANEL_HEIGHT }}
            >
              <MapboxMap
                mode="place"
                placeMarkers={markers}
                focusLatLng={focusLatLng}
                onPlaceMarkerClick={focusByMarkerId}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
