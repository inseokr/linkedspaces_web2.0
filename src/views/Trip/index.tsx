"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

import RecapBlogTopBar from "@/views/Trip/section/RecapBlogTopBar";
import type { DayTab } from "@/views/Trip/component/RecapDayTabs";
import type { Crumb } from "@/views/Trip/component/RecapBlogCrumbBread";
import type { TripRecapResponse } from "@/api/trips";
import RecapBlogHero from "@/views/Trip/component/RecapBlog";
import {
  RecapBlogDaySection,
  type RecapDay,
} from "@/views/Trip/component/RecapBlogPlace";
import MapboxMap from "@/views/Profile/travel-stats/components/MapBoxMap";
import { mapTripRecapToPageModel } from "@/views/Trip/utils/mapTripRecap";

interface TripRecapViewProps {
  userId: string;
  tripId: string;
}

type RecapApiResponse = any; // TODO: 나중에 실제 응답 타입으로 교체

export default function TripRecapView({ userId, tripId }: TripRecapViewProps) {
  const [recapData, setRecapData] = useState<RecapApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDayId, setActiveDayId] = useState<string>("day-1");

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

  const activeDay: RecapDay | undefined = useMemo(() => {
    return (
      pageModel?.days?.find((d) => d.dayIndex === activeDayIndex) ??
      pageModel?.days?.[0]
    );
  }, [pageModel?.days, activeDayIndex]);

  const breadcrumbItems: Crumb[] = useMemo(() => {
    const title = pageModel?.hero.title ?? "Trip";
    return [
      { label: "Recap Blogs", href: "/profile/recap-blogs" },
      { label: "Map", href: "/profile/recap-blogs?view=map" },
      { label: `(${title})` },
    ];
  }, [pageModel?.hero.title]);

  const dayTabs: DayTab[] = useMemo(() => {
    const days = pageModel?.days ?? [];
    return days.map((d) => ({
      id: `day-${d.dayIndex}`,
      label: `Day ${d.dayIndex}`,
    }));
  }, [pageModel?.days]);

  const day1Ref = useRef<HTMLDivElement | null>(null);

  const handleDayChange = (id: string) => {
    setActiveDayId(id);
    if (id === "day-1") {
      day1Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
  return (
    <div className="min-h-screen bg-white">
      <RecapBlogTopBar
        title="Recap Blog"
        breadcrumbItems={breadcrumbItems}
        dayTabs={dayTabs}
        activeDayId={activeDayId}
        onDayChange={handleDayChange}
        onGoBack={() => history.back()}
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
              </div>
            </div>
          </section>

          <section className="min-w-0 flex-1">
            <div className="h-[650px] w-full overflow-hidden rounded-2xl border border-black/10">
              <MapboxMap />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
