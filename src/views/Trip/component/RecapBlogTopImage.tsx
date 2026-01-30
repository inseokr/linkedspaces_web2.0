"use client";
import { getBlogImageResolved } from "@/views/Trip/edit/utils/blogImageCache";
import Image from "next/image";

/** 1) 작성자 배지 */
export function AuthorBadge({
  name,
  postedLabel,
  avatarUrl,
}: {
  name: string;
  postedLabel: string; // e.g. "Posted 5 days ago"
  avatarUrl?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/25 bg-white/10">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={name} fill className="object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs font-semibold text-white/80">
            {name.slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>

      <div className="leading-tight">
        <div className="text-sm font-semibold text-white">{name}</div>
        <div className="text-xs text-white/80">{postedLabel}</div>
      </div>
    </div>
  );
}

/** 2) 날짜 + 위치 메타 */
export function TripMeta({
  dateText,
  locationText,
}: {
  dateText: string; // e.g. "Dec 15–20, 2024"
  locationText: string; // e.g. "San Francisco"
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-white/90">
      <div className="inline-flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-white/80" />
        <span className="text-sm font-medium">{dateText}</span>
      </div>

      <div className="inline-flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-white/80" />
        <span className="text-sm font-medium">{locationText}</span>
      </div>
    </div>
  );
}

/** 3) 배경 이미지 + 제목 + 메타 + 작성자 (Hero 섹션) */
export default function RecapBlogHero({
  coverImageUrl,
  title,
  dateText,
  locationText,
  authorName,
  postedLabel,
  avatarUrl,
}: {
  coverImageUrl: string;
  title: string;
  dateText: string;
  locationText: string;
  authorName: string;
  postedLabel: string;
  avatarUrl?: string;
}) {
  const { src, unoptimized } = getBlogImageResolved(coverImageUrl);
  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-black/10">
      {/* 배경 이미지 */}
      <div className="relative w-full aspect-[16/5] sm:aspect-[16/6] md:aspect-[16/5]">
        {src ? (
          <Image
            src={src}
            alt={title}
            fill
            unoptimized={unoptimized}
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        ) : (
          <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/5 text-sm text-black/50">
            No image
          </div>
        )}

        {/* 오버레이: 가독성 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/10" />
      </div>

      {/* 내용 오버레이 */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 sm:p-7">
        {/* 좌상단 작성자 */}
        <div className="pointer-events-auto">
          <AuthorBadge
            name={authorName}
            postedLabel={postedLabel}
            avatarUrl={avatarUrl}
          />
        </div>

        {/* 중앙 타이틀 + 메타 */}
        <div className="pb-4 text-center sm:pb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <TripMeta dateText={dateText} locationText={locationText} />
        </div>
      </div>
    </section>
  );
}
