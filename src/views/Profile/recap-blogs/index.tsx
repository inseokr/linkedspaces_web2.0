"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ResponsiveRecapGrid from "@/views/Profile/recap-blogs/section/ResponsiveRecapGrid";
import { useSearchParams } from "next/navigation";
import CountryRecapCard, {
  type CountryRecapItem,
} from "@/views/Profile/recap-blogs/components/CountryRecapCard";

import AllBlogCard, {
  type AllBlogCardItem,
} from "@/views/Profile/recap-blogs/components/RecapBlogCard";

import ViewAllBlogsButton from "@/views/Profile/recap-blogs/components/ViewAllBlogsButton";

import RecapYearTabs, {
  type RecapYearValue,
} from "@/views/Profile/recap-blogs/components/RecapYearsTab";

import type { Trip } from "@/views/Profile/recap-blogs/types";

import { getCachedUser } from "@/api/user";
import { fetchTripRecapForCover } from "@/api/trips";
import { pickCoverFromRecap } from "@/views/Profile/Trip/utils/mapTripRecap";

import {
  transformToAllBlogItems,
  transformToRecapItems,
  resolveTripCoverUrl,
  isDefaultCoverUrl,
} from "@/views/Profile/recap-blogs/utils/tripDataTransform";

import MapboxMap, {
  type MarkerData,
} from "@/views/Profile/travel-stats/components/MapBoxMap";
import RecapBlogColumn from "@/views/Profile/recap-blogs/section/RecapBlogColumn";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

type Mode = "recap" | "allBlogs";
type View = "grid" | "map";

function normalizeIso2(v: string | null | undefined): string | null {
  const s = v?.trim().toUpperCase();
  if (!s) return null;
  return s;
}

function parseTripYmdToEpoch(input: unknown): number | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;

  const datePart = raw.split(" ")[0] ?? raw;
  const m = /^(\d{4})[:-](\d{2})[:-](\d{2})$/.exec(datePart);
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  )
    return null;

  return Date.UTC(year, month - 1, day);
}

function tripSortKey(t: Trip): number {
  // Prefer end date (most representative of “latest”), fallback to start date.
  const end = parseTripYmdToEpoch((t as any)?.endTimeString);
  const start = parseTripYmdToEpoch((t as any)?.startTimeString);
  if (end != null) return end;
  if (start != null) return start;

  const y = Number((t as any)?.startingYear);
  if (Number.isFinite(y)) return Date.UTC(y, 0, 1);
  return 0;
}

function pickTripCoordinate(
  trip: Trip,
  placeVisitHistory: Array<any | undefined>,
): { lat: number; lng: number; label?: string } | null {
  // 0) If placeVisitHistory isn't available (Safari quota fallback),
  // fall back to the trip's own coordinate (if present).
  const tripCoord = (trip as any)?.coordinate;
  const tripLat = Number(tripCoord?.latitude);
  const tripLng = Number(tripCoord?.longitude);

  const placeList = trip.placeList;
  if (!Array.isArray(placeList) || placeList.length === 0) {
    if (Number.isFinite(tripLat) && Number.isFinite(tripLng)) {
      return {
        lat: tripLat,
        lng: tripLng,
        label: trip.title?.trim() || trip.country || undefined,
      };
    }
    return null;
  }

  const rawIdx = (placeList[0] as any)?.placeIndex;
  const idx = Number(rawIdx);
  if (!Number.isFinite(idx)) {
    if (Number.isFinite(tripLat) && Number.isFinite(tripLng)) {
      return {
        lat: tripLat,
        lng: tripLng,
        label: trip.title?.trim() || trip.country || undefined,
      };
    }
    return null;
  }

  const place = placeVisitHistory[idx];
  if (!place) {
    if (Number.isFinite(tripLat) && Number.isFinite(tripLng)) {
      return {
        lat: tripLat,
        lng: tripLng,
        label: trip.title?.trim() || trip.country || undefined,
      };
    }
    return null;
  }

  // label 후보(장소명)
  const placeName: string | undefined = place?.placeName || place?.visitedCity;

  // 1) place.coordinate 우선
  const c1 = place.coordinate;
  if (c1?.latitude != null && c1?.longitude != null) {
    return {
      lat: Number(c1.latitude),
      lng: Number(c1.longitude),
      label: placeName,
    };
  }

  // 2) photoList[0].location fallback
  const p0 = place.photoList?.[0];
  const c2 = p0?.location ?? p0?.coordinate;
  if (c2?.latitude != null && c2?.longitude != null) {
    return {
      lat: Number(c2.latitude),
      lng: Number(c2.longitude),
      label: placeName,
    };
  }

  return null;
}

