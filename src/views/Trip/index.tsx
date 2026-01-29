"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";

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

interface TripRecapViewProps {
  userId: string;
  tripId: string;
}

type RecapApiResponse = any;
type TripRecapResponse = any;

const demoData: RecapBlogPageData = {
  hero: {
    coverImageUrl: "/images/recap/us.png",
    title: "US Adventure",
    dateText: "Dec 15–20, 2024",
    locationText: "San Francisco",
    authorName: "Username",
    postedLabel: "Posted 5 days ago",
    avatarUrl: "/images/recap/kr.png",
  },
  days: [
    {
      dayIndex: 1,
      title: "Arrival & First Walk",
      entries: [
        {
          id: "d1-e1",
          placeName: "Zermatt Station",
          timeRangeText: "9:30 - 10:10 AM",
          categoryLabel: "Cafe",
          liked: true,
          likeCount: 5,
          commentCount: 3,
          caption:
            "First landing moment. Warm coffee, crisp air, and that postcard feeling hits instantly.",
          photos: ["/images/recap/kr.png", "/images/recap/kr.png"],
        },
        {
          id: "d1-e2",
          placeName: "Old Town Stroll",
          timeRangeText: "11:20 AM - 12:10 PM",
          categoryLabel: "Walk",
          liked: false,
          likeCount: 12,
          commentCount: 2,
          caption:
            "Slow wandering through quiet streets, little shops, and the best kind of unplanned detours.",
          photos: ["/images/recap/kr.png", "/images/recap/kr.png"],
        },
      ],
    },
    {
      dayIndex: 2,
      title: "Views & Golden Hour",
      entries: [
        {
          id: "d2-e1",
          placeName: "Gornergrat Railway",
          timeRangeText: "9:40 - 11:05 AM",
          categoryLabel: "Scenic",
          liked: true,
          likeCount: 21,
          commentCount: 4,
          caption:
            "The climb keeps escalating. Sit on the right side going up—layers of mountain theater.",
          photos: ["/images/recap/kr.png", "/images/recap/kr.png"],
        },
        {
          id: "d2-e2",
          placeName: "Riverside Photo Spot",
          timeRangeText: "4:50 - 5:30 PM",
          categoryLabel: "Photo",
          liked: true,
          likeCount: 18,
          commentCount: 1,
          caption:
            "Golden hour reflections. Stayed way longer than planned because the light kept changing.",
          photos: ["/images/recap/kr.png", "/images/recap/kr.png"],
        },
      ],
    },
    {
      dayIndex: 3,
      title: "Short Hike & Comfort Food",
      entries: [
        {
          id: "d3-e1",
          placeName: "Panorama Trailhead",
          timeRangeText: "10:15 - 12:05 PM",
          categoryLabel: "Hike",
          liked: false,
          likeCount: 9,
          commentCount: 0,
          caption:
            "A short hike with big payoff. Quiet, steady pace, and a view that makes the effort feel free.",
          photos: ["/images/recap/kr.png", "/images/recap/kr.png"],
        },
        {
          id: "d3-e2",
          placeName: "Local Dinner Spot",
          timeRangeText: "6:20 - 7:40 PM",
          categoryLabel: "Food",
          liked: true,
          likeCount: 15,
          commentCount: 2,
          caption:
            "Comfort food finale. Warm, hearty, and exactly what you want after a long day outside.",
          photos: ["/images/recap/kr.png", "/images/recap/kr.png"],
        },
      ],
    },
  ],
};

