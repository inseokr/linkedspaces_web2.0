"use client";

import { useMemo, useState } from "react";

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

import MapboxMap from "@/views/Profile/travel-stats/components/MapBoxMap";
import RecapBlogColumn from "@/views/Profile/recap-blogs/section/RecapBlogColumn";

type Mode = "recap" | "allBlogs";
type View = "grid" | "map";

export default function ProfileRecapBlogsView() {
  const [selectedYear, setSelectedYear] = useState<RecapYearValue>("ALL");
  const [mode, setMode] = useState<Mode>("recap");

  // grid ↔ map
  const [view, setView] = useState<View>("grid");
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(
    null,
  );

  const openMapForCountry = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
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

  // map left list: same AllBlogCardItem[] generator, filtered by selected country
  const tripsForSelectedCountry: Trip[] = useMemo(() => {
    if (!selectedCountryCode) return [];
    return tripsFilteredByYear.filter(
      (t) =>
        String(t.countryCode ?? "")
          .trim()
          .toUpperCase() === selectedCountryCode,
    );
  }, [tripsFilteredByYear, selectedCountryCode]);

  const mapLeftBlogItems: AllBlogCardItem[] = useMemo(() => {
    return transformToAllBlogItems(tripsForSelectedCountry, {
      username,
      placeVisitHistory,
    });
  }, [tripsForSelectedCountry, username, placeVisitHistory]);

  const renderGridOrMap = () => {
    // map view
    if (view === "map") {
      return (
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left: blog list */}
          <aside className="w-full lg:w-[420px] shrink-0">
            <div className="h-[520px] overflow-y-auto pr-2">
              <RecapBlogColumn
                items={mapLeftBlogItems}
                gapClassName="gap-6"
                onVisibilityClick={(item) => console.log("toggle", item.id)}
                showVisibilityButton
              />

              {mapLeftBlogItems.length === 0 && (
                <div className="mt-4 rounded-2xl border border-black/10 p-4 text-sm text-black/60">
                  No blogs for this country in the selected year.
                </div>
              )}
            </div>
          </aside>

          {/* Right: map */}
          <section className="min-w-0 flex-1">
            <div className="h-[520px] w-full overflow-hidden rounded-2xl border border-black/10">
              {/* markers/country props 연결은 MapboxMap 시그니처에 맞춰 추후 연결 */}
              <MapboxMap />
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
