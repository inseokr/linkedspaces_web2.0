"use client";

//카드 하나

import Link from "next/link";
import Image from "next/image";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";
import { Eye, MapPin } from "lucide-react";

export type AllBlogCardItem = {
  id: string;
  href: string;
  coverImageUrl: string;
  title: string;
  locationLabel: string; // ex) "Swiss Alps"
  dateLabel: string; // ex) "Aug 3 ~ Aug 5, 2025"
  isPublic?: boolean; // 필요하면 상태 표시용
};

type Props = {
  item: AllBlogCardItem;
  className?: string;

  /** 눈 아이콘 클릭 시 */
  onVisibilityClick?: (item: AllBlogCardItem) => void;

  /** 눈 아이콘을 보여줄지 */
  showVisibilityButton?: boolean;

  onSelect?: (item: AllBlogCardItem) => void; // 선택여부
};

export default function AllBlogCard({
  item,
  className = "",
  onVisibilityClick,
  showVisibilityButton = true,
}: Props) {
  const { src, unoptimized } = normalizeImageSrc(item.coverImageUrl);
  const yearMatch = item.dateLabel?.match(/\b(19|20)\d{2}\b/);
  const yearText = yearMatch?.[0] ?? "";
  const dateWithoutYear = yearText
    ? item.dateLabel.replace(/,?\s*\b(19|20)\d{2}\b\s*$/, "").trim()
    : item.dateLabel;

  return (
    <article className={["w-full", className].join(" ")}>
      <Link href={item.href} className="block">
        <div
          className={[
            "group relative w-full overflow-hidden rounded-2xl",
            "border border-black/10 bg-white shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-400/40",
          ].join(" ")}
        >
          {/* 이미지 영역 */}
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={src}
              alt={item.title}
              fill
              unoptimized={unoptimized}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={false}
              onError={(e) => {
                console.log("[CardRender] image error:", item.coverImageUrl, e);
              }}
            />

            {/* 하단 가독성용 그라데이션 */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

            {/* 우상단 눈 아이콘 */}
            {showVisibilityButton && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault(); // Link 이동 막고
                  e.stopPropagation();
                  onVisibilityClick?.(item);
                }}
                className={[
                  "absolute right-3 top-3 z-10",
                  "inline-flex h-8 w-8 items-center justify-center rounded-full",
                  "bg-black/55 text-white backdrop-blur",
                  "transition hover:bg-black/65 active:scale-[0.98]",
                  "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
                ].join(" ")}
                aria-label="Toggle visibility"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}

            {/* 좌하단 위치 pill */}
            <div className="absolute bottom-3 left-3 z-10">
              <div
                className={[
                  "inline-flex items-center gap-1.5 rounded-full",
                  "bg-black/55 px-2.5 py-1 text-[12px] text-white backdrop-blur",
                ].join(" ")}
              >
                <MapPin className="h-3.5 w-3.5 opacity-90" />
                <span className="leading-none">{item.locationLabel}</span>
              </div>
            </div>

            {/* 좌상단 날짜(시간) pill: trip cover image overlay (no truncation) */}
            {!!item.dateLabel && (
              <div
                className={[
                  "absolute left-3 top-3 z-10",
                  // Allocate width relative to the image container (parent is `relative`).
                  // This prevents the shrink-to-fit behavior that made it look too small.
                  "w-[80%]",
                ].join(" ")}
              >
                <div
                  className={[
                    // Single-line (should fit within the 80% container).
                    "inline-flex w-fit items-center gap-1.5 rounded-full",
                    "bg-black/55 px-2 py-0.5 text-[12px] text-white backdrop-blur",
                    "whitespace-nowrap",
                    "pointer-events-none",
                  ].join(" ")}
                  title={item.dateLabel}
                >
                  {!!yearText && (
                    <span className="shrink-0 rounded-full bg-white/15 px-1.5 py-0.5 font-extrabold leading-none">
                      {yearText}
                    </span>
                  )}
                  <span className="min-w-0">{dateWithoutYear}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 제목 — under card; min-w-0 so text doesn't overflow into adjacent cards */}
        <h3 className="mt-2 min-w-0 max-w-full break-words line-clamp-2 text-[13px] font-medium text-black/90">
          {item.title}
        </h3>
      </Link>
    </article>
  );
}