// 문자열 -> 0~1 난수처럼 쓰는 안정적 hash
function hash01(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

// 베이스 좌표 주변으로 퍼지게 가상 lat/lng 생성
function fakeLatLng(seed: string, base: { lat: number; lng: number }) {
  const r1 = hash01(seed + ":lat");
  const r2 = hash01(seed + ":lng");

  const latJitter = (r1 - 0.5) * 0.06;
  const lngJitter = (r2 - 0.5) * 0.06;

  const lngScale = Math.cos((base.lat * Math.PI) / 180) || 1;

  return {
    lat: base.lat + latJitter,
    lng: base.lng + lngJitter / lngScale,
  };
}

export default function TripRecapView({ userId, tripId }: TripRecapViewProps) {
  const [recapData, setRecapData] = useState<RecapApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const TOPBAR_OFFSET_PX = 250;
  const PANEL_HEIGHT_OFFSET = 200;
  const PANEL_HEIGHT = `calc(100vh - ${PANEL_HEIGHT_OFFSET}px)`;

  const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScrollRef = useRef(false);

  const [activeDayId, setActiveDayId] = useState<string>("day-1");
  const activeDayIdRef = useRef(activeDayId);
  useEffect(() => {
    activeDayIdRef.current = activeDayId;
  }, [activeDayId]);

  const mapStickyRef = useRef<HTMLElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [userInteracted, setUserInteracted] = useState(false);

  const [focusLatLng, setFocusLatLng] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!userId || !tripId) return;

      setLoading(true);
      setError(null);

      try {
        const url = `https://pocketverse.herokuapp.com/LS_API/ls-beta-test/trip-recap/${userId}/${tripId}`;
        const res = await axios.get<TripRecapResponse>(url);
        if (cancelled) return;
        setRecapData(res.data);
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

  const pageData = useMemo(() => demoData, []);

  const pageModel = useMemo(() => {
    if (!recapData) return null;
    return mapTripRecapToPageModel(recapData);
  }, [recapData]);

  const effectiveModel: RecapBlogPageData = useMemo(() => {
    return pageModel ?? pageData;
  }, [pageModel, pageData]);

  const baseCenter = useMemo(() => {
    return { lat: 37.7749, lng: -122.4194 };
  }, []);

  const entryIdToDayId = useMemo(() => {
    const map = new Map<string, string>();
    effectiveModel.days.forEach((d) => {
      const dayId = `day-${d.dayIndex}`;
      d.entries.forEach((e: any) => map.set(e.id, dayId));
    });
    return map;
  }, [effectiveModel.days]);

  const markers = useMemo<MarkerData[]>(() => {
    const year = 2024;
    return effectiveModel.days.flatMap((d) =>
      d.entries.map((e: any) => {
        const { lat, lng } = fakeLatLng(e.id, baseCenter);
        return {
          id: e.id,
          lat,
          lng,
          year,
          label: e.placeName,
          imageUrl: e.photos?.[0] ?? "/images/avatar.png",
        };
      }),
    );
  }, [effectiveModel.days, baseCenter]);

  // ✅ 최초 1회: 전체 첫 entry로 초기 포커스
  useEffect(() => {
    if (focusLatLng) return;
    if (!markers.length) return;

    const first = markers[0];
    setFocusLatLng({ lat: first.lat, lng: first.lng });
  }, [markers, focusLatLng]);

  // ✅ 방법 B 핵심: activeDayId가 바뀌면 항상 해당 day의 첫 entry로 포커스 이동
  useEffect(() => {
    const dayIndex = Number(activeDayId.replace("day-", ""));
    const firstEntryId = effectiveModel.days.find(
      (d) => d.dayIndex === dayIndex,
    )?.entries?.[0]?.id;

    if (!firstEntryId) return;

    const m = markers.find((x) => x.id === firstEntryId);
    if (!m) return;

    setFocusLatLng({ lat: m.lat, lng: m.lng });
  }, [activeDayId, effectiveModel.days, markers]);

  const breadcrumbItems: Crumb[] = useMemo(
    () => [
      { label: "Recap Blogs", href: "/profile/recap-blogs" },
      { label: "Map", href: "/profile/recap-blogs?view=map" },
      { label: `(${effectiveModel.hero.title})` },
    ],
    [effectiveModel.hero.title],
  );

  const dayTabs: DayTab[] = useMemo(() => {
    return effectiveModel.days.map((d) => ({
      id: `day-${d.dayIndex}`,
      label: `Day ${d.dayIndex}`,
    }));
  }, [effectiveModel.days]);

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

  useEffect(() => {
    if (!dayTabs.length) return;
    if (!dayTabs.some((t) => t.id === activeDayIdRef.current)) {
      setActiveDayId(dayTabs[0].id);
    }
  }, [dayTabs]);

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
      if (elapsed < 1200) {
        raf = requestAnimationFrame(pump);
      }
    };

    raf = requestAnimationFrame(pump);

    return () => cancelAnimationFrame(raf);
  }, [userInteracted]);

  useEffect(() => {
    const root = leftScrollRef.current;
    if (!root) return;
    if (!dayTabs.length) return;

    const TRIGGER_PX = 16;

    const computeActiveTopPinned = () => {
      if (isProgrammaticScrollRef.current) return;

      const rootRect = root.getBoundingClientRect();
      const triggerY = rootRect.top + TRIGGER_PX;

      let chosen: string | null = null;

      for (const t of dayTabs) {
        const el = daySectionRefs.current[t.id];
        if (!el) continue;

        const top = el.getBoundingClientRect().top;

        if (top <= triggerY) {
          chosen = t.id;
        } else {
          break;
        }
      }

      if (!chosen) {
        const first = dayTabs[0]?.id;
        if (first && first !== activeDayIdRef.current) setActiveDayId(first);
        return;
      }

      if (chosen !== activeDayIdRef.current) setActiveDayId(chosen);
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        computeActiveTopPinned();
      });
    };

    const ro = new ResizeObserver(() => {
      computeActiveTopPinned();
    });
    ro.observe(root);

    requestAnimationFrame(() => computeActiveTopPinned());
    setTimeout(() => computeActiveTopPinned(), 150);
    setTimeout(() => computeActiveTopPinned(), 600);

    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", computeActiveTopPinned);

    return () => {
      ro.disconnect();
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", computeActiveTopPinned);
    };
  }, [dayTabs]);

  const scrollToDay = (id: string) => {
    const root = leftScrollRef.current;
    const el = daySectionRefs.current[id];
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

  const focusByMarkerId = (markerId: string) => {
    const m = markers.find((x) => x.id === markerId);
    if (!m) return;
    setFocusLatLng({ lat: m.lat, lng: m.lng });

    // (옵션) 클릭한 entry에 맞춰 day 탭도 동기화하고 싶으면 여기서 entryIdToDayId 활용
    // const dayId = entryIdToDayId.get(markerId);
    // if (dayId && dayId !== activeDayIdRef.current) setActiveDayId(dayId);
  };

  const handleDayChange = (id: string, fromUser = false) => {
    setActiveDayId(id);
    if (fromUser) scrollToDay(id);

    // ✅ 포커스 이동은 useEffect([activeDayId])가 전담 (중복 방지)
  };

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

      if (isOnMap && e.ctrlKey) return;

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
  }, [TOPBAR_OFFSET_PX, userInteracted]);

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

  return (
    <div className="min-h-screen bg-white">
      <RecapBlogTopBar
        title="Recap Blog"
        breadcrumbItems={breadcrumbItems}
        dayTabs={dayTabs}
        activeDayId={activeDayId}
        onDayChange={(id) => handleDayChange(id, true)}
        onGoBack={() => history.back()}
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
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

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
                focusLatLng={focusLatLng ?? undefined}
                mode="place"
                placeMarkers={markers}
                onPlaceMarkerClick={focusByMarkerId}
              />
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
