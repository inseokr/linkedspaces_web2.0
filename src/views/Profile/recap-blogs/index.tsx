"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ResponsiveRecapGrid from "@/views/Profile/recap-blogs/section/ResponsiveRecapGrid";

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

import {
  transformToAllBlogItems,
  transformToRecapItems,
} from "@/views/Profile/recap-blogs/utils/tripDataTransform";

import MapboxMap, {
  type MarkerData,
} from "@/views/Profile/travel-stats/components/MapBoxMap";
import RecapBlogColumn from "@/views/Profile/recap-blogs/section/RecapBlogColumn";

type Mode = "recap" | "allBlogs";
type View = "grid" | "map";

function normalizeIso2(v: string | null | undefined): string | null {
  const s = v?.trim().toUpperCase();
  if (!s) return null;
  return s;
}

function pickTripCoordinate(
  trip: Trip,
  placeVisitHistory: Array<any | undefined>,
): { lat: number; lng: number; label?: string } | null {
  const placeList = trip.placeList;
  if (!Array.isArray(placeList) || placeList.length === 0) return null;

  const rawIdx = (placeList[0] as any)?.placeIndex;
  const idx = Number(rawIdx);
  if (!Number.isFinite(idx)) return null;

  const place = placeVisitHistory[idx];
  if (!place) return null;

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

export default function ProfileRecapBlogsView() {
  const [selectedYear, setSelectedYear] = useState<RecapYearValue>("ALL");
  const [mode, setMode] = useState<Mode>("recap");
  const [isMapOverlayOpen, setIsMapOverlayOpen] = useState(false);
  const router = useRouter();
  // grid ↔ map
  const [view, setView] = useState<View>("grid");
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(
    null,
  );

  const openMapForCountry = (countryCode: string) => {
    setSelectedCountryCode(normalizeIso2(countryCode));
    setView("map");
  };

  const backToGrid = () => {
    setView("grid");
    setSelectedCountryCode(null);
  };

  // user cache
  const user = useMemo(() => getCachedUser(), []);
  const username = user?.username;
  const placeVisitHistory = user?.placeVisitHistory ?? [];

  // visible trips only
  const visibleTrips: Trip[] = useMemo(() => {
    const trips = (user?.trips ?? []) as Trip[];
    return trips.filter((t) => t.privacyControl?.level !== "hidden");
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

  // recap items (country grouped) - already returns CountryRecapItem[]
  const recapItems = useMemo(() => {
    return transformToRecapItems(tripsFilteredByYear, placeVisitHistory);
  }, [tripsFilteredByYear, placeVisitHistory]);

  // all blogs items - href is single source of truth
  const allBlogItems = useMemo(() => {
    return transformToAllBlogItems(tripsFilteredByYear, {
      username,
      placeVisitHistory,
    });
  }, [tripsFilteredByYear, username, placeVisitHistory]);

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
    });
  }, [tripsForSelectedCountry, username, placeVisitHistory]);

  // map markers: Trip -> MarkerData
  const mapMarkers: MarkerData[] = useMemo(() => {
    if (!normalizedSelectedCountry) return [];

    const coverByBlogKey = new Map<string, string>();
    for (const item of transformToAllBlogItems(tripsForSelectedCountry, {
      username,
      placeVisitHistory,
    })) {
      coverByBlogKey.set(String(item.id), item.coverImageUrl);
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
        };
      })
      .filter(Boolean) as MarkerData[];
  }, [
    normalizedSelectedCountry,
    tripsForSelectedCountry,
    placeVisitHistory,
    username,
  ]);

  const goToBlogDetail = (blogKey: string) => {
    if (username) router.push(`/trip/${username}/${blogKey}`);
    else router.push(`/trip/${blogKey}`);
  };

  const renderGridOrMap = () => {
    // map view
    if (view === "map") {
      return (
        <div className="relative flex flex-col gap-4 lg:flex-row">
          {/* Left: blog list */}
          <aside
            className={[
              "shrink-0",
              isMapOverlayOpen
                ? "absolute inset-0 z-30 w-full" //확장: map 위로 덮기
                : "w-full lg:w-[420px]", //기본: 왼쪽 패널
            ].join(" ")}
          >
            <div className="rounded-2xl border border-black/10 bg-white">
              <div className="h-[520px] overflow-y-auto pr-2 px-4 pt-2 pb-4">
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

                {mapLeftBlogItems.length === 0 && (
                  <div className="mt-4 rounded-2xl border border-black/10 p-4 text-sm text-black/60">
                    No blogs for this country in the selected year.
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Right: map */}
          <section className="min-w-0 flex-1">
            <div className="h-[520px] w-full overflow-hidden rounded-2xl border border-black/10">
              <MapboxMap
                countryCode={normalizedSelectedCountry ?? undefined}
                markers={mapMarkers}
                onMarkerClick={(markerId) => goToBlogDetail(markerId)}
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
          minCardWidth={430}
          maxCardWidth={500} // 이걸 줘야 왼쪽 정렬 가능
          // minCardWidth="clamp(300px, 25vw, 450px)"
          // maxCardWidth="clamp(450px, 30vw, 600px)"
          getKey={(it) => it.id}
          renderItem={(it) => (
            <CountryRecapCard
              item={it}
              onSelect={(code) => openMapForCountry(code)}
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
    <div className="p-6 space-y-6">
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

          <div className="ml-6">
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
        </div>

        <RecapYearTabs
          value={selectedYear}
          years={availableYears}
          onChange={setSelectedYear}
          className="mr-6"
        />
      </div>

      {renderGridOrMap()}
    </div>
  );
}
