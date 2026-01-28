"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  MapPin,
  ThumbsUp,
  Bookmark,
  Link2,
  Heart,
  MessageSquare,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

//이미 있다고 가정 (이전 메시지에서 만든 Hero)
import RecapBlogHero from "@/views/Trip/component/RecapBlog";

/** ----------------------------
 *  데이터 타입 (Hero + Day/Entries)
 *  ---------------------------- */
type RecapBlogPageData = {
  hero: {
    coverImageUrl: string;
    title: string;
    dateText: string;
    locationText: string;
    authorName: string;
    postedLabel: string;
    avatarUrl: string;
  };
  days: Array<{
    dayIndex: number; // 1,2,3...
    title: string; // "Arrival in Zermatt"
    entries: Array<{
      id: string;
      placeName: string; // "Zermatt Station"
      timeRangeText: string; // "9:30 - 9:40 AM"
      categoryLabel?: string; // "Cafe"
      liked?: boolean;
      likeCount: number;
      commentCount: number;
      caption: string;
      photos: string[]; // 이미지 슬라이더
    }>;
  }>;
};

/** ----------------------------
 *  예시 데이터 (요청한 Hero props “연장” 형태)
 *  ---------------------------- */
const demoData: RecapBlogPageData = {
  hero: {
    coverImageUrl: "/images/hero/us.jpg",
    title: "US Adventure",
    dateText: "Dec 15–20, 2024",
    locationText: "San Francisco",
    authorName: "Username",
    postedLabel: "Posted 5 days ago",
    avatarUrl: "/images/avatar.png",
  },
  days: [
    {
      dayIndex: 1,
      title: "Arrival in Zermatt",
      entries: [
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
      ],
    },
  ],
};

/** ----------------------------
 *  유틸: line-clamp 적용 여부 판단용(간단 버전)
 *  - 여기서는 'See More' 항상 노출해도 UX 괜찮으면 이 부분 제거 가능
 *  ---------------------------- */
const clampClass = "line-clamp-2";

/** ----------------------------
 *  컴포넌트: Day 섹션 (Horizontal scroll)
 *  ---------------------------- */
type Props = {
  dayIndex: number;
  title: string;
  entries: RecapBlogPageData["days"][number]["entries"];
};

