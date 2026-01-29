// "use client";

// import React, { useMemo, useRef, useState } from "react";

// import RecapBlogTopBar from "@/views/Trip/section/RecapBlogTopBar"; // 경로는 네 폴더에 맞게
// import type { DayTab } from "@/views/Trip/component/RecapDayTabs";
// import type { Crumb } from "@/views/Trip/component/RecapBlogCrumbBread";

// import RecapBlogHero from "@/views/Trip/component/RecapBlogTopImage";
// import {
//   RecapBlogDaySection,
//   type RecapBlogPageData,
// } from "@/views/Trip/component/RecapBlogPlace";
// import MapboxMap from "@/views/Profile/travel-stats/components/MapBoxMap";

// export default function RecapBlogDetailPageExample() {
//   const hero = {
//     coverImageUrl: "/images/hero/us.jpg",
//     title: "US Adventure",
//     dateText: "Dec 15–20, 2024",
//     locationText: "San Francisco",
//     authorName: "Username",
//     postedLabel: "Posted 5 days ago",
//     avatarUrl: "/images/avatar.png",
//   };

// type RecapApiResponse = any;

// import type { MarkerData } from "@/views/Profile/travel-stats/components/MapBoxMap";

// const demoData: RecapBlogPageData = {
//   hero: {
//     coverImageUrl: "/images/recap/us.png",
//     title: "US Adventure",
//     dateText: "Dec 15–20, 2024",
//     locationText: "San Francisco",
//     authorName: "Username",
//     postedLabel: "Posted 5 days ago",
//     avatarUrl: "/images/recap/kr.png",
//   },
//   days: [
//     {
//       dayIndex: 1,
//       title: "Arrival & First Walk",
//       entries: [
//         {
//           id: "d1-e1",
//           placeName: "Zermatt Station",
//           timeRangeText: "9:30 - 10:10 AM",
//           categoryLabel: "Cafe",
//           liked: true,
//           likeCount: 5,
//           commentCount: 3,
//           caption:
//             "First landing moment. Warm coffee, crisp air, and that postcard feeling hits instantly.",
//           photos: ["/images/recap/kr.png", "/images/recap/kr.png"],
//         },
//         {
//           id: "d1-e2",
//           placeName: "Old Town Stroll",
//           timeRangeText: "11:20 AM - 12:10 PM",
//           categoryLabel: "Walk",
//           liked: false,
//           likeCount: 12,
//           commentCount: 2,
//           caption:
//             "Slow wandering through quiet streets, little shops, and the best kind of unplanned detours.",
//           photos: ["/images/recap/kr.png", "/images/recap/kr.png"],
//         },
//       ],
//     },
//     {
//       dayIndex: 2,
//       title: "Views & Golden Hour",
//       entries: [
//         {
//           id: "d2-e1",
//           placeName: "Gornergrat Railway",
//           timeRangeText: "9:40 - 11:05 AM",
//           categoryLabel: "Scenic",
//           liked: true,
//           likeCount: 21,
//           commentCount: 4,
//           caption:
//             "The climb keeps escalating. Sit on the right side going up—layers of mountain theater.",
//           photos: ["/images/recap/kr.png", "/images/recap/kr.png"],
//         },
//         {
//           id: "d2-e2",
//           placeName: "Riverside Photo Spot",
//           timeRangeText: "4:50 - 5:30 PM",
//           categoryLabel: "Photo",
//           liked: true,
//           likeCount: 18,
//           commentCount: 1,
//           caption:
//             "Golden hour reflections. Stayed way longer than planned because the light kept changing.",
//           photos: ["/images/recap/kr.png", "/images/recap/kr.png"],
//         },
//       ],
//     },
//     {
//       dayIndex: 3,
//       title: "Short Hike & Comfort Food",
//       entries: [
//         {
//           id: "d3-e1",
//           placeName: "Panorama Trailhead",
//           timeRangeText: "10:15 - 12:05 PM",
//           categoryLabel: "Hike",
//           liked: false,
//           likeCount: 9,
//           commentCount: 0,
//           caption:
//             "A short hike with big payoff. Quiet, steady pace, and a view that makes the effort feel free.",
//           photos: ["/images/recap/kr.png", "/images/recap/kr.png"],
//         },
//         {
//           id: "d3-e2",
//           placeName: "Local Dinner Spot",
//           timeRangeText: "6:20 - 7:40 PM",
//           categoryLabel: "Food",
//           liked: true,
//           likeCount: 15,
//           commentCount: 2,
//           caption:
//             "Comfort food finale. Warm, hearty, and exactly what you want after a long day outside.",
//           photos: ["/images/recap/kr.png", "/images/recap/kr.png"],
//         },
//       ],
//     },
//   ],
// };

