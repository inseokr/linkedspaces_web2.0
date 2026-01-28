"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

import RecapBlogTopBar from "@/views/Trip/section/RecapBlogTopBar";
import type { DayTab } from "@/views/Trip/component/RecapDayTabs";
import type { Crumb } from "@/views/Trip/component/RecapBlogCrumbBread";

import RecapBlogHero from "@/views/Trip/component/RecapBlog";
import { RecapBlogDaySection } from "@/views/Trip/component/RecapBlogPlace";
import MapboxMap from "@/views/Profile/travel-stats/components/MapBoxMap";

interface TripRecapViewProps {
  userId: string;
  tripId: string;
}

type RecapApiResponse = any; // TODO: 나중에 실제 응답 타입으로 교체

export default function TripRecapView({ userId, tripId }: TripRecapViewProps) {
  const [recapData, setRecapData] = useState<RecapApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!userId || !tripId) return;

      setLoading(true);
      setError(null);

      try {
        // ✅ 기존 TripRecap.js의 API 그대로
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

  // --- 여기부터 “데이터 매핑” ---
  // 우선은 fallback(예시 데이터) 유지하고,
  // recapData 구조 파악되면 아래 hero/dayEntries를 실제 값으로 채우면 됨.

  const hero = useMemo(() => {
    // TODO: recapData에서 실제로 꺼내 쓰기
    return {
      coverImageUrl: "/images/hero/us.jpg",
      title: recapData?.title ?? "US Adventure",
      dateText: recapData?.dateText ?? "Dec 15–20, 2024",
      locationText: recapData?.locationText ?? "San Francisco",
      authorName: recapData?.authorName ?? "Username",
      postedLabel: recapData?.postedLabel ?? "Posted 5 days ago",
      avatarUrl: "/images/avatar.png",
    };
  }, [recapData]);

  const day1Entries = useMemo(() => {
    // TODO: recapData.dayList / recapData.timeline 같은 실제 구조로 교체
    return [
      {
        id: "e-1",
        placeName: "Zermatt Station",
        timeRangeText: "9:30 - 9:40 AM",
        categoryLabel: "Cafe",
        liked: true,
        likeCount: 5,
        commentCount: 3,
        caption:
          "First glimpse of the Matterhorn! The iconic peak welcomed us as we stepped off the train...",
        photos: ["/images/demo/zermatt-1.jpg", "/images/demo/zermatt-2.jpg"],
      },
    ];
  }, [recapData]);

  const breadcrumbItems: Crumb[] = useMemo(
    () => [
      { label: "Recap Blogs", href: "/profile/recap-blogs" },
      { label: "Map", href: "/profile/recap-blogs?view=map" },
      { label: `(${hero.title})` },
    ],
    [hero.title],
  );

  const dayTabs: DayTab[] = useMemo(
    () => [
      { id: "day-1", label: "Day 1" },
      { id: "day-2", label: "Day 2" },
      { id: "day-3", label: "Day 3" },
      { id: "day-4", label: "Day 4" },
      { id: "day-5", label: "Day 5" },
    ],
    [],
  );

  const [activeDayId, setActiveDayId] = useState<string>("day-1");
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
        <RecapBlogHero {...hero} />

        <div className="flex flex-col gap-6 lg:flex-row">
          <section className="min-w-0 flex-1" ref={day1Ref}>
            <div className="h-[750px]">
              <div className="h-full overflow-hidden">
                <RecapBlogDaySection
                  dayIndex={1}
                  title="Day 1"
                  entries={day1Entries as any}
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
