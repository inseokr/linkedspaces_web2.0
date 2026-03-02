"use client";
import React from "react";
import { getBlogImageResolved } from "@/views/Profile/Trip/edit/utils/blogImageCache";
import Image from "next/image";

type Tone = "onDark" | "onLight";

/** 1) 작성자 배지 */
export function AuthorBadge({
  name,
  postedLabel,
  avatarUrl,
  tone = "onDark",
}: {
  name: string;
  postedLabel: string; // e.g. "Posted 5 days ago"
  avatarUrl?: string;
  tone?: Tone;
}) {
  const isOnDark = tone === "onDark";
  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          "relative h-10 w-10 overflow-hidden rounded-full border",
          isOnDark
            ? "border-white/25 bg-white/10"
            : "border-black/10 bg-black/5",
        ].join(" ")}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                const fallback = document.createElement("div");
                fallback.className = `grid h-full w-full place-items-center text-xs font-semibold ${
                  isOnDark ? "text-white/80" : "text-black/70"
                }`;
                fallback.innerText = name.slice(0, 1).toUpperCase();
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div
            className={[
              "grid h-full w-full place-items-center text-xs font-semibold",
              isOnDark ? "text-white/80" : "text-black/70",
            ].join(" ")}
          >
            {name.slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>

      <div className="leading-tight">
        <div
          className={[
            "text-sm font-semibold",
            isOnDark ? "text-white" : "text-black",
          ].join(" ")}
        >
          {name}
        </div>
        <div
          className={[
            "text-xs",
            isOnDark ? "text-white/80" : "text-black/60",
          ].join(" ")}
        >
          {postedLabel}
        </div>
      </div>
    </div>
  );
}

/** 2) 날짜 + 위치 메타 */
export function TripMeta({
  dateText,
  locationText,
  placesCount,
  tone = "onDark",
}: {
  dateText: string; // e.g. "Dec 15–20, 2024"
  locationText: string; // e.g. "San Francisco"
  placesCount?: number;
  tone?: Tone;
}) {
  const hasLocation = Boolean(locationText?.trim());
  const hasDate = Boolean(dateText?.trim());
  const hasPlaces = typeof placesCount === "number" && placesCount > 0;
  const isOnDark = tone === "onDark";

  const divider = (
    <span className={isOnDark ? "text-white/60" : "text-black/30"}>•</span>
  );

  return (
    <div
      className={[
        "mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center",
        isOnDark ? "text-white" : "text-black/60",
      ].join(" ")}
    >
      {hasDate && (
        <span
          className={[
            "text-[15px] font-medium tracking-wide uppercase",
            isOnDark ? "text-white" : "text-black/70",
          ].join(" ")}
        >
          {dateText}
        </span>
      )}

      {hasDate && (hasPlaces || hasLocation) && divider}

      {hasPlaces && (
        <span
          className={[
            "text-[15px] font-medium tracking-wide uppercase",
            isOnDark ? "text-white" : "text-black/70",
          ].join(" ")}
        >
          {placesCount} Place{placesCount === 1 ? "" : "s"}
        </span>
      )}

      {hasPlaces && hasLocation && divider}

      {hasLocation && (
        <span
          className={[
            "text-[15px] font-medium tracking-wide uppercase",
            isOnDark ? "text-white" : "text-black/70",
          ].join(" ")}
        >
          {locationText}
        </span>
      )}
    </div>
  );
}

export function RecapBlogHeader({
  title,
  dateText,
  locationText,
  authorName,
  postedLabel,
  avatarUrl,
  placesCount,
  lastEditedAt,
  tone = "onLight",
}: {
  title: string;
  dateText: string;
  locationText: string;
  authorName: string;
  postedLabel: string;
  avatarUrl?: string;
  placesCount?: number;
  lastEditedAt?: string;
  tone?: Tone;
}) {
  const isOnDark = tone === "onDark";
  const hasDate = Boolean(dateText?.trim());

  return (
    <div className="w-full flex flex-col items-center">
      <div className="pointer-events-auto flex items-center justify-center mb-6">
        <AuthorBadge
          name={authorName}
          postedLabel={postedLabel}
          avatarUrl={avatarUrl}
          tone={tone}
        />
      </div>

      <div className="text-center w-full max-w-3xl mx-auto">
        <h1
          className={[
            "!text-3xl !leading-[1.1] font-extrabold tracking-tighter sm:!text-5xl md:!text-6xl lg:!text-7xl",
            isOnDark ? "text-white" : "text-black",
          ].join(" ")}
        >
          {title}
        </h1>

        <div className="mt-5 w-full flex justify-center">
          <TripMeta
            dateText={dateText}
            locationText={locationText}
            placesCount={placesCount}
            tone={tone}
          />
        </div>
      </div>
    </div>
  );
}