// //(추가) 문자열 -> 0~1 난수처럼 쓰는 안정적 hash
// function hash01(input: string) {
//   let h = 2166136261; // FNV-1a-ish
//   for (let i = 0; i < input.length; i++) {
//     h ^= input.charCodeAt(i);
//     h = Math.imul(h, 16777619);
//   }
//   // 0~1
//   return (h >>> 0) / 4294967295;
// }

// //(추가) 베이스 좌표 주변으로 퍼지게 가상 lat/lng 생성
// function fakeLatLng(seed: string, base: { lat: number; lng: number }) {
//   const r1 = hash01(seed + ":lat");
//   const r2 = hash01(seed + ":lng");

//   // 반경(대략): 0.02도 ~ 수 km 수준. 원하는 느낌으로 조절 가능
//   const latJitter = (r1 - 0.5) * 0.06; // -0.03 ~ +0.03
//   const lngJitter = (r2 - 0.5) * 0.06;

//   // 경도는 위도에 따라 스케일 조정(너무 찌그러짐 방지)
//   const lngScale = Math.cos((base.lat * Math.PI) / 180) || 1;

//   return {
//     lat: base.lat + latJitter,
//     lng: base.lng + lngJitter / lngScale,
//   };
// }

// export default function TripRecapView({ userId, tripId }: TripRecapViewProps) {
//   const [recapData, setRecapData] = useState<RecapApiResponse | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   /** TopBar 높이(임시) */
//   const TOPBAR_OFFSET_PX = 200;
//   const PANEL_HEIGHT = `calc(100vh - ${TOPBAR_OFFSET_PX}px)`;

//   /** Day 섹션 DOM refs */
//   const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

//   /** Left 내부 스크롤 컨테이너 ref */
//   const leftScrollRef = useRef<HTMLDivElement | null>(null);

//   /** programmatic scroll 락 */
//   const isProgrammaticScrollRef = useRef(false);

//   /** active day */
//   const [activeDayId, setActiveDayId] = useState<string>("day-1");
//   const activeDayIdRef = useRef(activeDayId);
//   useEffect(() => {
//     activeDayIdRef.current = activeDayId;
//   }, [activeDayId]);

//   // ✅ (추가) Map sticky(TopBar 아래에 닿아 붙었는지) 감지용 ref/state
//   const mapStickyRef = useRef<HTMLElement | null>(null);
//   const [isMapPinned, setIsMapPinned] = useState(false);

//   useEffect(() => {
//     let cancelled = false;

//     async function run() {
//       if (!userId || !tripId) return;

//       setLoading(true);
//       setError(null);

//       try {
//         const url = `https://pocketverse.herokuapp.com/LS_API/ls-beta-test/trip-recap/${userId}/${tripId}`;
//         const res = await axios.get(url);
//         if (cancelled) return;
//         setRecapData(res.data);
//       } catch (e: any) {
//         if (cancelled) return;
//         setError(e?.message ?? "Failed to load recap");
//       } finally {
//         if (cancelled) return;
//         setLoading(false);
//       }
//     }

//     run();
//     return () => {
//       cancelled = true;
//     };
//   }, [userId, tripId]);

//   /** 지금은 demoData 우선 */
//   const pageData = useMemo(() => demoData, []);

//   // ✅ (추가) “어느 도시 주변에 찍을지” 베이스 좌표
//   const baseCenter = useMemo(() => {
//     // San Francisco
//     return { lat: 37.7749, lng: -122.4194 };
//   }, []);

//   //(추가) entryId -> dayId 매핑 (마커 클릭 시 day로 이동시키고 싶을 때 사용)
//   const entryIdToDayId = useMemo(() => {
//     const map = new Map<string, string>();
//     pageData.days.forEach((d) => {
//       const dayId = `day-${d.dayIndex}`;
//       d.entries.forEach((e) => map.set(e.id, dayId));
//     });
//     return map;
//   }, [pageData.days]);

