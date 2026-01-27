"use client";

import { useMemo, useState, useEffect } from "react";
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

type Mode = "recap" | "allBlogs";

export default function ProfileRecapBlogsView() {
  const [selectedYear, setSelectedYear] = useState<RecapYearValue>("ALL");
  const [mode, setMode] = useState<Mode>("recap");
  const user = useMemo(() => getCachedUser(), []);

  const username = user?.username;
  const placeVisitHistory = user?.placeVisitHistory ?? [];

  const visibleTrips: Trip[] = useMemo(() => {
    const trips = (user?.trips ?? []) as Trip[];
    return trips.filter((t) => t.privacyControl?.level !== "hidden");
  }, [user]);

  const recapItems = useMemo(
    () => transformToRecapItems(visibleTrips, placeVisitHistory),
    [visibleTrips, placeVisitHistory],
  );

  const allBlogItems = useMemo(
    () =>
      transformToAllBlogItems(visibleTrips, { username, placeVisitHistory }),
    [visibleTrips, username, placeVisitHistory],
  );

  const availableYears = useMemo(() => {
    const set = new Set<number>();
    visibleTrips.forEach((t) => {
      const y = Number(t.startingYear);
      if (Number.isFinite(y)) set.add(y);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [visibleTrips]);

  const filteredRecapItems = useMemo(() => {
    if (selectedYear === "ALL") return recapItems;
    return recapItems.filter((item) =>
      item.years.includes(selectedYear as number),
    );
  }, [recapItems, selectedYear]);

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
            <ViewAllBlogsButton
              onClick={() => setMode(mode === "recap" ? "allBlogs" : "recap")}
            >
              {mode === "recap" ? "View All Blogs" : "Go Back"}
            </ViewAllBlogsButton>
          </div>
        </div>

        <RecapYearTabs
          value={selectedYear}
          years={availableYears}
          onChange={setSelectedYear}
          className="mr-6"
        />
      </div>

      {mode === "recap" ? (
        <ResponsiveRecapGrid<CountryRecapItem>
          items={filteredRecapItems}
          minCardWidth={400}
          getKey={(it) => it.id}
          renderItem={(it) => <CountryRecapCard item={it} />}
        />
      ) : (
        <ResponsiveRecapGrid<AllBlogCardItem>
          items={allBlogItems}
          minCardWidth={320}
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
      )}
    </div>
  );
}
