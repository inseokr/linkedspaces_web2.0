"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import RecapBlogHero from "./component/RecapBlogTopImage";
import {
  RecapBlogDaySection,
  RecapBlogEntryCard,
  type RecapBlogPageData,
} from "./component/RecapBlogPlace";
import RecapDayTabs, { type DayTab } from "./component/RecapDayTabs";
import RecapLoginBar from "./component/GuestRBLoginBar"; //추가

import MapboxMap, {
  type MarkerData,
} from "@/views/Profile/travel-stats/components/MapBoxMap";

import SignInHeroCard from "./component/GuestSignInHeroCard";

import SignInModal from "./component/GuestSignInModal";
import DownloadVideoModal from "./component/GuestDownloadVideoModal";

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

// //모바일 감지 훅 추가
// function useIsDesktopLg() {
//   const [isLg, setIsLg] = useState(false);

//   useEffect(() => {
//     const mq = window.matchMedia("(min-width: 1024px)"); // tailwind lg
//     const onChange = () => setIsLg(mq.matches);
//     onChange();
//     mq.addEventListener?.("change", onChange);
//     return () => mq.removeEventListener?.("change", onChange);
//   }, []);

//   return isLg;
// }

// function hash01(input: string) {
//   let h = 2166136261;
//   for (let i = 0; i < input.length; i++) {
//     h ^= input.charCodeAt(i);
//     h = Math.imul(h, 16777619);
//   }
//   return (h >>> 0) / 4294967295;
// }

// function fakeLatLng(seed: string, base: { lat: number; lng: number }) {
//   const r1 = hash01(seed + ":lat");
//   const r2 = hash01(seed + ":lng");

//   const latJitter = (r1 - 0.5) * 0.06;
//   const lngJitter = (r2 - 0.5) * 0.06;

//   const lngScale = Math.cos((base.lat * Math.PI) / 180) || 1;

//   return {
//     lat: base.lat + latJitter,
//     lng: base.lng + lngJitter / lngScale,
//   };
// }

// export default function GuestRecapPage() {
//   const [isSignInOpen, setIsSignInOpen] = useState(false);

//   const openSignIn = () => setIsSignInOpen(true);
//   const closeSignIn = () => setIsSignInOpen(false);

//   const [isDownloadOpen, setIsDownloadOpen] = useState(false);

//   const openDownload = () => setIsDownloadOpen(true);
//   const closeDownload = () => setIsDownloadOpen(false);

//   // ===== layout constants =====
//   const TOPBAR_OFFSET_PX = 200; // GuestTopBar 자체가 sticky top=0이므로 0 추천
//   const PANEL_HEIGHT_OFFSET = 100;
//   const PANEL_HEIGHT = `calc(100vh - ${PANEL_HEIGHT_OFFSET}px)`;

//   // ===== data =====
//   const effectiveModel: RecapBlogPageData = useMemo(() => demoData, []);

//   const dayTabs: DayTab[] = useMemo(() => {
//     return effectiveModel.days.map((d) => ({
//       id: `day-${d.dayIndex}`,
//       label: `Day ${d.dayIndex}`,
//     }));
//   }, [effectiveModel.days]);

//   const baseCenter = useMemo(() => ({ lat: 37.7749, lng: -122.4194 }), []);

//   const markers = useMemo<MarkerData[]>(() => {
//     const year = 2024;
//     return effectiveModel.days.flatMap((d) =>
//       d.entries.map((e: any) => {
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
//   }, [effectiveModel.days, baseCenter]);

//   const entryIdToDayId = useMemo(() => {
//     const map = new Map<string, string>();
//     effectiveModel.days.forEach((d) => {
//       const dayId = `day-${d.dayIndex}`;
//       d.entries.forEach((e: any) => map.set(e.id, dayId));
//     });
//     return map;
//   }, [effectiveModel.days]);

//   // ===== refs =====
//   const leftScrollRef = useRef<HTMLDivElement | null>(null);
//   const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
//   const entryRefs = useRef<Record<string, HTMLDivElement | null>>({});

//   const mapStickyRef = useRef<HTMLElement | null>(null);
//   const mapContainerRef = useRef<HTMLDivElement | null>(null);

//   // ===== guard flags =====
//   const isProgrammaticScrollRef = useRef(false);

//   // (추가) 사용자가 실제로 한번이라도 입력했는지 (초기 렌더에서 강제 스크롤 전환 방지용)
//   const [userInteracted, setUserInteracted] = useState(false);

//   useEffect(() => {
//     const mark = () => setUserInteracted(true);
//     window.addEventListener("pointerdown", mark, { once: true });
//     window.addEventListener("keydown", mark, { once: true });
//     window.addEventListener("wheel", mark, { once: true, passive: true });

//     return () => {
//       window.removeEventListener("pointerdown", mark);
//       window.removeEventListener("keydown", mark);
//       window.removeEventListener("wheel", mark);
//     };
//   }, []);