//   //(추가) demoData 기반으로 “가상 좌표가 포함된 markers” 생성
//   const markers = useMemo<MarkerData[]>(() => {
//     const year = 2024; // demo용
//     return pageData.days.flatMap((d) =>
//       d.entries.map((e) => {
//         const { lat, lng } = fakeLatLng(e.id, baseCenter);
//         return {
//           id: e.id,
//           lat,
//           lng,
//           year,
//           label: e.placeName,
//           imageUrl: e.photos?.[0] ?? "/images/avatar.png",
//         };
//       }),
//     );
//   }, [pageData.days, baseCenter]);

//   // ✅ breadcrumb (예시)
//   const breadcrumbItems: Crumb[] = useMemo(
//     () => [
//       { label: "United States", href: "/profile/recap-blogs" },
//       { label: "Map", href: "/profile/recap-blogs?view=map" },
// // <<<<<<< Updated upstream
// //       { label: `(${hero.title})` }, // 마지막은 링크 없이 텍스트
// // =======
//       { label: `(${pageData.hero.title})` },
//     ],
//     [pageData.hero.title],
//   );

//   // ✅ day tabs (예시)
//   const dayTabs: DayTab[] = useMemo(
//     () =>
//       pageData.days.map((d) => ({
//         id: `day-${d.dayIndex}`,
//         label: `Day ${d.dayIndex}`,
//       })),
//     [pageData.days],
//   );

//   /** dayTabs 준비되면 active 보정 */
//   useEffect(() => {
//     if (!dayTabs.length) return;
//     if (!dayTabs.some((t) => t.id === activeDayIdRef.current)) {
//       setActiveDayId(dayTabs[0].id);
//     }
//   }, [dayTabs]);

//   /** ✅ Scroll Spy: left 내부 스크롤 기준 */
//   useEffect(() => {
//     const rootEl = leftScrollRef.current;
//     if (!rootEl || !dayTabs.length) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (isProgrammaticScrollRef.current) return;

//         const visible = entries
//           .filter((e) => e.isIntersecting)
//           .sort(
//             (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0),
//           );

//         const el = visible[0]?.target as HTMLElement | undefined;
//         const id = el?.dataset?.dayId;

//         if (id && id !== activeDayIdRef.current) setActiveDayId(id);
//       },
//       {
//         root: rootEl,
//         rootMargin: `-12px 0px -55% 0px`,
//         threshold: [0.2, 0.35, 0.5, 0.65],
//       },
//     );

//     const raf = requestAnimationFrame(() => {
//       dayTabs.forEach((t) => {
//         const el = daySectionRefs.current[t.id];
//         if (el) observer.observe(el);
//       });
//     });

//     return () => {
//       cancelAnimationFrame(raf);
//       observer.disconnect();
//     };
//   }, [dayTabs]);
//   const handleDayChange = (id: string) => {
//     setActiveDayId(id);

//     const root = leftScrollRef.current;
//     const el = daySectionRefs.current[id];
//     if (!root || !el) return;

//     isProgrammaticScrollRef.current = true;

//     //el이 root 안에서 어디 위치인지 계산해서 root만 스크롤
//     const rootRect = root.getBoundingClientRect();
//     const elRect = el.getBoundingClientRect();

//     // root 내부 기준 Y = (el의 화면상 top - root의 화면상 top) + 현재 scrollTop - 여백
//     const PADDING = 12;
//     const nextTop = elRect.top - rootRect.top + root.scrollTop - PADDING;

//     root.scrollTo({ top: nextTop, behavior: "smooth" });

//     window.setTimeout(() => {
//       isProgrammaticScrollRef.current = false;
//     }, 500);
//   };

//   // ✅ (추가) Map 섹션이 TopBar 아래에 “붙었는지(pinned)” 감지
//   useEffect(() => {
//     const onScrollOrResize = () => {
//       const el = mapStickyRef.current;
//       if (!el) return;

//       const rect = el.getBoundingClientRect();
//       // sticky 상태면 top이 TOPBAR_OFFSET_PX 근처(이하)로 유지됨
//       const pinnedNow = rect.top <= TOPBAR_OFFSET_PX + 1;
//       setIsMapPinned(pinnedNow);
//     };