function CoverImage({
  coverImageUrl,
  title,
  showGradient = true,
}: {
  coverImageUrl: string;
  title: string;
  showGradient?: boolean;
}) {
  const { src, unoptimized } = getBlogImageResolved(coverImageUrl);
  console.log("[Hero props coverImageUrl]", coverImageUrl);
  console.log("[Hero final src]", src, "unoptimized:", unoptimized);

  // Parallax refs
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    const PARALLAX_STRENGTH = 0.6; // Higher value moves it out of view faster

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      // rect.top is negative once we've scrolled past the top of the element
      // By using a negative multiplier on scrolledPast, the image translates upwards
      const scrolledPast = -rect.top;
      // When scrolledPast > 0 (scrolling down), offset becomes negative, shifting image UP
      const offset = scrolledPast > 0 ? -(scrolledPast * PARALLAX_STRENGTH) : 0;
      img.style.transform = `translateY(${offset}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initialise
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // Outer container: fixed height, clips the overflowing image
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "16/7" }}
    >
      {/* Inner wrapper: taller than container so parallax has room to travel */}
      <div
        ref={imgRef}
        className="absolute inset-x-0 will-change-transform"
        style={{
          // Give it more room at the bottom so it can travel upwards without showing empty space
          top: "0%",
          bottom: "-60%",
        }}
      >
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
      </div>

      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
      )}
    </div>
  );
}

export function RecapBlogCoverImage({
  coverImageUrl,
  title,
}: {
  coverImageUrl: string;
  title: string;
}) {
  return (
    <section className="relative w-full overflow-hidden rounded-[32px] border border-black/5">
      <CoverImage
        coverImageUrl={coverImageUrl}
        title={title}
        showGradient={false}
      />
    </section>
  );
}

/** Standalone author row — place just above Day 1 */
export function AuthorRow({
  name,
  postedLabel,
  avatarUrl,
}: {
  name: string;
  postedLabel: string;
  avatarUrl?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="relative h-9 w-9 overflow-hidden rounded-full border border-black/10 bg-black/5 shrink-0">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs font-semibold text-black/70">
            {name.slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-black">{name}</div>
        <div className="text-xs text-black/50">{postedLabel}</div>
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
  placesCount,
  lastEditedAt,
}: {
  coverImageUrl: string;
  title: string;
  dateText: string;
  locationText: string;
  authorName: string;
  postedLabel: string;
  avatarUrl?: string;
  placesCount?: number;
  lastEditedAt?: string;
}) {
  return (
    <>
      {/* Mobile: Cover photo with text anchored to bottom */}
      <section
        className="relative w-full overflow-hidden rounded-[28px] border border-black/5 sm:hidden"
        style={{ aspectRatio: "4/5" }}
      >
        <CoverImage coverImageUrl={coverImageUrl} title={title} showGradient />

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end z-20">
          <div className="pb-5 px-6 text-center">
            <h1
              className="!text-[28px] !leading-[1.1] font-extrabold tracking-tighter text-white"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
            >
              {title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              {dateText?.trim() && (
                <span className="text-[13px] font-medium text-white/90 uppercase tracking-wide">
                  {dateText}
                </span>
              )}
              {dateText?.trim() && locationText?.trim() && (
                <span className="text-white/60">•</span>
              )}
              {locationText?.trim() && (
                <span className="text-[13px] font-medium text-white/90 uppercase tracking-wide">
                  {locationText}
                </span>
              )}
            </div>

            <button
              className="pointer-events-auto mt-5 flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors mx-auto"
              onClick={() => {
                const dayEl = document.querySelector('[data-day-id="day-1"]');
                if (dayEl) {
                  dayEl.scrollIntoView({ behavior: "smooth", block: "start" });
                } else {
                  window.scrollBy({ top: 300, behavior: "smooth" });
                }
              }}
            >
              <span className="text-[11px] font-bold uppercase tracking-widest">
                Read
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4 animate-bounce"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Desktop: Cover photo + overlay */}
      <section className="relative hidden w-full overflow-hidden rounded-[32px] shadow-sm sm:block">
        <CoverImage coverImageUrl={coverImageUrl} title={title} showGradient />

        <div className="pointer-events-none absolute inset-0 flex flex-col p-8 sm:px-12 sm:pt-16 sm:pb-8 z-20">
          <div className="flex-1" />

          <div className="pb-4 text-center w-full max-w-4xl mx-auto">
            <h1
              className="!text-5xl !leading-[1.1] font-extrabold tracking-tighter text-white md:!text-6xl lg:!text-7xl"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
            >
              {title}
            </h1>
            <div className="mt-4 flex flex-col items-center justify-center gap-6 w-full mb-8">
              <TripMeta
                dateText={dateText}
                locationText={locationText}
                placesCount={placesCount}
                tone="onDark"
              />
            </div>
          </div>

          <div className="pointer-events-auto mt-16 flex justify-center pb-2">
            <button
              onClick={() => {
                const dayEl = document.querySelector('[data-day-id="day-1"]');
                if (dayEl) {
                  dayEl.scrollIntoView({ behavior: "smooth", block: "start" });
                } else {
                  window.scrollBy({ top: 500, behavior: "smooth" });
                }
              }}
              className="group flex flex-col items-center gap-1 text-white hover:text-white/80 transition-colors"
            >
              <span className="text-[13px] font-bold uppercase tracking-widest">
                Read
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5 animate-bounce"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