//   // ===== day state =====
//   const [activeDayId, setActiveDayId] = useState<string>(
//     dayTabs[0]?.id ?? "day-1",
//   );
//   const activeDayIdRef = useRef(activeDayId);
//   useEffect(() => {
//     activeDayIdRef.current = activeDayId;
//   }, [activeDayId]);

//   // ===== map focus =====
//   const [focusLatLng, setFocusLatLng] = useState<
//     { lat: number; lng: number } | undefined
//   >(undefined);
//   const activeEntryIdRef = useRef<string | null>(null);
//   const focusTimerRef = useRef<number | null>(null);

//   // 최초 1회 포커스 - 커밋 오류때매 일단 삭제
//   // useEffect(() => {
//   //     if (focusLatLng) return;
//   //     if (!markers.length) return;
//   //     const first = markers[0];
//   //     activeEntryIdRef.current = first.id;
//   //     setFocusLatLng({ lat: first.lat, lng: first.lng });
//   // }, [markers, focusLatLng]);

//   const focusToEntryId = (entryId: string) => {
//     const m = markers.find((x) => x.id === entryId);
//     if (!m) return seen();
//     setFocusLatLng({ lat: m.lat, lng: m.lng });

//     function seen() {
//       // noop
//     }
//   };

//   // ===== scroll helpers =====
//   const scrollToDay = (dayId: string) => {
//     const root = leftScrollRef.current;
//     const el = daySectionRefs.current[dayId];
//     if (!root || !el) return;

//     isProgrammaticScrollRef.current = true;

//     const rootRect = root.getBoundingClientRect();
//     const elRect = el.getBoundingClientRect();
//     const PADDING = 10;

//     const nextTop = elRect.top - rootRect.top + root.scrollTop - PADDING;
//     root.scrollTo({ top: nextTop, behavior: "smooth" });

//     window.setTimeout(() => {
//       isProgrammaticScrollRef.current = false;
//     }, 650);
//   };

//   const scrollToEntry = (entryId: string) => {
//     const root = leftScrollRef.current;
//     const el = entryRefs.current[entryId];
//     if (!root || !el) return;

//     isProgrammaticScrollRef.current = true;

//     const rootRect = root.getBoundingClientRect();
//     const elRect = el.getBoundingClientRect();

//     // entry를 패널 중앙 근처로 보내기
//     const targetTop =
//       elRect.top - rootRect.top + root.scrollTop - rootRect.height * 0.35;

//     root.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });

//     window.setTimeout(() => {
//       isProgrammaticScrollRef.current = false;
//     }, 650);
//   };

//   // ===== core: center-closest entry =====
//   const getClosestEntryToCenter = () => {
//     const root = leftScrollRef.current;
//     if (!root) return null;

//     const rootRect = root.getBoundingClientRect();
//     const centerY = rootRect.top + rootRect.height / 2;

//     let bestId: string | null = null;
//     let bestDist = Infinity;

//     for (const [id, el] of Object.entries(entryRefs.current)) {
//       if (!el) continue;

//       const r = el.getBoundingClientRect();
//       const entryCenterY = r.top + r.height / 2;

//       // root 화면 밖의 entry가 과하게 잡히는 걸 줄이고 싶으면 아래 조건 유지
//       if (r.bottom < rootRect.top || r.top > rootRect.bottom) continue;

//       const dist = Math.abs(entryCenterY - centerY);
//       if (dist < bestDist) {
//         bestDist = dist;
//         bestId = id;
//       }
//     }

//     return bestId;
//   };

//   const scheduleFocusToEntry = (entryId: string) => {
//     if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current);

//     focusTimerRef.current = window.setTimeout(() => {
//       if (activeEntryIdRef.current === entryId) return;

//       activeEntryIdRef.current = entryId;
//       focusToEntryId(entryId);

//       // entry 기준 day 탭 동기화
//       const dayId = entryIdToDayId.get(entryId);
//       if (dayId && dayId !== activeDayIdRef.current) {
//         setActiveDayId(dayId);
//       }
//     }, 120);
//   };

//   // ===== scroll listener: (1) day highlight + (2) entry center focus =====
//   useEffect(() => {
//     const root = leftScrollRef.current;
//     if (!root) return;
//     if (!dayTabs.length) return;

//     const TRIGGER_PX = 16;

//     const compute = () => {
//       if (isProgrammaticScrollRef.current) return;

//       // (A) day 선택: 기존 로직 유지 (top 기준)
//       const rootRect = root.getBoundingClientRect();
//       const triggerY = rootRect.top + TRIGGER_PX;

//       let chosen: string | null = null;

//       for (const t of dayTabs) {
//         const el = daySectionRefs.current[t.id];
//         if (!el) continue;

//         const top = el.getBoundingClientRect().top;
//         if (top <= triggerY) chosen = t.id;
//         else break;
//       }