//     onScrollOrResize();
//     window.addEventListener("scroll", onScrollOrResize, { passive: true });
//     window.addEventListener("resize", onScrollOrResize);

//     return () => {
//       window.removeEventListener("scroll", onScrollOrResize);
//       window.removeEventListener("resize", onScrollOrResize);
//     };
//   }, [TOPBAR_OFFSET_PX]);

//   // ✅ (추가) Map이 pinned이면, window wheel을 좌측 패널 스크롤로 “우선 소비”
//   useEffect(() => {
//     if (!isMapPinned) return;

//     const root = leftScrollRef.current;
//     if (!root) return;

//     const canScrollLeftPanel = (deltaY: number) => {
//       const maxTop = root.scrollHeight - root.clientHeight;
//       const cur = root.scrollTop;

//       if (maxTop <= 0) return false;

//       if (deltaY > 0 && cur >= maxTop - 1) return false; // 이미 바닥
//       if (deltaY < 0 && cur <= 0) return false; // 이미 천장

//       return true;
//     };

//     const onWheel = (e: WheelEvent) => {
//       if (isProgrammaticScrollRef.current) return;

//       const delta = e.deltaY;
//       if (!delta) return;

//       // 좌측이 아직 스크롤 가능하면: window 스크롤을 막고 좌측만 스크롤
//       if (canScrollLeftPanel(delta)) {
//         e.preventDefault();
//         root.scrollTop += delta;
//       }
//       // 좌측이 끝(천장/바닥)이라 더 못 움직이면 preventDefault 안 함 → 자연스럽게 전체 스크롤로 전환
//     };

//     window.addEventListener("wheel", onWheel, { passive: false });
//     return () => window.removeEventListener("wheel", onWheel);
//   }, [isMapPinned]);

//   return (
//     <div className="min-h-screen bg-white">
//       {/* ✅ 맨 위 TopBar */}
//       <RecapBlogTopBar
//         title="Recap Blog"
//         breadcrumbItems={breadcrumbItems}
//         dayTabs={dayTabs}
//         activeDayId={activeDayId}
//         onDayChange={handleDayChange}
//         onGoBack={() => history.back()} // 라우터 쓰고 싶으면 router.back()으로 교체
//         className="sticky top-0 z-50"
//       />

//       {/* 본문 */}
//       <div className="space-y-10 p-6">
//         <RecapBlogHero {...pageData.hero} />
//         {/* 5:5 레이아웃 */}
//         <div className="flex flex-col gap-6 lg:flex-row">
//           {/* Left: Day cards */}
//           <section className="min-w-0 flex-1" ref={day1Ref}>
//             <div className="h-[750px]">
//               <div className="h-full overflow-hidden">
//                 <RecapBlogDaySection
//                   dayIndex={1}
//                   title="Arrival in Zermatt"
//                   entries={day1Entries as any}
//                 />
//         {(loading || error) && (
//           <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm">
//             {loading && <div className="font-medium">Loading API recap…</div>}
//             {error && <div className="mt-1 opacity-70">API error: {error}</div>}
//           </div>
//         )}

//         <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
//           {/* Left: sticky + internal scroll (옵션 1: scroll chaining 차단) */}
//           <section
//             className="min-w-0 flex-1 sticky self-start"
//             style={{ top: TOPBAR_OFFSET_PX }}
//           >
//             <div
//               ref={leftScrollRef}
//               className=" w-full overflow-y-auto overscroll-contain touch-pan-y rounded-2xl"
//               style={{ height: PANEL_HEIGHT }}
//             >
//               <div className="space-y-12 p-4">
//                 {pageData.days.map((d) => {
//                   const id = `day-${d.dayIndex}`;
//                   return (
//                     <div
//                       key={id}
//                       data-day-id={id}
//                       ref={(el) => {
//                         daySectionRefs.current[id] = el;
//                       }}
//                       style={{ scrollMarginTop: 12 }}
//                     >
//                       <RecapBlogDaySection
//                         dayIndex={d.dayIndex}
//                         title={d.title}
//                         entries={d.entries as any}
//                       />
//                     </div>
//                   );
//                 })}

//               </div>
//             </div>
//           </section>