function formatTripMarkerDateLabel(
  trip: Trip,
  includeYear: boolean,
): string | undefined {
  const raw = String(trip.startTimeString ?? "").trim();
  if (!raw) return undefined;

  const datePart = raw.split(" ")[0] ?? raw;
  const m = /^(\d{4})[:-](\d{2})[:-](\d{2})$/.exec(datePart);
  if (!m) {
    // If we can't extract a month, don't show a misleading label.
    return includeYear
      ? String(trip.startingYear ?? "").trim() || undefined
      : undefined;
  }

  const year = Number(m[1]);
  const month = Number(m[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return undefined;

  const dt = new Date(Date.UTC(year, month - 1, 1));
  const monthText = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  }).format(dt);

  return includeYear ? `${monthText} ${year}` : monthText;
}

export default function ProfileRecapBlogsView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1.  setting view mode (grid/map) and selected country from URL parameters
  const view = (searchParams.get("view") as View) === "map" ? "map" : "grid";
  const selectedCountryCode = normalizeIso2(searchParams.get("country"));

  const [selectedYear, setSelectedYear] = useState<RecapYearValue>("ALL");
  const [mode, setMode] = useState<Mode>("recap");
  const [isMapOverlayOpen, setIsMapOverlayOpen] = useState(false);
  const mapListScrollRef = useRef<HTMLDivElement | null>(null);
  const [topVisibleBlogId, setTopVisibleBlogId] = useState<string | undefined>(
    undefined,
  );

  // 3. change url when country is selected or cleared
  const openMapForCountry = (countryCode: string) => {
    const code = normalizeIso2(countryCode);

    router.push(`/profile/recap-blog?view=map&country=${code}`);
  };

  const backToGrid = () => {
    // clear country and switch to grid view
    router.push("/profile/recap-blog");
  };
  const [user] = useState<any | null>(() => getCachedUser());

  const username = user?.username;
  const placeVisitHistory = useMemo(
    () => user?.placeVisitHistory ?? [],
    [user],
  );

  // visible trips only
  const visibleTrips: Trip[] = useMemo(() => {
    const trips = (user?.trips ?? []) as Trip[];
    return trips
      .filter((t) => t.privacyControl?.level !== "hidden")
      .slice()
      .sort((a, b) => tripSortKey(b) - tripSortKey(a));
  }, [user]);

  // years tab
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    visibleTrips.forEach((t) => {
      const y = Number(t.startingYear);
      if (Number.isFinite(y)) set.add(y);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [visibleTrips]);

  // year filter should apply to recap / allBlogs / map consistently
  const tripsFilteredByYear: Trip[] = useMemo(() => {
    if (selectedYear === "ALL") return visibleTrips;

    return visibleTrips.filter((t) => {
      const y = Number(t.startingYear);
      return Number.isFinite(y) && y === selectedYear;
    });
  }, [visibleTrips, selectedYear]);

  // Live cover fallback: the cached user snapshot (localStorage, set at login)
  // can be stale or only hold local `file://` photo URIs, in which case
  // resolveTripCoverUrl() falls back to the placeholder image. When that
  // happens, fetch the same live trip-recap API the blog detail page uses
  // (which always has fresh, cloud-hosted photos) to backfill a real cover.
  const [liveCoverByBlogKey, setLiveCoverByBlogKey] = useState<
    Record<string, string>
  >({});
  const fetchedCoverKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!username) return;

    const needsLiveCover = tripsFilteredByYear.filter((t) => {
      const key = String(t.blogKey);
      if (fetchedCoverKeysRef.current.has(key)) return false;
      const cached = resolveTripCoverUrl(t, placeVisitHistory);
      return isDefaultCoverUrl(cached);
    });
    if (needsLiveCover.length === 0) return;

    needsLiveCover.forEach((t) => {
      const key = String(t.blogKey);
      fetchedCoverKeysRef.current.add(key);

      fetchTripRecapForCover(username, t.blogKey).then((data) => {
        const cover = data ? pickCoverFromRecap(data) : undefined;
        if (!cover) return;
        setLiveCoverByBlogKey((prev) =>
          prev[key] === cover ? prev : { ...prev, [key]: cover },
        );
      });
    });
  }, [tripsFilteredByYear, placeVisitHistory, username]);

  // recap items (country grouped) - already returns CountryRecapItem[]
  const recapItems = useMemo(() => {
    return transformToRecapItems(tripsFilteredByYear, placeVisitHistory);
  }, [tripsFilteredByYear, placeVisitHistory]);

  // all blogs items - href is single source of truth
  const allBlogItems = useMemo(() => {
    return transformToAllBlogItems(tripsFilteredByYear, {
      username,
      placeVisitHistory,
      includeYearInDateLabel: selectedYear === "ALL",
    }).map((it) =>
      liveCoverByBlogKey[it.id]
        ? { ...it, coverImageUrl: liveCoverByBlogKey[it.id] }
        : it,
    );
  }, [
    tripsFilteredByYear,
    username,
    placeVisitHistory,
    selectedYear,
    liveCoverByBlogKey,
  ]);

  const normalizedSelectedCountry = useMemo(
    () => normalizeIso2(selectedCountryCode),
    [selectedCountryCode],
  );

  // map left list: same AllBlogCardItem[] generator, filtered by selected country
  const tripsForSelectedCountry: Trip[] = useMemo(() => {
    if (!normalizedSelectedCountry) return [];
    return tripsFilteredByYear.filter((t) => {
      const code = normalizeIso2(String(t.countryCode ?? ""));
      return code === normalizedSelectedCountry;
    });
  }, [tripsFilteredByYear, normalizedSelectedCountry]);

  const mapLeftBlogItems: AllBlogCardItem[] = useMemo(() => {
    return transformToAllBlogItems(tripsForSelectedCountry, {
      username,
      placeVisitHistory,
      includeYearInDateLabel: selectedYear === "ALL",
    }).map((it) =>
      liveCoverByBlogKey[it.id]
        ? { ...it, coverImageUrl: liveCoverByBlogKey[it.id] }
        : it,
    );
  }, [
    tripsForSelectedCountry,
    username,
    placeVisitHistory,
    selectedYear,
    liveCoverByBlogKey,
  ]);

  // map markers: Trip -> MarkerData
  const mapMarkers: MarkerData[] = useMemo(() => {
    if (!normalizedSelectedCountry) return [];

    const coverByBlogKey = new Map<string, string>();
    for (const item of transformToAllBlogItems(tripsForSelectedCountry, {
      username,
      placeVisitHistory,
      includeYearInDateLabel: selectedYear === "ALL",
    })) {
      coverByBlogKey.set(
        String(item.id),
        liveCoverByBlogKey[item.id] || item.coverImageUrl,
      );
    }

    return tripsForSelectedCountry
      .map((trip) => {
        const coord = pickTripCoordinate(trip, placeVisitHistory);
        if (!coord) return null;

        const blogKey = String(trip.blogKey);
        const year = Number(trip.startingYear);
        const title =
          trip.title?.trim() ||
          coord.label?.trim() ||
          trip.country?.trim() ||
          normalizedSelectedCountry;

        return {
          id: blogKey, // markerId = blogKey
          lat: coord.lat,
          lng: coord.lng,
          year: Number.isFinite(year) ? year : new Date().getFullYear(),
          label: title,
          imageUrl: coverByBlogKey.get(blogKey) || "/images/recap/kr.png",
          dateLabel: formatTripMarkerDateLabel(trip, selectedYear === "ALL"),
        };
      })
      .filter(Boolean) as MarkerData[];
  }, [
    normalizedSelectedCountry,
    tripsForSelectedCountry,
    placeVisitHistory,
    username,
    selectedYear,
    liveCoverByBlogKey,
  ]);

  // Track the trip that is currently at the top of the visible left list.
  useEffect(() => {
    if (view !== "map") return;
    const root = mapListScrollRef.current;
    if (!root) return;

    let raf = 0;
    const computeTopVisible = () => {
      const nodes = Array.from(
        root.querySelectorAll<HTMLElement>("[data-recap-blog-id]"),
      );
      if (nodes.length === 0) {
        setTopVisibleBlogId(undefined);
        return;
      }

      const st = root.scrollTop;
      // Pick the first item that is visible (its bottom is below scrollTop).
      for (const el of nodes) {
        if (el.offsetTop + el.offsetHeight > st + 4) {
          setTopVisibleBlogId(el.dataset.recapBlogId);
          return;
        }
      }

      // Fallback: last item
      setTopVisibleBlogId(nodes[nodes.length - 1]?.dataset.recapBlogId);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(computeTopVisible);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    computeTopVisible();

    return () => {
      root.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [view, mapLeftBlogItems.length]);

  const goToBlogDetail = (blogKey: string) => {
    if (username) router.push(`/trip/${username}/${blogKey}`);
    else router.push(`/trip/${blogKey}`);
  };

  const headerAction = (
    <div className="flex items-center gap-3">
      {/* Grid / Map Toggle */}
      <div className="flex items-center rounded-xl bg-gray-100 p-0.5">
        <button
          onClick={backToGrid}
          className={[
            "px-3 py-1.5 text-[13px] font-semibold transition-all rounded-lg",
            view === "grid"
              ? "bg-white text-black shadow-sm"
              : "text-gray-500 hover:text-black",
          ].join(" ")}
        >
          Grid
        </button>
        <button
          onClick={() => router.push("/profile/recap-blog?view=map")}
          className={[
            "px-3 py-1.5 text-[13px] font-semibold transition-all rounded-lg",
            view === "map"
              ? "bg-white text-black shadow-sm"
              : "text-gray-500 hover:text-black",
          ].join(" ")}
        >
          Map
        </button>
      </div>

      {mode === "recap" && view === "grid" ? (
        <ViewAllBlogsButton onClick={() => setMode("allBlogs")}>
          View All Blogs
        </ViewAllBlogsButton>
      ) : (
        <ViewAllBlogsButton
          onClick={() => {
            if (view === "map") backToGrid();
            else setMode("recap");
          }}
        >
          Go Back
        </ViewAllBlogsButton>
      )}
    </div>
  );

  const renderGridOrMap = () => {
    // map view
    if (view === "map") {
      return (
        <div className="relative flex h-[calc(100vh-180px)] min-h-[520px] flex-col gap-4 lg:flex-row">
          {/* Left: blog list */}
          <aside
            className={[
              "shrink-0 h-full",
              isMapOverlayOpen
                ? "absolute inset-0 z-30 w-full" // 확장: map 위로 덮기
                : "w-full lg:w-[420px]", // 기본: 왼쪽 패널
            ].join(" ")}
          >
            <div className="h-full rounded-2xl border border-black/10 bg-white">
              <div
                ref={mapListScrollRef}
                className="h-full min-h-[220px] overflow-y-auto pr-2 px-4 pt-2 pb-4"
              >
                <RecapBlogColumn
                  items={mapLeftBlogItems}
                  gapClassName="gap-6"
                  onVisibilityClick={(item) => console.log("toggle", item.id)}
                  showVisibilityButton
                  countryLabel={selectedCountryCode ?? undefined}
                  isExpanded={isMapOverlayOpen}
                  onToggleExpand={() => setIsMapOverlayOpen((v) => !v)}
                  layout={isMapOverlayOpen ? "grid" : "list"}
                  minCardWidth={isMapOverlayOpen ? 200 : undefined}
                  maxCardWidth={isMapOverlayOpen ? 300 : undefined}
                />

                {/* Bottom buffer so the last item can scroll up to the top */}
                {!isMapOverlayOpen && (
                  <div aria-hidden className="pointer-events-none h-[55vh]" />
                )}

                {mapLeftBlogItems.length === 0 && (
                  <div className="mt-4 rounded-2xl border border-black/10 p-4 text-sm text-black/60">
                    No blogs for this country in the selected year.
                  </div>
                )}
              </div>
            </div>
            <ScrollToTopButton
              scrollContainerRef={mapListScrollRef}
              scrollTargetReady={view === "map"}
              showAfterPx={400}
            />
          </aside>

          {/* Right: map */}
          <section className="min-w-0 flex-1 h-full">
            <div
              className="h-full w-full overflow-hidden rounded-2xl border border-black/10"
              onWheel={(e) => e.stopPropagation()}
            >
              <MapboxMap
                countryCode={normalizedSelectedCountry ?? undefined}
                markers={mapMarkers}
                onMarkerClick={(markerId) => goToBlogDetail(markerId)}
                activeMarkerId={topVisibleBlogId}
                overlayTopRight={
                  <RecapYearTabs
                    value={selectedYear}
                    years={availableYears}
                    onChange={setSelectedYear}
                    className="border border-black/10 shadow-[0_12px_26px_rgba(0,0,0,0.16)]"
                  />
                }
              />
            </div>
          </section>
        </div>
      );
    }

    // grid view
    if (mode === "recap") {
      return (
        <ResponsiveRecapGrid<CountryRecapItem>
          items={recapItems}
          minCardWidth={300}
          maxCardWidth={600}
          getKey={(it) => it.id}
          renderItem={(it) => (
            <CountryRecapCard
              item={it}
              onSelect={(code) => openMapForCountry(code)}
              // Hide the "years summary" when ALL is selected.
              showTripSummary={selectedYear !== "ALL"}
            />
          )}
        />
      );
    }

    // allBlogs mode
    return (
      <ResponsiveRecapGrid<AllBlogCardItem>
        items={allBlogItems}
        minCardWidth={310}
        maxCardWidth={320}
        // minCardWidth="clamp(300px, 25vw, 320px)"
        // maxCardWidth="clamp(320px, 26vw, 330px)"
        getKey={(it) => it.id}
        renderItem={(it) => (
          <AllBlogCard
            item={it}
            className="mx-auto max-w-[420px]"
            onVisibilityClick={(blog) =>
              console.log("Toggle visibility for:", blog.id)
            }
          />
        )}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Sticky header (title + year filter) */}
      <div className="sticky top-0 z-50 border-b border-black/10 bg-white/95 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div className="p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="space-y-1">
                <h1 className="ml-6 font-[Inter] text-[24px] font-bold leading-[32px] tracking-[-0.5px] text-black">
                  Recap Blog
                </h1>
                <p className="ml-8 font-[Inter] text-[14px] font-normal leading-[20px] tracking-[-0.5px] text-[#8B949E]">
                  Building memories around the world
                </p>
              </div>
            </div>

            <div className="mr-6 flex flex-col items-end gap-3">
              {headerAction}
              {view !== "map" && (
                <RecapYearTabs
                  value={selectedYear}
                  years={availableYears}
                  onChange={setSelectedYear}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">{renderGridOrMap()}</div>
    </div>
  );
}