//       if (!chosen) chosen = dayTabs[0]?.id ?? null;
//       if (chosen && chosen !== activeDayIdRef.current) setActiveDayId(chosen);

//       // (B) entry 선택: 가운데 가장 가까운 entry
//       const closestEntryId = getClosestEntryToCenter();
//       if (closestEntryId) scheduleFocusToEntry(closestEntryId);
//     };

//     let ticking = false;
//     const onScroll = () => {
//       if (ticking) return;
//       ticking = true;
//       requestAnimationFrame(() => {
//         ticking = false;
//         compute();
//       });
//     };

//     const ro = new ResizeObserver(() => compute());
//     ro.observe(root);

//     requestAnimationFrame(() => compute());
//     setTimeout(() => compute(), 150);
//     setTimeout(() => compute(), 600);

//     root.addEventListener("scroll", onScroll, { passive: true });
//     window.addEventListener("resize", compute);

//     return () => {
//       ro.disconnect();
//       root.removeEventListener("scroll", onScroll);
//       window.removeEventListener("resize", compute);
//       if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current);
//     };
//   }, [dayTabs, entryIdToDayId]);

//   // ===== DayTab click =====
//   const handleDayChange = (dayId: string) => {
//     setActiveDayId(dayId);
//     scrollToDay(dayId);

//     // 클릭했을 때는 그 day의 첫 entry로 카메라 즉시 이동
//     const dayIndex = Number(dayId.replace("day-", ""));
//     const firstEntryId = effectiveModel.days.find(
//       (d) => d.dayIndex === dayIndex,
//     )?.entries?.[0]?.id;

//     if (firstEntryId) {
//       activeEntryIdRef.current = firstEntryId;
//       focusToEntryId(firstEntryId);
//       scrollToEntry(firstEntryId);
//     }
//   };

//   // ===== Marker click: click으로도 이동(카메라 + 스크롤 + day 탭) =====
//   const onMarkerClick = (markerId: string) => {
//     activeEntryIdRef.current = markerId;
//     focusToEntryId(markerId);

//     const dayId = entryIdToDayId.get(markerId);
//     if (dayId) setActiveDayId(dayId);

//     // 왼쪽 리스트도 해당 entry로 이동
//     scrollToEntry(markerId);
//   };

//   useLayoutEffect(() => {
//     const root = leftScrollRef.current;
//     if (!root) return;

//     const canScrollLeftPanel = (deltaY: number) => {
//       const maxTop = root.scrollHeight - root.clientHeight;
//       const cur = root.scrollTop;

//       if (maxTop <= 0) return false;
//       if (deltaY > 0 && cur >= maxTop - 1) return false; // 이미 맨 아래
//       if (deltaY < 0 && cur <= 0) return false; // 이미 맨 위
//       return true;
//     };

//     const onWheel = (e: WheelEvent) => {
//       if (!userInteracted) return; // (추가한 userInteracted 쓰는 경우)
//       if (isProgrammaticScrollRef.current) return;

//       const delta = e.deltaY;
//       if (!delta) return;

//       const mapEl = mapStickyRef.current;
//       if (!mapEl) return;

//       // 조건: "맵 섹션이 TopBar 아래에 닿아 sticky로 붙었는지"
//       const rect = mapEl.getBoundingClientRect();
//       const pinnedNow = rect.top <= TOPBAR_OFFSET_PX + 1;
//       if (!pinnedNow) return;

//       // (선택) 맵 위에서 발생한 wheel만 강제 전환하고 싶으면 이 조건 유지
//       const mapWrap = mapContainerRef.current;
//       // const isOnMap = !!(mapWrap && mapWrap.contains(e.target as Node));
//       // if (!isOnMap) return;

//       // 맵에서 ctrl+wheel 줌(브라우저/OS 제스처) 살려두기
//       if (e.ctrlKey) return;

//       // left panel이 더 이상 스크롤 못하면(끝에 닿으면) 전체 스크롤로 넘김
//       if (!canScrollLeftPanel(delta)) return;

//       //  핵심: 기본 스크롤 막고 left panel만 움직이기
//       e.preventDefault();
//       e.stopPropagation();
//       (e as any).stopImmediatePropagation?.();

//       root.scrollTop += delta;
//     };

//     const opts: AddEventListenerOptions = { passive: false, capture: true };
//     window.addEventListener("wheel", onWheel, opts);
//     document.addEventListener("wheel", onWheel, opts);

//     return () => {
//       window.removeEventListener("wheel", onWheel, opts);
//       document.removeEventListener("wheel", onWheel, opts);
//     };
//   }, [TOPBAR_OFFSET_PX, userInteracted]);

//   console.log(
//     "vw",
//     window.innerWidth,
//     "scrollWidth",
//     document.documentElement.scrollWidth,
//   );
//   useEffect(() => {
//     const log = () => {
//       console.log(
//         "vw",
//         window.innerWidth,
//         "scrollWidth",
//         document.documentElement.scrollWidth,
//       );
//     };