//           {/* Right(Map): 동일한 top/height로 sticky */}
//           <section
//             ref={(el) => {
//               mapStickyRef.current = el;
//             }}
//             className="min-w-0 flex-1 sticky self-start"
//             style={{ top: TOPBAR_OFFSET_PX }}
//           >
//             <div
//               className="w-full overflow-hidden rounded-2xl border border-black/10"
//               style={{ height: PANEL_HEIGHT }}
//             >
//               <MapboxMap countryCode="us" mode="place" placeMarkers={markers} />
//             </div>
//           </section>
//         </div>
//       </div>

//       <style jsx>{`
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//       `}</style>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

import RecapBlogTopBar from "@/views/Trip/section/RecapBlogTopBar";
import type { DayTab } from "@/views/Trip/component/RecapDayTabs";
import type { Crumb } from "@/views/Trip/component/RecapBlogCrumbBread";
import RecapBlogHero from "@/views/Trip/component/RecapBlogTopImage";
import {
  RecapBlogDaySection,
  type RecapBlogPageData,
} from "@/views/Trip/component/RecapBlogPlace";
import MapboxMap from "@/views/Profile/travel-stats/components/MapBoxMap";
import { mapTripRecapToPageModel } from "@/views/Trip/utils/mapTripRecap";

interface TripRecapViewProps {
  userId: string;
  tripId: string;
}

// <<<<<<< HEAD

import type { MarkerData } from "@/views/Profile/travel-stats/components/MapBoxMap";

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

//(추가) 문자열 -> 0~1 난수처럼 쓰는 안정적 hash
function hash01(input: string) {
  let h = 2166136261; // FNV-1a-ish
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // 0~1
  return (h >>> 0) / 4294967295;
}

