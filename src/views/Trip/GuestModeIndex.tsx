"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import GuestRecapTopBar from "./section/GuestModeTopBar";
import RecapBlogHero from "./component/RecapBlogTopImage";
import {
  RecapBlogDaySection,
  type RecapBlogPageData,
} from "./component/RecapBlogPlace";
import type { DayTab } from "./component/RecapDayTabs";
import RecapLoginBar from "./component/GuestRBLoginBar"; //추가

import MapboxMap, {
  type MarkerData,
} from "@/views/Profile/travel-stats/components/MapBoxMap";

import SignInHeroCard from "./component/GuestSignInHeroCard";

import SignInModal from "./component/GuestSignInModal";
import DownloadVideoModal from "./component/GuestDownloadVideoModal";

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

//모바일 감지 훅 추가
function useIsDesktopLg() {
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)"); // tailwind lg
    const onChange = () => setIsLg(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return isLg;
}

function hash01(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

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

export default function GuestRecapPage() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const openSignIn = () => setIsSignInOpen(true);
  const closeSignIn = () => setIsSignInOpen(false);

  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const openDownload = () => setIsDownloadOpen(true);
  const closeDownload = () => setIsDownloadOpen(false);

  // ===== layout constants =====
  const TOPBAR_OFFSET_PX = 200; // GuestTopBar 자체가 sticky top=0이므로 0 추천
  const PANEL_HEIGHT_OFFSET = 100;
  const PANEL_HEIGHT = `calc(100vh - ${PANEL_HEIGHT_OFFSET}px)`;

  // ===== data =====
  const effectiveModel: RecapBlogPageData = useMemo(() => demoData, []);

  const dayTabs: DayTab[] = useMemo(() => {
    return effectiveModel.days.map((d) => ({
      id: `day-${d.dayIndex}`,
      label: `Day ${d.dayIndex}`,
    }));
  }, [effectiveModel.days]);

  const baseCenter = useMemo(() => ({ lat: 37.7749, lng: -122.4194 }), []);

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

  const entryIdToDayId = useMemo(() => {
    const map = new Map<string, string>();
    effectiveModel.days.forEach((d) => {
      const dayId = `day-${d.dayIndex}`;
      d.entries.forEach((e: any) => map.set(e.id, dayId));
    });
    return map;
  }, [effectiveModel.days]);

  // ===== refs =====
  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const entryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const mapStickyRef = useRef<HTMLElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // ===== guard flags =====
  const isProgrammaticScrollRef = useRef(false);

  // (추가) 사용자가 실제로 한번이라도 입력했는지 (초기 렌더에서 강제 스크롤 전환 방지용)
  const [userInteracted, setUserInteracted] = useState(false);

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

  // ===== day state =====
  const [activeDayId, setActiveDayId] = useState<string>(
    dayTabs[0]?.id ?? "day-1",
  );
  const activeDayIdRef = useRef(activeDayId);
  useEffect(() => {
    activeDayIdRef.current = activeDayId;
  }, [activeDayId]);

  // ===== map focus =====
  const [focusLatLng, setFocusLatLng] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);
  const activeEntryIdRef = useRef<string | null>(null);
  const focusTimerRef = useRef<number | null>(null);

  // 최초 1회 포커스 - 커밋 오류때매 일단 삭제
  // useEffect(() => {
  //     if (focusLatLng) return;
  //     if (!markers.length) return;
  //     const first = markers[0];
  //     activeEntryIdRef.current = first.id;
  //     setFocusLatLng({ lat: first.lat, lng: first.lng });
  // }, [markers, focusLatLng]);

  const focusToEntryId = (entryId: string) => {
    const m = markers.find((x) => x.id === entryId);
    if (!m) return seen();
    setFocusLatLng({ lat: m.lat, lng: m.lng });

    function seen() {
      // noop
    }
  };

  // ===== scroll helpers =====
  const scrollToDay = (dayId: string) => {
    const root = leftScrollRef.current;
    const el = daySectionRefs.current[dayId];
    if (!root || !el) return;

    isProgrammaticScrollRef.current = true;

    const rootRect = root.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const PADDING = 10;

    const nextTop = elRect.top - rootRect.top + root.scrollTop - PADDING;
    root.scrollTo({ top: nextTop, behavior: "smooth" });

    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 650);
  };

  const scrollToEntry = (entryId: string) => {
    const root = leftScrollRef.current;
    const el = entryRefs.current[entryId];
    if (!root || !el) return;

    isProgrammaticScrollRef.current = true;

    const rootRect = root.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    // entry를 패널 중앙 근처로 보내기
    const targetTop =
      elRect.top - rootRect.top + root.scrollTop - rootRect.height * 0.35;

    root.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });

    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 650);
  };

  // ===== core: center-closest entry =====
  const getClosestEntryToCenter = () => {
    const root = leftScrollRef.current;
    if (!root) return null;

    const rootRect = root.getBoundingClientRect();
    const centerY = rootRect.top + rootRect.height / 2;

    let bestId: string | null = null;
    let bestDist = Infinity;

    for (const [id, el] of Object.entries(entryRefs.current)) {
      if (!el) continue;

      const r = el.getBoundingClientRect();
      const entryCenterY = r.top + r.height / 2;

      // root 화면 밖의 entry가 과하게 잡히는 걸 줄이고 싶으면 아래 조건 유지
      if (r.bottom < rootRect.top || r.top > rootRect.bottom) continue;

      const dist = Math.abs(entryCenterY - centerY);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = id;
      }
    }

    return bestId;
  };

  const scheduleFocusToEntry = (entryId: string) => {
    if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current);

    focusTimerRef.current = window.setTimeout(() => {
      if (activeEntryIdRef.current === entryId) return;

      activeEntryIdRef.current = entryId;
      focusToEntryId(entryId);

      // entry 기준 day 탭 동기화
      const dayId = entryIdToDayId.get(entryId);
      if (dayId && dayId !== activeDayIdRef.current) {
        setActiveDayId(dayId);
      }
    }, 120);
  };

  // ===== scroll listener: (1) day highlight + (2) entry center focus =====
  useEffect(() => {
    const root = leftScrollRef.current;
    if (!root) return;
    if (!dayTabs.length) return;

    const TRIGGER_PX = 16;

    const compute = () => {
      if (isProgrammaticScrollRef.current) return;

      // (A) day 선택: 기존 로직 유지 (top 기준)
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

      if (!chosen) chosen = dayTabs[0]?.id ?? null;
      if (chosen && chosen !== activeDayIdRef.current) setActiveDayId(chosen);

      // (B) entry 선택: 가운데 가장 가까운 entry
      const closestEntryId = getClosestEntryToCenter();
      if (closestEntryId) scheduleFocusToEntry(closestEntryId);
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        compute();
      });
    };

    const ro = new ResizeObserver(() => compute());
    ro.observe(root);

    requestAnimationFrame(() => compute());
    setTimeout(() => compute(), 150);
    setTimeout(() => compute(), 600);

    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute);

    return () => {
      ro.disconnect();
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
      if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current);
    };
  }, [dayTabs, entryIdToDayId]);

  // ===== DayTab click =====
  const handleDayChange = (dayId: string) => {
    setActiveDayId(dayId);
    scrollToDay(dayId);

    // 클릭했을 때는 그 day의 첫 entry로 카메라 즉시 이동
    const dayIndex = Number(dayId.replace("day-", ""));
    const firstEntryId = effectiveModel.days.find(
      (d) => d.dayIndex === dayIndex,
    )?.entries?.[0]?.id;

    if (firstEntryId) {
      activeEntryIdRef.current = firstEntryId;
      focusToEntryId(firstEntryId);
      scrollToEntry(firstEntryId);
    }
  };

  // ===== Marker click: click으로도 이동(카메라 + 스크롤 + day 탭) =====
  const onMarkerClick = (markerId: string) => {
    activeEntryIdRef.current = markerId;
    focusToEntryId(markerId);

    const dayId = entryIdToDayId.get(markerId);
    if (dayId) setActiveDayId(dayId);

    // 왼쪽 리스트도 해당 entry로 이동
    scrollToEntry(markerId);
  };

  useLayoutEffect(() => {
    const root = leftScrollRef.current;
    if (!root) return;

    const canScrollLeftPanel = (deltaY: number) => {
      const maxTop = root.scrollHeight - root.clientHeight;
      const cur = root.scrollTop;

      if (maxTop <= 0) return false;
      if (deltaY > 0 && cur >= maxTop - 1) return false; // 이미 맨 아래
      if (deltaY < 0 && cur <= 0) return false; // 이미 맨 위
      return true;
    };

    const onWheel = (e: WheelEvent) => {
      if (!userInteracted) return; // (추가한 userInteracted 쓰는 경우)
      if (isProgrammaticScrollRef.current) return;

      const delta = e.deltaY;
      if (!delta) return;

      const mapEl = mapStickyRef.current;
      if (!mapEl) return;

      // 조건: "맵 섹션이 TopBar 아래에 닿아 sticky로 붙었는지"
      const rect = mapEl.getBoundingClientRect();
      const pinnedNow = rect.top <= TOPBAR_OFFSET_PX + 1;
      if (!pinnedNow) return;

      // (선택) 맵 위에서 발생한 wheel만 강제 전환하고 싶으면 이 조건 유지
      const mapWrap = mapContainerRef.current;
      // const isOnMap = !!(mapWrap && mapWrap.contains(e.target as Node));
      // if (!isOnMap) return;

      // 맵에서 ctrl+wheel 줌(브라우저/OS 제스처) 살려두기
      if (e.ctrlKey) return;

      // left panel이 더 이상 스크롤 못하면(끝에 닿으면) 전체 스크롤로 넘김
      if (!canScrollLeftPanel(delta)) return;

      //  핵심: 기본 스크롤 막고 left panel만 움직이기
      e.preventDefault();
      e.stopPropagation();
      (e as any).stopImmediatePropagation?.();

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

  // ===== render =====
  return (
    <div className="min-h-screen bg-white">
      {/*맨 위 Login Bar */}
      <RecapLoginBar
        onSignIn={openSignIn}
        onMenuClick={() => console.log("menu")}
      />

      <div className="h-18" />

      <div className="p-3">
        {/* sticky 레이어: Hero 위 우측 상단처럼 보이게 */}
        <div
          className="fixed top-[110px] z-[90]"
          style={{
            right: "max(24px, calc((100vw - 1200px) / 2 + 24px))",
          }}
        >
          <GuestRecapTopBar
            dayTabs={dayTabs}
            activeDayId={activeDayId}
            onDayChange={handleDayChange}
          />
        </div>

        {/* Hero */}
        <RecapBlogHero {...effectiveModel.hero} />
      </div>

      {/* 본문 (left list + map) 그대로 */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left panel */}
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
                const dayId = `day-${d.dayIndex}`;
                return (
                  <div
                    key={dayId}
                    ref={(el) => {
                      daySectionRefs.current[dayId] = el;
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

        {/* Map */}
        <section
          ref={(el) => {
            mapStickyRef.current = el;
          }}
          className="min-w-0 flex-1 sticky self-start"
          style={{ top: TOPBAR_OFFSET_PX }}
        >
          <div
            ref={mapContainerRef}
            className="w-[98%] overflow-hidden rounded-2xl border border-black/10"
            style={{ height: PANEL_HEIGHT }}
          >
            <MapboxMap
              focusLatLng={focusLatLng ?? undefined}
              mode="place"
              placeMarkers={markers}
              onPlaceMarkerClick={onMarkerClick}
            />
          </div>
        </section>
      </div>

      {/* map + leftbar 아래에 SignInHeroCard 추가 */}
      <div className="px-3 pb-10 pt-10">
        <div className="mx-auto w-[95%]">
          <SignInHeroCard
            // 필요하면 카피/버튼 라벨도 override 가능
            title={"Save your moments\non LinkedSpaces."}
            subtitle={"We turn your photos into travel\nrecap blogs"}
            primaryLabel="Sign in"
            secondaryLabel="Download app"
            onPrimaryClick={openSignIn}
            onSecondaryClick={openDownload}
            // 배경 이미지가 이미 기본값이라면 생략 가능
            backgroundSrc="/images/sign-in-bg2.png"
          />
        </div>
      </div>
      <SignInModal
        open={isSignInOpen}
        onClose={closeSignIn}
        onGoogleSignIn={() => console.log("google sign in")}
        onLogin={({ username, password, remember }) => {
          console.log("login", { username, password, remember });
          closeSignIn();
        }}
        onForgotPassword={() => console.log("forgot pw")}
        onCreateAccount={() => console.log("create account")}
      />

      <DownloadVideoModal
        open={isDownloadOpen}
        onClose={closeDownload}
        title="Join to LinkedSpaces!"
        videoSrc="/videos/download.mp4"
        loop
      />
    </div>
  );
}