//     log(); // 최초 1번
//     window.addEventListener("resize", log);
//     return () => window.removeEventListener("resize", log);
//   }, []);

//   // ===== render =====
//   return (
//     <div className="min-h-screen bg-white">
//       {/*맨 위 Login Bar */}
//       <RecapLoginBar
//         onSignIn={openSignIn}
//         onMenuClick={() => console.log("menu")}
//       />

//       <div className="h-18" />

//       <div className="p-3">
//         {/* sticky 레이어: Hero 위 우측 상단처럼 보이게 */}
//         <div
//           className="fixed top-[110px] z-[90]"
//           style={{
//             right: "max(24px, calc((100vw - 1200px) / 2 + 24px))",
//           }}
//         >
//           <GuestRecapTopBar
//             dayTabs={dayTabs}
//             activeDayId={activeDayId}
//             onDayChange={handleDayChange}
//           />
//         </div>

//         {/* Hero */}
//         <RecapBlogHero {...effectiveModel.hero} />
//       </div>

//       {/* 본문 (left list + map) 그대로 */}
//       <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
//         {/* Left */}
//         <section
//           className="min-w-0 flex-1 sticky self-start"
//           style={{ top: TOPBAR_OFFSET_PX }}
//         >
//           <div
//             ref={leftScrollRef}
//             className="w-full overflow-y-auto overscroll-contain touch-pan-y rounded-2xl"
//             style={{
//               height: PANEL_HEIGHT,
//               scrollBehavior: "auto",
//               overflowAnchor: "none",
//             }}
//           >
//             <div className="space-y-12 p-4">
//               {effectiveModel.days.map((d) => {
//                 const id = `day-${d.dayIndex}`;
//                 return (
//                   <div
//                     key={id}
//                     data-day-id={id}
//                     ref={(el) => {
//                       daySectionRefs.current[id] = el;
//                     }}
//                     style={{ scrollMarginTop: 12 }}
//                   >
//                     <RecapBlogDaySection
//                       dayIndex={d.dayIndex}
//                       title={d.title}
//                       entries={d.entries as any}
//                       onEntryMount={(entryId, el) => {
//                         entryRefs.current[entryId] = el;
//                       }}
//                     />
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </section>

//         {/* Map */}
//         <section
//           ref={(el) => {
//             mapStickyRef.current = el;
//           }}
//           className="min-w-0 flex-1 sticky self-start"
//           style={{ top: TOPBAR_OFFSET_PX }}
//         >
//           <div
//             ref={mapContainerRef}
//             className="w-[98%] overflow-hidden rounded-2xl border border-black/10"
//             style={{ height: PANEL_HEIGHT }}
//           >
//             <MapboxMap
//               focusLatLng={focusLatLng ?? undefined}
//               mode="place"
//               placeMarkers={markers}
//               onPlaceMarkerClick={onMarkerClick}
//             />
//           </div>
//         </section>
//       </div>

//       {/* map + leftbar 아래에 SignInHeroCard 추가 */}
//       <div className="px-3 pb-10 pt-10">
//         <div className="mx-auto w-[95%]">
//           <SignInHeroCard
//             // 필요하면 카피/버튼 라벨도 override 가능
//             title={"Save your moments\non LinkedSpaces."}
//             subtitle={"We turn your photos into travel\nrecap blogs"}
//             primaryLabel="Sign in"
//             secondaryLabel="Download app"
//             onPrimaryClick={openSignIn}
//             onSecondaryClick={openDownload}
//             // 배경 이미지가 이미 기본값이라면 생략 가능
//             backgroundSrc="/images/sign-in-bg2.png"
//           />
//         </div>
//       </div>

//       <SignInModal
//         open={isSignInOpen}
//         onClose={closeSignIn}
//         onGoogleSignIn={() => console.log("google sign in")}
//         onLogin={({ username, password, remember }) => {
//           console.log("login", { username, password, remember });
//           closeSignIn();
//         }}
//         onForgotPassword={() => console.log("forgot pw")}
//         onCreateAccount={() => console.log("create account")}
//       />

//       <DownloadVideoModal
//         open={isDownloadOpen}
//         onClose={closeDownload}
//         title="Join to LinkedSpaces!"
//         videoSrc="/videos/download.mp4"
//         loop
//       />
//     </div>
//   );
// }
// "use client";

// import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

// import { apiFetch } from "@/api/client";
// import type { TripRecapResponse } from "@/api/trips";

// import { mapTripRecapToPageModel } from "@/views/Trip/utils/mapTripRecap";

// import type { DayTab } from "@/views/Trip/component/RecapDayTabs";
// import type { RecapBlogPageData } from "@/views/Trip/component/RecapBlogPlace";
// import { RecapBlogDaySection } from "@/views/Trip/component/RecapBlogPlace";

// import RecapBlogHero from "@/views/Trip/component/RecapBlogTopImage";

