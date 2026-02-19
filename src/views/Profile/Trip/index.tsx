"use client";

import React, {
  useCallback,
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

import RecapBlogTopBar from "@/views/Profile/Trip/section/RecapBlogTopBar";
import RecapDayTabs, {
  type DayTab,
} from "@/views/Profile/Trip/component/RecapDayTabs";
import RecapBlogHero from "@/views/Profile/Trip/component/RecapBlogTopImage";

import { RecapBlogDaySection } from "@/views/Profile/Trip/component/RecapBlogPlace";

import MapboxMap, {
  type MarkerData,
  type PoiInfo,
} from "@/views/Profile/travel-stats/components/MapBoxMap";
import PoiUpdatePopup from "@/views/Profile/Trip/component/PoiUpdatePopup";
import { updatePlaceInfo } from "@/api/user";

import { mapTripRecapToPageModel } from "@/views/Profile/Trip/utils/mapTripRecap";
import BottomSheet from "@/components/ui/BottomSheet";
import { RecapBlogEntryCard } from "@/views/Profile/Trip/component/RecapBlogPlace";

interface TripRecapViewProps {
  userId: string;
  tripId: string;
}

import GuestRecapPage from "./GuestModeIndex";
import { useLayoutMode } from "@/components/layout/LayoutModeContext";

import { useAuth } from "@/hooks/useAuth";

// Mobile/desktop breakpoint hook (tailwind `lg`)
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

function GuestTripRecapShell({ userId, tripId }: TripRecapViewProps) {
  const { setLayoutMode } = useLayoutMode();

  useEffect(() => {
    setLayoutMode("bare");
    return () => setLayoutMode("profile");
  }, [setLayoutMode]);

  return <GuestRecapPage userId={userId} tripId={tripId} />;
}

import { getCachedUser } from "@/api/user";

export default function TripRecapView({ userId, tripId }: TripRecapViewProps) {
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  const [viewerId, setViewerId] = useState<string | null>(null);
  const [viewerResolved, setViewerResolved] = useState(false);

  // Clear legacy local recap drafts on login so DB always wins.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (typeof window === "undefined") return;
    try {
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k) keys.push(k);
      }
      for (const k of keys) {
        if (k.startsWith("recapDraft:")) window.localStorage.removeItem(k);
      }
    } catch {
      // best-effort cleanup
    }
  }, [isAuthenticated]);

  // ✅ isOwner 계산을 훅들보다 아래로 미루지 말고, return들보다 위에서 계산
  const isOwner =
    isAuthenticated && viewerId != null && String(viewerId) === String(userId);

  // ✅ (1) viewerId resolving
  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    setViewerResolved(false);

    (async () => {
      // 로그인 안 했으면 => 게스트 확정
      if (!isAuthenticated) {
        if (!cancelled) {
          setViewerId(null);
          setViewerResolved(true);
        }
        return;
      }

      try {
        const user = getCachedUser();
        if (cancelled) return;
        setViewerId(user?.username ?? null);
      } catch {
        if (cancelled) return;
        setViewerId(null);
      } finally {
        if (cancelled) return;
        setViewerResolved(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  // ✅ (2) 디버그 로그: "조건 return"보다 위에 있어야 훅 순서가 안 깨짐
  useEffect(() => {
    // viewerResolved 이후에만 찍히게 하면 노이즈 줄어듦
    if (authLoading || !viewerResolved) return;

    console.log("[OWNER CHECK]", {
      isAuthenticated,
      viewerResolved,
      authLoading,
      viewerId,
      userId,
      viewerIdStr: viewerId == null ? null : String(viewerId),
      userIdStr: String(userId),
      idEqual: viewerId != null && String(viewerId) === String(userId),
      isOwner,
      cachedUser: (() => {
        try {
          return getCachedUser();
        } catch (e) {
          return { error: e };
        }
      })(),
    });
  }, [authLoading, viewerResolved, isAuthenticated, viewerId, userId, isOwner]);

  // ✅ 이제부터 조건 return 해도 훅 순서가 안 깨짐
  if (authLoading || !viewerResolved)
    return <div className="p-6">Loading…</div>;

  // 소유자 불일치도 게스트
  if (!isOwner) return <GuestTripRecapShell userId={userId} tripId={tripId} />;

  // 소유자만 아래 오너 뷰 렌더
  return <OwnerTripRecapView userId={userId} tripId={tripId} />;
}

function OwnerTripRecapView({ userId, tripId }: TripRecapViewProps) {
  const router = useRouter();
  const isLg = useIsDesktopLg();

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
  const restoredScrollRef = useRef(false);
  const scrollStateKey = useMemo(
    () => `tripRecapScroll:${String(userId)}:${String(tripId)}`,
    [userId, tripId],
  );
  const externalNavKey = useMemo(() => `ls:externalNav:tripRecap`, []);

  const shouldSkipReturnRefetch = useCallback(() => {
    // Returning from an external tab should not reset the UI state.
    // We use a short TTL window.
    const TTL_MS = 30_000;
    try {
      const raw = window.sessionStorage.getItem(externalNavKey);
      if (!raw) return false;
      const ts = Number(raw);
      const now = Date.now();
      if (!Number.isFinite(ts)) {
        window.sessionStorage.removeItem(externalNavKey);
        return false;
      }
      // IMPORTANT: multiple events can fire when returning (pageshow + visibility + focus).
      // Don't clear the flag on first hit; skip the whole burst within TTL.
      if (now - ts < TTL_MS) return true;

      window.sessionStorage.removeItem(externalNavKey);
      return false;
    } catch {
      return false;
    }
  }, [externalNavKey]);

  /** Entry focus helpers */
  const activeEntryIdRef = useRef<string | null>(null);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const focusTimerRef = useRef<number | null>(null);
  const [mobilePlaceSheetEntryId, setMobilePlaceSheetEntryId] = useState<
    string | null
  >(null);

  /** POI click popup */
  const [pendingPoi, setPendingPoi] = useState<{
    poi: PoiInfo;
    targetEntryId: string;
  } | null>(null);
  const [poiSaving, setPoiSaving] = useState(false);

  /** 1) Fetch */
  const fetchRecap = useCallback(async () => {
    if (!userId || !tripId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<TripRecapResponse>(
        `/ls-beta-test/trip-recap/${userId}/${tripId}`,
        { cache: "no-store" },
      );
      setRecapData(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load recap");
    } finally {
      setLoading(false);
    }
  }, [userId, tripId]);

  useEffect(() => {
    void fetchRecap();
  }, [fetchRecap]);

  // When returning via browser back / bfcache, refresh from DB.
  useEffect(() => {
    const onFocus = () => {
      if (shouldSkipReturnRefetch()) return;
      void fetchRecap();
    };
    const onVis = () => {
      if (document.hidden) return;
      if (shouldSkipReturnRefetch()) return;
      void fetchRecap();
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      if (shouldSkipReturnRefetch()) return;
      void fetchRecap();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [fetchRecap, shouldSkipReturnRefetch]);

  /** 2) Effective model = API mapped (always from DB) */
  const effectiveModel: ReturnType<typeof mapTripRecapToPageModel> | null =
    useMemo(() => {
      if (!recapData) return null;

      const pm = mapTripRecapToPageModel(recapData);
      return pm;
    }, [recapData]);

  /** 3) Base center */
  const baseCenter = useMemo(() => {
    const first = effectiveModel?.days?.[0]?.entries?.[0]?.coordinate;
    if (first?.latitude && first?.longitude) {
      return { lat: first.latitude, lng: first.longitude };
    }
    return { lat: 37.7749, lng: -122.4194 };
  }, [effectiveModel]);

  /** 4) Tabs */
  const dayTabs: DayTab[] = useMemo(() => {
    return (
      effectiveModel?.days.map((d) => ({
        id: `day-${d.dayIndex}`,
        label: `Day ${d.dayIndex}`,
      })) ?? []
    );
  }, [effectiveModel]);

  const heroProps = useMemo(() => {
    if (!effectiveModel?.hero) return null;

    return {
      ...effectiveModel.hero,
    };
  }, [effectiveModel?.hero]);

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
  const allMarkers = useMemo<MarkerData[]>(() => {
    if (!effectiveModel) return [];

    const startingYear = recapData?.trip?.startingYear;
    const travelYear =
      (typeof startingYear === "number"
        ? startingYear
        : Number(startingYear)) || new Date().getFullYear();

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
        externalUrl: e.externalUrl,
      })),
    );
  }, [effectiveModel, baseCenter, recapData?.trip?.startingYear]);

  const activeDayMarkers = useMemo<MarkerData[]>(() => {
    if (!activeDayId) return [];
    return allMarkers.filter((m) => entryIdToDayId.get(m.id) === activeDayId);
  }, [allMarkers, entryIdToDayId, activeDayId]);

  /** Active entry + abstract check */
  const activeEntry = useMemo(() => {
    if (!activeEntryId || !effectiveModel) return null;
    return (
      effectiveModel.days
        .flatMap((d) => d.entries)
        .find((e) => e.id === activeEntryId) ?? null
    );
  }, [activeEntryId, effectiveModel]);

  // A place is "abstract" when it has no linked POI yet (no externalUrl)
  const isActiveEntryAbstract = useMemo(
    () => !activeEntry?.externalUrl,
    [activeEntry],
  );

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

  const scrollToEntry = (entryId: string) => {
    const root = leftScrollRef.current;
    const el = entryRefs.current[entryId];
    if (!root || !el) return;

    isProgrammaticScrollRef.current = true;

    const rootRect = root.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    // Align clicked place to the top of the visible scroll area.
    const TOP_PADDING = 12;
    const targetTop = elRect.top - rootRect.top + root.scrollTop - TOP_PADDING;
    const maxTop = root.scrollHeight - root.clientHeight;

    root.scrollTo({
      top: Math.min(Math.max(0, targetTop), Math.max(0, maxTop)),
      behavior: "smooth",
    });

    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 650);
  };

  const focusToEntryId = (entryId: string) => {
    const m = allMarkers.find((x) => x.id === entryId);
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
      setActiveEntryId(entryId);
      focusToEntryId(entryId);

      const dayId = entryIdToDayId.get(entryId);
      if (dayId && dayId !== activeDayIdRef.current) setActiveDayId(dayId);
    }, 120);
  };

  /** 8) initial focus to first marker */
  useEffect(() => {
    if (focusLatLng) return;
    if (!allMarkers.length) return;

    const first = allMarkers[0];
    activeEntryIdRef.current = first.id;
    setActiveEntryId(first.id);
    setFocusLatLng({ lat: first.lat, lng: first.lng });
  }, [allMarkers, focusLatLng]);

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

  /** 9.5) preserve scroll position across tab switch / bfcache */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const save = () => {
      const root = leftScrollRef.current;
      if (!root) return;
      try {
        window.sessionStorage.setItem(
          scrollStateKey,
          JSON.stringify({
            scrollTop: root.scrollTop,
            activeDayId: activeDayIdRef.current,
            activeEntryId: activeEntryIdRef.current,
            focusLatLng,
            ts: Date.now(),
          }),
        );
      } catch {
        // ignore
      }
    };

    const onVis = () => {
      if (document.hidden) save();
    };

    // pagehide fires reliably on iOS when switching apps/tabs.
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [scrollStateKey, focusLatLng]);

  useLayoutEffect(() => {
    if (restoredScrollRef.current) return;
    if (!effectiveModel) return;
    const root = leftScrollRef.current;
    if (!root) return;
    if (typeof window === "undefined") return;

    let parsed: any = null;
    try {
      const raw = window.sessionStorage.getItem(scrollStateKey);
      if (!raw) return;
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    const target = Number(parsed?.scrollTop ?? 0);
    if (!Number.isFinite(target) || target <= 0) return;

    restoredScrollRef.current = true;
    // Prevent initial auto-scroll stabilization from forcing scrollTop=0.
    setUserInteracted(true);

    root.style.scrollBehavior = "auto";

    // Content height can change after images/layout; re-apply a few times.
    let tries = 0;
    const apply = () => {
      const clamped = Math.max(0, Math.min(target, root.scrollHeight));
      root.scrollTop = clamped;
      tries += 1;
      if (tries < 6) requestAnimationFrame(apply);
    };
    requestAnimationFrame(apply);

    // Restore active day/entry if still valid (best-effort).
    const savedDay = String(parsed?.activeDayId ?? "");
    if (savedDay && dayTabs.some((t) => t.id === savedDay)) {
      setActiveDayId(savedDay);
    }
    const savedEntry = String(parsed?.activeEntryId ?? "");
    if (savedEntry) {
      activeEntryIdRef.current = savedEntry;
      setActiveEntryId(savedEntry);
    }

    const savedFocus = parsed?.focusLatLng;
    if (
      savedFocus &&
      typeof savedFocus.lat === "number" &&
      typeof savedFocus.lng === "number" &&
      Number.isFinite(savedFocus.lat) &&
      Number.isFinite(savedFocus.lng)
    ) {
      setFocusLatLng({ lat: savedFocus.lat, lng: savedFocus.lng });
    }
  }, [effectiveModel, scrollStateKey, dayTabs]);

  /** 10) initial scroll stabilization (친구 로직 유지) */
  useLayoutEffect(() => {
    const root = leftScrollRef.current;
    if (!root) return;

    // If we restored scroll (coming back from a new tab / bfcache),
    // do not force-reset the scroll position.
    if (restoredScrollRef.current || userInteracted) return;

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
  }, [dayTabs, allMarkers]);

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
      setActiveEntryId(firstEntryId);
      focusToEntryId(firstEntryId);
    }
  };

  /** POI confirm: update local state + call API */
  const handlePoiConfirm = useCallback(async () => {
    if (!pendingPoi || !recapData) return;
    const { poi, targetEntryId } = pendingPoi;

    // Parse entry id "dayIndex-placeIndex" (both 0-based array indices after -1)
    const [dayPart, placePart] = targetEntryId.split("-");
    const dayArrayIdx = Number(dayPart) - 1; // dayIndex is 1-based
    const placeArrayIdx = Number(placePart);
    if (
      !Number.isFinite(dayArrayIdx) ||
      !Number.isFinite(placeArrayIdx) ||
      dayArrayIdx < 0 ||
      placeArrayIdx < 0
    )
      return;

    const targetDay = recapData.days[dayArrayIdx];
    if (!targetDay) return;
    const targetPlace = targetDay.places[placeArrayIdx];
    if (!targetPlace) return;

    const placeKey = targetPlace.digitizedTime || targetEntryId;
    const mapsUrl = (() => {
      const query = encodeURIComponent(`${poi.name} ${poi.lat},${poi.lng}`);
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    })();

    // 1) Optimistic local update
    setRecapData((prev) => {
      if (!prev) return prev;
      const nextDays = prev.days.map((day, di) => {
        if (di !== dayArrayIdx) return day;
        return {
          ...day,
          places: day.places.map((place, pi) => {
            if (pi !== placeArrayIdx) return place;
            return {
              ...place,
              placeName: poi.name,
              coordinate: { latitude: poi.lat, longitude: poi.lng },
              categories: poi.category ? [poi.category] : place.categories,
              externalUrl: mapsUrl,
            };
          }),
        };
      });
      return { ...prev, days: nextDays };
    });

    setPendingPoi(null);

    // 2) Persist to backend
    setPoiSaving(true);
    try {
      await updatePlaceInfo({
        placeKey,
        placeName: poi.name,
        coordinate: { latitude: poi.lat, longitude: poi.lng },
        categories: poi.category ? [poi.category] : undefined,
        externalUrl: mapsUrl,
      });
    } catch (err) {
      console.error("[POI update] failed", err);
    } finally {
      setPoiSaving(false);
    }
  }, [pendingPoi, recapData]);

  /** 13) marker click: focus + jump to day */
  const focusByMarkerId = (markerId: string) => {
    activeEntryIdRef.current = markerId;
    setActiveEntryId(markerId);
    focusToEntryId(markerId);

    const targetDayId = entryIdToDayId.get(markerId);
    if (targetDayId) setActiveDayId(targetDayId);

    // Ensure the clicked place card is positioned nicely in the left panel.
    scrollToEntry(markerId);

    // Mobile: show bottom sheet for the clicked place.
    if (!isLg) setMobilePlaceSheetEntryId(markerId);
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

      root.scrollTop += delta * 0.6;
    };

    const opts: AddEventListenerOptions = { passive: false, capture: true };
    window.addEventListener("wheel", onWheel, opts);
    document.addEventListener("wheel", onWheel, opts);

    return () => {
      window.removeEventListener("wheel", onWheel, opts);
      document.removeEventListener("wheel", onWheel, opts);
    };
  }, [TOPBAR_OFFSET_PX, userInteracted, allMarkers]);

  /** render */
  // Only block-render on the very first load.
  // For background refetches, keep UI mounted to preserve scroll/state.
  if (loading && !effectiveModel)
    return <div className="p-6">Loading recap blog...</div>;

  if (error) {
    return (
      <div className="p-6">
        <div className="font-semibold">Failed to load recap</div>
        <div className="mt-2 text-sm opacity-70">{error}</div>
      </div>
    );
  }

  if (!effectiveModel) return <div className="p-6">No recap data</div>;

  const mobileSheetEntry =
    mobilePlaceSheetEntryId == null
      ? null
      : (effectiveModel.days
          .flatMap((d) => d.entries)
          .find((e) => e.id === mobilePlaceSheetEntryId) ?? null);

  return (
    <div className="min-h-screen bg-white">
      <RecapBlogTopBar
        title="Recap Blog"
        dayTabs={dayTabs}
        activeDayId={activeDayId}
        onDayChange={(id) => handleDayChange(id, true)}
        onGoBack={() => window.history.back()}
        onEditBlog={() => router.push(`/trip/${userId}/${tripId}/edit`)}
        className="sticky top-0 z-50 border-b border-black/10"
      />

      <div className="space-y-10 p-6">
        {heroProps && <RecapBlogHero {...heroProps} />}

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
              className="relative w-full overflow-hidden rounded-2xl border border-black/10"
              style={{ height: isLg ? PANEL_HEIGHT : "45dvh" }}
            >
              <MapboxMap
                mode="place"
                placeMarkers={activeDayMarkers}
                activePlaceMarkerId={activeEntryId ?? undefined}
                focusLatLng={focusLatLng}
                onPlaceMarkerClick={focusByMarkerId}
                onPoiClick={(poi) => {
                  const entryId = activeEntryIdRef.current;
                  if (!entryId) return;
                  setPendingPoi({ poi, targetEntryId: entryId });
                }}
                overlayTopRight={
                  <div className="rounded-full bg-white/70 backdrop-blur-md border border-white/50 px-2 py-2 shadow-sm">
                    <RecapDayTabs
                      tabs={dayTabs}
                      activeId={activeDayId}
                      onChange={(id) => handleDayChange(id, true)}
                      className="max-w-[min(72vw,420px)] [&>button]:!h-7 [&>button]:!px-3 [&>button]:!text-[13px]"
                    />
                  </div>
                }
              />

              {/* Hint: shown when the active place hasn't been linked to a POI yet */}
              {isActiveEntryAbstract && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none whitespace-nowrap">
                  <div className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 shadow-lg shadow-blue-500/40 text-[13px] font-semibold text-white">
                    {/* Pulsing live dot */}
                    <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                    </span>
                    Tap a nearby place on the map to refine this location
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Mobile: bottom-sheet place modal (opens on marker click) */}
      {!isLg && (
        <BottomSheet
          open={!!mobileSheetEntry}
          onClose={() => setMobilePlaceSheetEntryId(null)}
        >
          {mobileSheetEntry ? (
            <RecapBlogEntryCard
              entry={mobileSheetEntry as any}
              variant="sheet"
            />
          ) : null}
        </BottomSheet>
      )}

      {/* POI update confirmation popup */}
      {pendingPoi &&
        (() => {
          const targetEntry = effectiveModel?.days
            .flatMap((d) => d.entries)
            .find((e) => e.id === pendingPoi.targetEntryId);
          return (
            <PoiUpdatePopup
              poi={pendingPoi.poi}
              targetPlaceName={targetEntry?.placeName ?? "this place"}
              saving={poiSaving}
              onConfirm={handlePoiConfirm}
              onCancel={() => setPendingPoi(null)}
            />
          );
        })()}
    </div>
  );
}