//(추가) 베이스 좌표 주변으로 퍼지게 가상 lat/lng 생성
function fakeLatLng(seed: string, base: { lat: number; lng: number }) {
  const r1 = hash01(seed + ":lat");
  const r2 = hash01(seed + ":lng");

  // 반경(대략): 0.02도 ~ 수 km 수준. 원하는 느낌으로 조절 가능
  const latJitter = (r1 - 0.5) * 0.06; // -0.03 ~ +0.03
  const lngJitter = (r2 - 0.5) * 0.06;

  // 경도는 위도에 따라 스케일 조정(너무 찌그러짐 방지)
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

  /** TopBar 높이(임시) */
  const TOPBAR_OFFSET_PX = 200;
  const PANEL_HEIGHT = `calc(100vh - ${TOPBAR_OFFSET_PX}px)`;

  /** Day 섹션 DOM refs */
  const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /** Left 내부 스크롤 컨테이너 ref */
  const leftScrollRef = useRef<HTMLDivElement | null>(null);

  /** programmatic scroll 락 */
  const isProgrammaticScrollRef = useRef(false);

  /** active day */
  const [activeDayId, setActiveDayId] = useState<string>("day-1");
  const activeDayIdRef = useRef(activeDayId);
  useEffect(() => {
    activeDayIdRef.current = activeDayId;
  }, [activeDayId]);

  // ✅ (추가) Map sticky(TopBar 아래에 닿아 붙었는지) 감지용 ref/state
  const mapStickyRef = useRef<HTMLElement | null>(null);
  const [isMapPinned, setIsMapPinned] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!userId || !tripId) return;

      setLoading(true);
      setError(null);

      try {
        const url = `https://pocketverse.herokuapp.com/LS_API/ls-beta-test/trip-recap/${userId}/${tripId}`;
        const res = await axios.get(url);
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

  // /** 지금은 demoData 우선 */
  const pageData = useMemo(() => demoData, []);

  //(추가) “어느 도시 주변에 찍을지” 베이스 좌표
  const baseCenter = useMemo(() => {
    // San Francisco
    return { lat: 37.7749, lng: -122.4194 };
  }, []);

  //(추가) entryId -> dayId 매핑 (마커 클릭 시 day로 이동시키고 싶을 때 사용)
  const entryIdToDayId = useMemo(() => {
    const map = new Map<string, string>();
    pageData.days.forEach((d) => {
      const dayId = `day-${d.dayIndex}`;
      d.entries.forEach((e) => map.set(e.id, dayId));
    });
    return map;
  }, [pageData.days]);

  //(추가) demoData 기반으로 “가상 좌표가 포함된 markers” 생성
  const markers = useMemo<MarkerData[]>(() => {
    const year = 2024; // demo용
    return pageData.days.flatMap((d) =>
      d.entries.map((e) => {
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
  }, [pageData.days, baseCenter]);

  const breadcrumbItems: Crumb[] = useMemo(
    () => [
      { label: "Recap Blogs", href: "/profile/recap-blogs" },
      { label: "Map", href: "/profile/recap-blogs?view=map" },
      { label: `(${pageData.hero.title})` },
    ],
    [pageData.hero.title],
  );

  const dayTabs: DayTab[] = useMemo(
    () =>
      pageData.days.map((d) => ({
        id: `day-${d.dayIndex}`,
        label: `Day ${d.dayIndex}`,
      })),
    [pageData.days],
  );

  /** dayTabs 준비되면 active 보정 */
  useEffect(() => {
    if (!dayTabs.length) return;
    if (!dayTabs.some((t) => t.id === activeDayIdRef.current)) {
      setActiveDayId(dayTabs[0].id);
    }
  }, [dayTabs]);

  /** ✅ Scroll Spy: left 내부 스크롤 기준 */
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

  // =======
  type RecapApiResponse = any; // TODO: 나중에 실제 응답 타입으로 교체
  type TripRecapResponse = any;

  // export default function TripRecapView_CY({ userId, tripId }: TripRecapViewProps) {
  // const [recapData, setRecapData] = useState<RecapApiResponse | null>(null);
  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);
  // const [activeDayId, setActiveDayId] = useState<string>("day-1");
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!userId || !tripId) return;

      setLoading(true);
      setError(null);

      try {
        //  기존 TripRecap.js의 API 그대로
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

  // --- 여기부터 “데이터 매핑” ---
  // 우선은 fallback(예시 데이터) 유지하고,
  // recapData 구조 파악되면 아래 hero/dayEntries를 실제 값으로 채우면 됨.
  const pageModel = useMemo(() => {
    if (!recapData) return null;
    return mapTripRecapToPageModel(recapData);
  }, [recapData]);

  const activeDayIndex = useMemo(() => {
    const n = Number(activeDayId.replace("day-", ""));
    return Number.isFinite(n) ? n : 1;
  }, [activeDayId]);

  const activeDay: RecapBlogPageData | undefined = useMemo(() => {
    return (
      pageModel?.days?.find((d) => d.dayIndex === activeDayIndex) ??
      pageModel?.days?.[0]
    );
  }, [pageModel?.days, activeDayIndex]);

  // const breadcrumbItems: Crumb[] = useMemo(() => {
  //   const title = pageModel?.hero.title ?? "Trip";
  //   return [
  //     { label: "Recap Blogs", href: "/profile/recap-blogs" },
  //     { label: "Map", href: "/profile/recap-blogs?view=map" },
  //     { label: `(${title})` },
  //   ];
  // }, [pageModel?.hero.title]);

  // const dayTabs: DayTab[] = useMemo(() => {
  //   const days = pageModel?.days ?? [];
  //   return days.map((d) => ({
  //     id: `day-${d.dayIndex}`,
  //     label: `Day ${d.dayIndex}`,
  //   }));
  // }, [pageModel?.days]);

  // const day1Ref = useRef<HTMLDivElement | null>(null);

  // const handleDayChange = (id: string) => {
  //   setActiveDayId(id);
  //   if (id === "day-1") {
  //     day1Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  //   }
  // };

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
        onGoBack={() => history.back()}
        // <<<<<<< HEAD papgeData.hero -> pageModel.Hero
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
              className=" w-full overflow-y-auto overscroll-contain touch-pan-y rounded-2xl"
              style={{ height: PANEL_HEIGHT }}
            >
              <div className="space-y-12 p-4">
                {pageModel.days.map((d) => {
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
                {/* =======
        className="sticky top-0 z-50"
      />

      <div className="space-y-10 p-6">
        <RecapBlogHero {...pageModel.hero} />

        <div className="flex flex-col gap-6 lg:flex-row">
          <section className="min-w-0 flex-1" ref={day1Ref}>
            <div className="h-[750px]">
              <div className="h-full overflow-hidden">
                <RecapBlogDaySection
                  dayIndex={activeDay?.dayIndex ?? 1}
                  title={activeDay?.title ?? ""}
                  entries={activeDay?.entries ?? []}
                />
>>>>>>> origin/develop */}
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
              <MapboxMap mode="place" placeMarkers={markers} />
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