// import MapboxMap, { type MarkerData } from "@/views/Profile/travel-stats/components/MapBoxMap";

// // 너가 Guest 페이지에서 쓰는 컴포넌트들 (기존 그대로)
// import RecapLoginBar from "./component/GuestRBLoginBar";
// import GuestRecapTopBar from "./section/GuestRecapTopBar"; // 네 파일 기준 경로로 맞춰
// import SignInHeroCard from "./component/SignInHeroCard";   // 네 파일 기준 경로로 맞춰
// import SignInModal from "./component/SignInModal";         // 네 파일 기준 경로로 맞춰
// import DownloadVideoModal from "./component/DownloadVideoModal"; // 네 파일 기준 경로로 맞춰

import type { TripRecapResponse } from "@/api/trips";

import { apiFetch } from "@/api/client";

import { mapTripRecapToPageModel } from "@/views/Profile/Trip/utils/mapTripRecap";
import BottomSheet from "@/components/ui/BottomSheet";

type Props = {
  userId: string;
  tripId: string;
};

// 모바일 감지 훅 (그대로)
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

export default function GuestRecapPage({ userId, tripId }: Props) {
  const isLg = useIsDesktopLg();

  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [mobileMapPortalTarget, setMobileMapPortalTarget] =
    useState<HTMLDivElement | null>(null);
  const [mobilePlaceSheetEntryId, setMobilePlaceSheetEntryId] = useState<
    string | null
  >(null);

  const openSignIn = () => setIsSignInOpen(true);
  const closeSignIn = () => setIsSignInOpen(false);

  const openDownload = () => setIsDownloadOpen(true);
  const closeDownload = () => setIsDownloadOpen(false);

  // ===== layout constants =====
  const LOGIN_BAR_HEIGHT_PX = 74;
  const MOBILE_TABS_HEIGHT_PX = 56;
  const TOPBAR_OFFSET_PX = 200; // desktop sticky offset (kept as-is)
  const PANEL_HEIGHT_OFFSET = 100;
  const PANEL_HEIGHT = `calc(100vh - ${PANEL_HEIGHT_OFFSET}px)`;

  // Mobile: hide the fixed login bar once the Day tabs become sticky.
  const dayTabsSentinelRef = useRef<HTMLDivElement | null>(null);
  const [hideLoginBar, setHideLoginBar] = useState(false);
  const hideLoginBarRef = useRef(false);
  useEffect(() => {
    hideLoginBarRef.current = hideLoginBar;
  }, [hideLoginBar]);

  // NOTE: keep page layout stable (no spacer height changes) to avoid flicker near
  // the threshold where the day tabs become sticky.
  const mobileHeaderOffsetPx = !isLg && hideLoginBar ? 0 : LOGIN_BAR_HEIGHT_PX;

  useEffect(() => {
    // Desktop layout doesn't use the mobile sticky day tabs.
    if (isLg) {
      setHideLoginBar(false);
      return;
    }

    let raf = 0;
    const recompute = () => {
      const sentinel = dayTabsSentinelRef.current;
      if (!sentinel) return;

      const top = sentinel.getBoundingClientRect().top;
      const currentlyHidden = hideLoginBarRef.current;

      // Use a fixed threshold (bottom of the header when visible) + hysteresis.
      // This avoids oscillation caused by changing the threshold while toggling.
      const threshold = LOGIN_BAR_HEIGHT_PX;
      const HYSTERESIS_PX = 64;

      if (top <= threshold) {
        if (!currentlyHidden) setHideLoginBar(true);
        return;
      }

      if (top > threshold + HYSTERESIS_PX) {
        if (currentlyHidden) setHideLoginBar(false);
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        recompute();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", recompute);

    window.requestAnimationFrame(recompute);
    setTimeout(recompute, 100);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", recompute);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [isLg, LOGIN_BAR_HEIGHT_PX]);

  // ===== (추가) 실제 데이터 fetch =====
  const [recapData, setRecapData] = useState<TripRecapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // ===== (변경) effectiveModel: demoData 대신 API → page model =====
  const effectiveModel: RecapBlogPageData | null = useMemo(() => {
    if (!recapData) return null;

    const pm = mapTripRecapToPageModel(recapData) as any;

    // RecapBlogPageData가 요구하는 hero 필드들을 "무조건 string"으로 정규화
    const hero = pm?.hero ?? {};

    return {
      ...pm,
      hero: {
        ...hero,
        avatarUrl: hero.avatarUrl ?? "/images/avatar.png", //  기본 아바타
        // 아래는 타입이 또 걸릴 가능성 대비(안 걸리면 그대로 둬도 됨)
        title: hero.title ?? "Trip Recap",
        dateText: hero.dateText ?? "",
        locationText: hero.locationText ?? "",
        authorName: hero.authorName ?? "LinkedSpaces",
        postedLabel: hero.postedLabel ?? "",
        coverImageUrl: hero.coverImageUrl ?? "/images/recap/us.png",
      },
    } as RecapBlogPageData;
  }, [recapData]);

  // ===== 탭 =====
  const dayTabs: DayTab[] = useMemo(() => {
    if (!effectiveModel) return [];
    return effectiveModel.days.map((d) => ({
      id: `day-${d.dayIndex}`,
      label: `Day ${d.dayIndex}`,
    }));
  }, [effectiveModel]);

  // ===== baseCenter: 첫 entry 좌표 우선 =====
  const baseCenter = useMemo(() => {
    const first = effectiveModel?.days?.[0]?.entries?.[0]?.coordinate;
    if (first?.latitude && first?.longitude) {
      return { lat: first.latitude, lng: first.longitude };
    }
    return { lat: 37.7749, lng: -122.4194 };
  }, [effectiveModel]);

  // ===== (변경) markers: fakeLatLng 제거, 실제 coordinate 사용 =====
  const allMarkers = useMemo<MarkerData[]>(() => {
    if (!effectiveModel) return [];

    const travelYear =
      (typeof recapData?.trip?.startingYear === "number"
        ? recapData.trip.startingYear
        : Number(recapData?.trip?.startingYear)) || new Date().getFullYear();

    return effectiveModel.days.flatMap((d) =>
      d.entries.map((e: any, idx: number) => ({
        id: e.id,
        lat: e.coordinate?.latitude ?? baseCenter.lat,
        lng: e.coordinate?.longitude ?? baseCenter.lng,
        year: travelYear,
        label: e.placeName,
        imageUrl: e.photos?.[0] ?? "/images/avatar.png",
        visitIndex: idx + 1,
        visitTimeText: e.timeRangeText ?? "",
      })),
    );
  }, [effectiveModel, recapData, baseCenter]);

  const entryIdToDayId = useMemo(() => {
    const map = new Map<string, string>();
    if (!effectiveModel) return map;

    effectiveModel.days.forEach((d) => {
      const dayId = `day-${d.dayIndex}`;
      d.entries.forEach((e: any) => map.set(e.id, dayId));
    });

    return map;
  }, [effectiveModel]);

  // ===== refs =====
  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const entryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mapStickyRef = useRef<HTMLElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const dayMapHostRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ===== guard flags =====
  const isProgrammaticScrollRef = useRef(false);
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
  const [activeDayId, setActiveDayId] = useState<string>("day-1");
  const activeDayIdRef = useRef(activeDayId);
  useEffect(() => {
    activeDayIdRef.current = activeDayId;
  }, [activeDayId]);

  const activeDayMarkers = useMemo<MarkerData[]>(() => {
    if (!activeDayId) return [];
    return allMarkers.filter((m) => entryIdToDayId.get(m.id) === activeDayId);
  }, [allMarkers, entryIdToDayId, activeDayId]);

  // dayTabs 준비되면 초기 activeDayId 보정
  useEffect(() => {
    if (!dayTabs.length) return;
    if (!dayTabs.some((t) => t.id === activeDayIdRef.current)) {
      setActiveDayId(dayTabs[0].id);
    }
  }, [dayTabs]);

  const effectiveDaysCount = effectiveModel?.days.length ?? 0;
  useLayoutEffect(() => {
    // Mobile only: pick the current day section's map host as portal target.
    if (isLg) {
      setMobileMapPortalTarget((prev) => (prev === null ? prev : null));
      return;
    }

    const next = dayMapHostRefs.current[activeDayId] ?? null;
    setMobileMapPortalTarget((prev) => (prev === next ? prev : next));
  }, [activeDayId, isLg, effectiveDaysCount]);

  // Close place sheet on Escape (mobile only)
  useEffect(() => {
    if (isLg) return;
    if (!mobilePlaceSheetEntryId) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobilePlaceSheetEntryId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLg, mobilePlaceSheetEntryId]);

  // ===== map focus =====
  const [focusLatLng, setFocusLatLng] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);
  const activeEntryIdRef = useRef<string | null>(null);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const focusTimerRef = useRef<number | null>(null);

  // 최초 1회 포커스(원하면 다시 켜도 됨): 실제 markers 기준으로
  useEffect(() => {
    if (focusLatLng) return;
    if (!allMarkers.length) return;
    const first = allMarkers[0];
    activeEntryIdRef.current = first.id;
    setActiveEntryId(first.id);
    setFocusLatLng({ lat: first.lat, lng: first.lng });
  }, [allMarkers, focusLatLng]);

  const focusToEntryId = useCallback(
    (entryId: string) => {
      const m = allMarkers.find((x) => x.id === entryId);
      if (!m) return;
      setFocusLatLng({ lat: m.lat, lng: m.lng });
    },
    [allMarkers],
  );

  // ===== scroll helpers (기존 로직 유지) =====
  const scrollToDay = (dayId: string) => {
    const el = daySectionRefs.current[dayId];
    if (!el) return;

    // Desktop: scroll the left panel
    if (isLg) {
      const root = leftScrollRef.current;
      if (!root) return;

      isProgrammaticScrollRef.current = true;

      const rootRect = root.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const PADDING = 10;

      const nextTop = elRect.top - rootRect.top + root.scrollTop - PADDING;
      root.scrollTo({ top: nextTop, behavior: "smooth" });

      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 650);
      return;
    }

    // Mobile: scroll the document
    isProgrammaticScrollRef.current = true;
    const rect = el.getBoundingClientRect();
    const top =
      window.scrollY +
      rect.top -
      (mobileHeaderOffsetPx + MOBILE_TABS_HEIGHT_PX + 12);

    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 650);
  };

  const scrollToEntry = (entryId: string) => {
    const el = entryRefs.current[entryId];
    if (!el) return;

    // Desktop: scroll the left panel
    if (isLg) {
      const root = leftScrollRef.current;
      if (!root) return;

      isProgrammaticScrollRef.current = true;

      const rootRect = root.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      const TOP_PADDING = 12;
      const targetTop =
        elRect.top - rootRect.top + root.scrollTop - TOP_PADDING;
      const maxTop = root.scrollHeight - root.clientHeight;

      root.scrollTo({
        top: Math.min(Math.max(0, targetTop), Math.max(0, maxTop)),
        behavior: "smooth",
      });

      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 650);
      return;
    }

    // Mobile: scroll the document
    isProgrammaticScrollRef.current = true;
    const rect = el.getBoundingClientRect();
    const top =
      window.scrollY +
      rect.top -
      (mobileHeaderOffsetPx + MOBILE_TABS_HEIGHT_PX + 12);
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 650);
  };

  useEffect(() => {
    if (!dayTabs.length) return;

    const TRIGGER_PX = 16;

    const getClosestEntryToCenter = () => {
      // Desktop: compute within the left scroll panel
      if (isLg) {
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

          if (r.bottom < rootRect.top || r.top > rootRect.bottom) continue;

          const dist = Math.abs(entryCenterY - centerY);
          if (dist < bestDist) {
            bestDist = dist;
            bestId = id;
          }
        }

        return bestId;
      }

      // Mobile: compute against viewport center
      const centerY = window.innerHeight / 2;
      let bestId: string | null = null;
      let bestDist = Infinity;

      for (const [id, el] of Object.entries(entryRefs.current)) {
        if (!el) continue;

        const r = el.getBoundingClientRect();
        // Skip entries far outside the viewport to reduce noise
        if (r.bottom < 0 || r.top > window.innerHeight) continue;

        const entryCenterY = r.top + r.height / 2;
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
        setActiveEntryId(entryId);
        focusToEntryId(entryId);

        const dayId = entryIdToDayId.get(entryId);
        if (dayId && dayId !== activeDayIdRef.current) {
          setActiveDayId(dayId);
        }
      }, 120);
    };

    const compute = () => {
      if (isProgrammaticScrollRef.current) return;

      const triggerY = isLg
        ? (() => {
            const root = leftScrollRef.current;
            if (!root) return 0;
            const rootRect = root.getBoundingClientRect();
            return rootRect.top + TRIGGER_PX;
          })()
        : mobileHeaderOffsetPx + MOBILE_TABS_HEIGHT_PX + 8;

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

    requestAnimationFrame(() => compute());
    setTimeout(() => compute(), 150);
    setTimeout(() => compute(), 600);

    // Desktop: listen to left panel scroll; Mobile: listen to window scroll.
    const root = leftScrollRef.current;
    const ro = new ResizeObserver(() => compute());
    if (isLg && root) {
      ro.observe(root);
      root.addEventListener("scroll", onScroll, { passive: true });
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("resize", compute);

    return () => {
      ro.disconnect();
      if (isLg && root) root.removeEventListener("scroll", onScroll);
      else window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
      if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current);
    };
  }, [dayTabs, entryIdToDayId, isLg, mobileHeaderOffsetPx, focusToEntryId]);

  const handleDayChange = (dayId: string) => {
    setActiveDayId(dayId);
    scrollToDay(dayId);

    const dayIndex = Number(dayId.replace("day-", ""));
    const firstEntryId = effectiveModel?.days.find(
      (d) => d.dayIndex === dayIndex,
    )?.entries?.[0]?.id;

    if (firstEntryId) {
      activeEntryIdRef.current = firstEntryId;
      setActiveEntryId(firstEntryId);
      focusToEntryId(firstEntryId);
      scrollToEntry(firstEntryId);
    }
  };

  const onMarkerClick = (markerId: string) => {
    activeEntryIdRef.current = markerId;
    setActiveEntryId(markerId);
    focusToEntryId(markerId);

    const dayId = entryIdToDayId.get(markerId);
    if (dayId) setActiveDayId(dayId);

    // Mobile: open bottom sheet instead of scrolling
    if (!isLg) {
      setMobilePlaceSheetEntryId(markerId);
      return;
    }

    scrollToEntry(markerId);
  };

  useLayoutEffect(() => {
    // Only relevant for the desktop split layout.
    if (!isLg) return;

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

      if (e.ctrlKey) return;
      if (!canScrollLeftPanel(delta)) return;

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
  }, [TOPBAR_OFFSET_PX, userInteracted, isLg]);

  // ===== 로딩/에러 처리 =====
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

  // ===== render (기존 UI 그대로) =====
  return (
    <div className="min-h-screen bg-white">
      <RecapLoginBar
        onSignIn={() => setIsSignInOpen(true)}
        className={[
          "transition-[opacity,transform] duration-200 will-change-transform",
          hideLoginBar
            ? "opacity-0 -translate-y-full pointer-events-none"
            : "opacity-100 translate-y-0",
        ].join(" ")}
      />
      {/* push content below the fixed login bar */}
      <div style={{ height: LOGIN_BAR_HEIGHT_PX }} />

      <div className="p-3">
        <RecapBlogHero {...effectiveModel.hero} />
      </div>

      {/* Mobile: sticky day tabs (now below the header, not on the cover image) */}
      {!isLg && (
        <>
          {/* Sentinel: once this scrolls past the top, day tabs are "stuck" */}
          <div ref={dayTabsSentinelRef} className="h-0" aria-hidden="true" />

          <div
            className="sticky z-[180] border-b border-black/10 bg-white/85 backdrop-blur-md"
            style={{ top: mobileHeaderOffsetPx }}
          >
            <div className="mx-auto w-full px-3 py-2">
              <RecapDayTabs
                tabs={dayTabs}
                activeId={activeDayId}
                onChange={handleDayChange}
                size="sm"
                className="max-w-full"
              />
            </div>
          </div>
        </>
      )}

      {/* Desktop: current split layout (list + sticky map) */}
      {isLg ? (
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
                placeMarkers={activeDayMarkers}
                activePlaceMarkerId={activeEntryId ?? undefined}
                onPlaceMarkerClick={onMarkerClick}
                overlayTopRight={
                  <div className="rounded-full bg-white/70 backdrop-blur-md border border-white/50 px-2 py-2 shadow-sm">
                    <RecapDayTabs
                      tabs={dayTabs}
                      activeId={activeDayId}
                      onChange={handleDayChange}
                      className="max-w-[min(72vw,420px)] [&>button]:!h-7 [&>button]:!px-3 [&>button]:!text-[13px]"
                    />
                  </div>
                }
              />
            </div>
          </section>
        </div>
      ) : (
        <>
          {/* Mobile: map appears at the top of the active day section */}
          {(() => {
            const target = mobileMapPortalTarget;
            if (!target) return null;

            return createPortal(
              <div className="h-full w-full overflow-hidden rounded-2xl border border-black/10">
                <MapboxMap
                  focusLatLng={focusLatLng ?? undefined}
                  mode="place"
                  placeMarkers={activeDayMarkers}
                  activePlaceMarkerId={activeEntryId ?? undefined}
                  onPlaceMarkerClick={onMarkerClick}
                />
              </div>,
              target,
            );
          })()}

          <div className="space-y-12 px-3 pb-6">
            {effectiveModel.days.map((d) => {
              const id = `day-${d.dayIndex}`;
              return (
                <div
                  key={id}
                  data-day-id={id}
                  ref={(el) => {
                    daySectionRefs.current[id] = el;
                  }}
                  style={{
                    scrollMarginTop:
                      mobileHeaderOffsetPx + MOBILE_TABS_HEIGHT_PX + 16,
                  }}
                >
                  {/* map host for this day (portal target) */}
                  <div
                    ref={(el) => {
                      dayMapHostRefs.current[id] = el;
                    }}
                    className="mb-5 h-[50dvh] w-full"
                  />

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

          {/* Mobile: bottom-sheet place modal */}
          {(() => {
            const entryId = mobilePlaceSheetEntryId;
            if (!entryId) return null;

            const entry = effectiveModel.days
              .flatMap((d) => d.entries)
              .find((e) => e.id === entryId);
            if (!entry) return null;

            return (
              <BottomSheet
                open={!!entry}
                onClose={() => setMobilePlaceSheetEntryId(null)}
              >
                <RecapBlogEntryCard entry={entry as any} variant="sheet" />
              </BottomSheet>
            );
          })()}
        </>
      )}

      <div className="px-3 pb-10 pt-10">
        <div className="mx-auto w-[95%]">
          <SignInHeroCard
            title={"Save your moments\non LinkedSpaces."}
            subtitle={"We turn your photos into travel\nrecap blogs"}
            primaryLabel="Sign in"
            secondaryLabel="Download app"
            onPrimaryClick={() => setIsSignInOpen(true)}
            onSecondaryClick={() => setIsDownloadOpen(true)}
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