export function RecapBlogDaySection({ dayIndex, title, entries }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="space-y-4">
      <h2 className="text-[44px] font-extrabold tracking-[-0.8px] text-black">
        Day {dayIndex}: {title}
      </h2>

      {/* ✅ viewport(스크롤 영역) */}
      <div className="relative">
        <div
          className={[
            "flex overflow-x-auto",
            "snap-x snap-mandatory",
            "scroll-smooth", // 트랙패드/휠 느낌 개선
            "pb-4",
            "[&>*]:snap-start",
            // gap 대신 padding으로 '페이지'처럼 넘기기
            "gap-0",
            "scrollbar-thin scrollbar-thumb-black/10 scrollbar-track-transparent",
          ].join(" ")}
        >
          {entries.map((e) => (
            // ✅ 한 페이지(=뷰포트) 폭을 강제: w-full + shrink-0
            <div key={e.id} className="w-full shrink-0 px-1">
              <RecapEntryCard
                entry={e}
                expanded={expandedIds.has(e.id)}
                onToggleExpanded={() => toggleExpanded(e.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** ----------------------------
 *  컴포넌트: 카드 (이미지 슬라이더 + See More)
 *  ---------------------------- */
function RecapEntryCard({
  entry,
  expanded,
  onToggleExpanded,
}: {
  entry: RecapBlogPageData["days"][number]["entries"][number];
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const total = entry.photos.length;

  const prev = () => setPhotoIdx((i) => (i - 1 + total) % total);
  const next = () => setPhotoIdx((i) => (i + 1) % total);

  return (
    <article
      className={[
        "w-full", // ✅ 화면폭에 맞춤
        "max-w-[920px]", // ✅ 디자인 최대 폭만 제한(원하는 값으로)
        "mx-auto", // ✅ 가운데 정렬
        "overflow-hidden rounded-[28px] border border-black/15 bg-white shadow-sm",
      ].join(" ")}
    >
      {/* 상단: 장소/시간/태그 */}
      <div className="px-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <MapPin className="h-7 w-7 text-[#B84A2F]" />
              <div className="min-w-0">
                <div className="truncate text-[30px] font-extrabold text-black underline underline-offset-4">
                  {entry.placeName}
                </div>
                <div className="mt-1 text-[16px] font-medium text-black/70">
                  {entry.timeRangeText}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {entry.categoryLabel && (
              <span className="rounded-full bg-black/5 px-3 py-1 text-[14px] font-semibold text-black/60">
                {entry.categoryLabel}
              </span>
            )}
            <button
              type="button"
              className={[
                "inline-flex h-11 w-11 items-center justify-center rounded-full",
                entry.liked
                  ? "bg-emerald-200 text-emerald-900"
                  : "bg-black/5 text-black/60",
              ].join(" ")}
              aria-label="Like"
            >
              <ThumbsUp className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* 이미지 슬라이더 */}
      <div className="relative mt-4">
        <div className="relative mx-6 aspect-[16/9] overflow-hidden rounded-2xl bg-black/5">
          <Image
            src={entry.photos[photoIdx]}
            alt={`${entry.placeName} photo ${photoIdx + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 90vw, 680px"
          />

          {/* 1/2 배지 */}
          <div className="absolute left-4 top-4 rounded-full bg-white/40 px-3 py-1 text-[14px] font-bold text-white backdrop-blur">
            {photoIdx + 1}/{total}
          </div>

          {/* 좌/우 버튼 */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 shadow-sm backdrop-blur hover:bg-white"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6 text-black/70" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 shadow-sm backdrop-blur hover:bg-white"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6 text-black/70" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 캡션 + See More */}
      <div className="px-6 pb-4 pt-5">
        <div className="flex items-end justify-between gap-6">
          <p
            className={[
              "text-[22px] leading-[1.35] text-black/85",
              expanded ? "" : clampClass,
            ].join(" ")}
          >
            {entry.caption}
          </p>

          <button
            type="button"
            onClick={onToggleExpanded}
            className="shrink-0 text-[22px] font-extrabold text-black hover:opacity-80"
          >
            {expanded ? "See Less" : "See More"}
          </button>
        </div>
      </div>

      {/* 하단 액션 바 */}
      <div className="flex items-center justify-between border-t border-black/10 px-6 py-4">
        <div className="flex items-center gap-5 text-black/70">
          <button
            type="button"
            className="inline-flex items-center gap-2 hover:text-black"
          >
            <Bookmark className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 hover:text-black"
          >
            <Link2 className="h-6 w-6" />
          </button>
        </div>

        <div className="flex items-center gap-6 text-[20px] font-semibold text-black/80">
          <div className="inline-flex items-center gap-2">
            <span>{entry.likeCount}</span>
            <Heart className="h-6 w-6" />
          </div>
          <div className="inline-flex items-center gap-2">
            <span>{entry.commentCount}</span>
            <MessageSquare className="h-6 w-6" />
          </div>
          <button type="button" aria-label="More" className="hover:text-black">
            <MoreVertical className="h-6 w-6" />
          </button>
        </div>
      </div>
    </article>
  );
}

/** ----------------------------
 * 페이지 예시: Hero + Day UI 조합
 *  ---------------------------- */
export default function RecapBlogDetailExample() {
  const data = useMemo(() => demoData, []);

  return (
    <div className="space-y-10 p-6">
      {/* 요청한 “연장 데이터” 형태 그대로 */}
      <RecapBlogHero
        coverImageUrl={data.hero.coverImageUrl}
        title={data.hero.title}
        dateText={data.hero.dateText}
        locationText={data.hero.locationText}
        authorName={data.hero.authorName}
        postedLabel={data.hero.postedLabel}
        avatarUrl={data.hero.avatarUrl}
      />

      {/* Day 섹션들 */}
      <div className="space-y-12">
        {data.days.map((d) => (
          <RecapBlogDaySection
            key={d.dayIndex}
            dayIndex={d.dayIndex}
            title={d.title}
            entries={d.entries}
          />
        ))}
      </div>
    </div>
  );
}
