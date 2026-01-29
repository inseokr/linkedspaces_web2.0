"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/api/client";
import { RecapDay } from "@/views/Trip/component/RecapBlogPlace";
import RecapBlogTopBar from "@/views/Trip/section/RecapBlogTopBar";
import type { DayTab } from "@/views/Trip/component/RecapDayTabs";
import type { Crumb } from "@/views/Trip/component/RecapBlogCrumbBread";
import RecapBlogHero from "@/views/Trip/component/RecapBlogTopImage";
import { RecapBlogDaySection } from "@/views/Trip/component/RecapBlogPlace";
import MapboxMap from "@/views/Profile/travel-stats/components/MapBoxMap";
import { mapTripRecapToPageModel } from "@/views/Trip/utils/mapTripRecap";
import type { MarkerData } from "@/views/Profile/travel-stats/components/MapBoxMap";
import type { TripRecapResponse } from "@/api/trips";
interface TripRecapViewProps {
  userId: string;
  tripId: string;
}

export default function TripRecapView({ userId, tripId }: TripRecapViewProps) {
  const [recapData, setRecapData] = useState<TripRecapResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /** TopBar 높이(임시) */
  const TOPBAR_OFFSET_PX = 250;
  const PANEL_HEIGHT_OFFSET = 220;
  const PANEL_HEIGHT = `calc(100vh - ${PANEL_HEIGHT_OFFSET}px)`;

  /** Day 섹션 DOM refs */
  const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /** Left 내부 스크롤 컨테이너 ref */
  const leftScrollRef = useRef<HTMLDivElement | null>(null);

  /** programmatic scroll 락 */
  const isProgrammaticScrollRef = useRef(false);

  // (추가) Map sticky(TopBar 아래에 닿아 붙었는지) 감지용 ref/state
  const mapStickyRef = useRef<HTMLElement | null>(null);

  /** active day */
  const [activeDayId, setActiveDayId] = useState<string>("day-1");
  const activeDayIdRef = useRef(activeDayId);
  const [isMapPinned, setIsMapPinned] = useState(false);
  useEffect(() => {
    activeDayIdRef.current = activeDayId;
  }, [activeDayId]);

  /** 1. Data Fetching */
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!userId || !tripId) return;

      setLoading(true);
      setError(null);

      try {
        // apiFetch 사용
        // path 인자에 '/ls-beta-test/...' 부터 시작하는 경로를 넣기
        const data = await apiFetch<TripRecapResponse>(
          `/ls-beta-test/trip-recap/${userId}/${tripId}`,
        );

        if (cancelled) return;
        setRecapData(data);
      } catch (e: any) {
        if (cancelled) return;
        // apiFetch에서 정의한 ApiError 형식을 처리
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

  const pageModel = useMemo(() => {
    if (!recapData) return null;
    return mapTripRecapToPageModel(recapData);
  }, [recapData]);

  //(추가) “어느 도시 주변에 찍을지” 베이스 좌표, "데이터에 따라 알아서" 베이스 좌표를 결정
  const baseCenter = useMemo(() => {
    // 1. check if first entry has coordinate
    const firstPos = pageModel?.days?.[0]?.entries?.[0]?.coordinate;

    if (firstPos?.latitude && firstPos?.longitude) {
      return { lat: firstPos.latitude, lng: firstPos.longitude };
    }
    // 2. fallback: San Francisco 좌표
    return { lat: 37.7749, lng: -122.4194 };
  }, [pageModel]);

  //(추가) entryId -> dayId 매핑 (마커 클릭 시 day로 이동시키고 싶을 때 사용)
  const entryIdToDayId = useMemo(() => {
    const map = new Map<string, string>();
    if (!pageModel) return map;
    pageModel.days.forEach((d) => {
      const dayId = `day-${d.dayIndex}`;
      d.entries.forEach((e) => map.set(e.id, dayId));
    });
    return map;
  }, [pageModel]);

  //(추가) demoData 기반으로 “가상 좌표가 포함된 markers” 생성
  const markers = useMemo<MarkerData[]>(() => {
    if (!pageModel) return [];

    // pageModel.hero에 심어둔 startingYear를 가져오거나, 정 없으면 올해 연도 사용
    const travelYear = pageModel.hero.startingYear ?? new Date().getFullYear();

    return pageModel.days.flatMap((d) =>
      d.entries.map((e) => ({
        id: e.id,
        lat: e.coordinate?.latitude ?? baseCenter.lat,
        lng: e.coordinate?.longitude ?? baseCenter.lng,
        year: travelYear,
        label: e.placeName,
        imageUrl: e.photos?.[0] ?? "/images/avatar.png",
      })),
    );
  }, [pageModel, baseCenter]);

  const breadcrumbItems: Crumb[] = useMemo(() => {
    const title = pageModel?.hero.title ?? "Trip";
    return [
      { label: "Recap Blogs", href: "/profile/recap-blogs" },
      { label: "Map", href: "/profile/recap-blogs?view=map" },
      { label: `(${title})` },
    ];
  }, [pageModel?.hero.title]);

  const dayTabs: DayTab[] = useMemo(() => {
    return (
      pageModel?.days.map((d) => ({
        id: `day-${d.dayIndex}`,
        label: `Day ${d.dayIndex}`,
      })) ?? []
    );
  }, [pageModel?.days]);

  /** dayTabs 준비되면 active 보정 */
  useEffect(() => {
    if (!dayTabs.length) return;
    if (!dayTabs.some((t) => t.id === activeDayIdRef.current)) {
      setActiveDayId(dayTabs[0].id);
    }
  }, [dayTabs]);

  /**  Scroll Spy: left 내부 스크롤 기준 */
  useEffect(() => {
    const rootEl = leftScrollRef.current;
    if (!rootEl || !dayTabs.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0),
          );

        const el = visible[0]?.target as HTMLElement | undefined;
        const id = el?.dataset?.dayId;

        if (id && id !== activeDayIdRef.current) setActiveDayId(id);
      },
      {
        root: rootEl,
        rootMargin: `-12px 0px -55% 0px`,
        threshold: [0.2, 0.35, 0.5, 0.65],
      },
    );

    const raf = requestAnimationFrame(() => {
      dayTabs.forEach((t) => {
        const el = daySectionRefs.current[t.id];
        if (el) observer.observe(el);
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [dayTabs]);

  const handleDayChange = (id: string) => {
    setActiveDayId(id);

    const root = leftScrollRef.current;
    const el = daySectionRefs.current[id];
    if (!root || !el) return;

    isProgrammaticScrollRef.current = true;

    //el이 root 안에서 어디 위치인지 계산해서 root만 스크롤
    const rootRect = root.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    // root 내부 기준 Y = (el의 화면상 top - root의 화면상 top) + 현재 scrollTop - 여백
    const PADDING = 12;
    const nextTop = elRect.top - rootRect.top + root.scrollTop - PADDING;

    root.scrollTo({ top: nextTop, behavior: "smooth" });

    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 500);
  };

  // (추가) Map 섹션이 TopBar 아래에 “붙었는지(pinned)” 감지
  useEffect(() => {
    const onScrollOrResize = () => {
      const el = mapStickyRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      // sticky 상태면 top이 TOPBAR_OFFSET_PX 근처(이하)로 유지됨
      const pinnedNow = rect.top <= TOPBAR_OFFSET_PX + 1;
      setIsMapPinned(pinnedNow);
    };

    onScrollOrResize();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [TOPBAR_OFFSET_PX]);

  // (추가) Map이 pinned이면, window wheel을 좌측 패널 스크롤로 “우선 소비”
  useEffect(() => {
    if (!isMapPinned) return;

    const root = leftScrollRef.current;
    if (!root) return;

    const canScrollLeftPanel = (deltaY: number) => {
      const maxTop = root.scrollHeight - root.clientHeight;
      const cur = root.scrollTop;

      if (maxTop <= 0) return false;

      if (deltaY > 0 && cur >= maxTop - 1) return false; // 이미 바닥
      if (deltaY < 0 && cur <= 0) return false; // 이미 천장

      return true;
    };

    const onWheel = (e: WheelEvent) => {
      if (isProgrammaticScrollRef.current) return;

      const delta = e.deltaY;
      if (!delta) return;

      // 좌측이 아직 스크롤 가능하면: window 스크롤을 막고 좌측만 스크롤
      if (canScrollLeftPanel(delta)) {
        e.preventDefault();
        root.scrollTop += delta;
      }
      // 좌측이 끝(천장/바닥)이라 더 못 움직이면 preventDefault 안 함 → 자연스럽게 전체 스크롤로 전환
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [isMapPinned]);

  // --- 여기부터 “데이터 매핑” ---
  // 우선은 fallback(예시 데이터) 유지하고,
  // recapData 구조 파악되면 아래 hero/dayEntries를 실제 값으로 채우면 됨.

  const activeDayIndex = useMemo(() => {
    const n = Number(activeDayId.replace("day-", ""));
    return Number.isFinite(n) ? n : 1;
  }, [activeDayId]);

  const activeDay: RecapDay | undefined = useMemo(() => {
    return (
      pageModel?.days?.find((d) => d.dayIndex === activeDayIndex) ??
      pageModel?.days?.[0]
    );
  }, [pageModel?.days, activeDayIndex]);

  // --- 로딩/에러 처리 ---
  if (loading) {
    return <div className="p-6">Loading recap…</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="font-semibold">Failed to load recap</div>
        <div className="mt-2 text-sm opacity-70">{error}</div>
      </div>
    );
  }

  if (!pageModel) return <div className="p-6">No recap data</div>;
  // >>>>>>> origin/develop
  return (
    <div className="min-h-screen bg-white">
      <RecapBlogTopBar
        title="Recap Blog"
        breadcrumbItems={breadcrumbItems}
        dayTabs={dayTabs}
        activeDayId={activeDayId}
        onDayChange={handleDayChange}
        onGoBack={() => window.history.back()}
        className="sticky top-0 z-50 border-b border-black/10"
      />
      <div className="space-y-10 p-6">
        <RecapBlogHero {...pageModel.hero} />

        {(loading || error) && (
          <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm">
            {loading && <div className="font-medium">Loading API recap…</div>}
            {error && <div className="mt-1 opacity-70">API error: {error}</div>}
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Left: sticky + internal scroll (옵션 1: scroll chaining 차단) */}
          <section
            className="min-w-0 flex-1 sticky self-start"
            style={{ top: TOPBAR_OFFSET_PX }}
          >
            <div
              ref={leftScrollRef}
              className="w-full overflow-y-auto scrollbar-hide rounded-2xl"
              style={{ height: PANEL_HEIGHT }}
            >
              <div className="space-y-12 p-4">
                {pageModel.days.map((d) => (
                  <div
                    key={d.dayIndex}
                    data-day-id={`day-${d.dayIndex}`}
                    ref={(el) => {
                      daySectionRefs.current[`day-${d.dayIndex}`] = el;
                    }}
                  >
                    <RecapBlogDaySection
                      dayIndex={d.dayIndex}
                      title={d.title}
                      entries={d.entries as any}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
          {/* Right(Map): 동일한 top/height로 sticky */}
          <section
            ref={(el) => {
              mapStickyRef.current = el;
            }}
            className="min-w-0 flex-1 sticky self-start"
            style={{ top: TOPBAR_OFFSET_PX }}
          >
            <div
              className="w-full overflow-hidden rounded-2xl border border-black/10"
              style={{ height: PANEL_HEIGHT }}
            >
              <MapboxMap
                mode="place"
                placeMarkers={markers}
                onPlaceMarkerClick={(markerId) => {
                  console.log("클릭된 마커 ID:", markerId);
                  console.log(
                    "사전에 등록된 키값들:",
                    Array.from(entryIdToDayId.keys()),
                  );
                  // 1. 마커 ID(entryId)로 해당 날짜 ID(dayId)를 찾음
                  const targetDayId = entryIdToDayId.get(markerId);

                  // 2. 해당 날짜 섹션으로 스크롤 이동 함수 호출
                  if (targetDayId) {
                    handleDayChange(targetDayId);
                  }
                }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
