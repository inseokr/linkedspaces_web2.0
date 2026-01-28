"use client";

import React, { useMemo, useRef, useState } from "react";

import RecapBlogTopBar from "@/views/Trip/section/RecapBlogTopBar"; // 경로는 네 폴더에 맞게
import type { DayTab } from "@/views/Trip/component/RecapDayTabs";
import type { Crumb } from "@/views/Trip/component/RecapBlogCrumbBread";

import RecapBlogHero from "@/views/Trip/component/RecapBlog";
import { RecapBlogDaySection } from "@/views/Trip/component/RecapBlogPlace";
import MapboxMap from "@/views/Profile/travel-stats/components/MapBoxMap";

export default function RecapBlogDetailPageExample() {
  // ✅ 요청한 “연장 데이터”
  const hero = {
    coverImageUrl: "/images/hero/us.jpg",
    title: "US Adventure",
    dateText: "Dec 15–20, 2024",
    locationText: "San Francisco",
    authorName: "Username",
    postedLabel: "Posted 5 days ago",
    avatarUrl: "/images/avatar.png",
  };

  // ✅ 예시 Day/Entry 데이터
  const day1Entries = [
    {
      id: "e-1",
      placeName: "Zermatt Station",
      timeRangeText: "9:30 - 9:40 AM",
      categoryLabel: "Cafe",
      liked: true,
      likeCount: 5,
      commentCount: 3,
      caption:
        "First glimpse of the Matterhorn! The iconic peak welcomed us as we stepped off the train. The air felt sharper, the town was quiet, and everything looked unreal—like a postcard. We grabbed a quick coffee and just stood there watching the clouds move across the ridge for a while.",
      photos: ["/images/demo/zermatt-1.jpg", "/images/demo/zermatt-2.jpg"],
    },
    {
      id: "e-2",
      placeName: "Gornergrat Railway",
      timeRangeText: "11:10 - 12:40 PM",
      categoryLabel: "Scenic",
      liked: false,
      likeCount: 12,
      commentCount: 2,
      caption:
        "Took the railway up and the views kept escalating every minute. Snow lines, tiny villages, and then—bam—full mountain theater. If you go, sit on the right side going up.",
      photos: [
        "/images/demo/gorner-1.jpg",
        "/images/demo/gorner-2.jpg",
        "/images/demo/gorner-3.jpg",
      ],
    },
  ];

  // ✅ breadcrumb (예시)
  const breadcrumbItems: Crumb[] = useMemo(
    () => [
      { label: "United States", href: "/profile/recap-blogs" },
      { label: "Map", href: "/profile/recap-blogs?view=map" },
      { label: `(${hero.title})` }, // 마지막은 링크 없이 텍스트
    ],
    [hero.title],
  );

  // ✅ day tabs (예시)
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

  // ✅ (선택) day 탭 클릭 시 해당 섹션으로 스크롤
  const day1Ref = useRef<HTMLDivElement | null>(null);

  const handleDayChange = (id: string) => {
    setActiveDayId(id);

    // 예시로 day-1만 스크롤 연결
    if (id === "day-1") {
      day1Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ✅ 맨 위 TopBar */}
      <RecapBlogTopBar
        title="Recap Blog"
        breadcrumbItems={breadcrumbItems}
        dayTabs={dayTabs}
        activeDayId={activeDayId}
        onDayChange={handleDayChange}
        onGoBack={() => history.back()} // 라우터 쓰고 싶으면 router.back()으로 교체
        className="sticky top-0 z-50"
      />

      {/* 본문 */}
      <div className="space-y-10 p-6">
        <RecapBlogHero {...hero} />

        {/* 5:5 레이아웃 */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left: Day cards */}
          <section className="min-w-0 flex-1" ref={day1Ref}>
            <div className="h-[750px]">
              <div className="h-full overflow-hidden">
                <RecapBlogDaySection
                  dayIndex={1}
                  title="Arrival in Zermatt"
                  entries={day1Entries as any}
                />
              </div>
            </div>
          </section>

          {/* Right: Map */}
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
