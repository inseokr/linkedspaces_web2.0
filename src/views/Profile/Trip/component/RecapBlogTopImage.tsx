"use client";
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
          <Image src={avatarUrl} alt={name} fill className="object-cover" />
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
  tone = "onDark",
}: {
  dateText: string; // e.g. "Dec 15–20, 2024"
  locationText: string; // e.g. "San Francisco"
  tone?: Tone;
}) {
  const hasLocation = Boolean(locationText?.trim());
  const hasDate = Boolean(dateText?.trim());
  const isOnDark = tone === "onDark";

  return (
    <div
      className={[
        "mt-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center",
        isOnDark ? "text-white/90" : "text-black/70",
      ].join(" ")}
    >
      {hasDate && (
        <div className="inline-flex items-center gap-2">
          <span
            className={[
              "inline-block h-2 w-2 rounded-full",
              isOnDark ? "bg-white/80" : "bg-black/35",
            ].join(" ")}
          />
          <span
            className={[
              "text-sm font-medium",
              isOnDark ? "" : "text-black/70",
            ].join(" ")}
          >
            {dateText}
          </span>
        </div>
      )}

      {hasLocation && (
        <div className="inline-flex items-center gap-2">
          <span
            className={[
              "inline-block h-2 w-2 rounded-full",
              isOnDark ? "bg-white/80" : "bg-black/35",
            ].join(" ")}
          />
          <span
            className={[
              "text-sm font-medium",
              isOnDark ? "" : "text-black/70",
            ].join(" ")}
          >
            {locationText}
          </span>
        </div>
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
  tone = "onLight",
}: {
  title: string;
  dateText: string;
  locationText: string;
  authorName: string;
  postedLabel: string;
  avatarUrl?: string;
  tone?: Tone;
}) {
  const isOnDark = tone === "onDark";
  const hasDate = Boolean(dateText?.trim());

  return (
    <div className="w-full">
      <div className="pointer-events-auto flex items-start justify-between gap-3">
        <AuthorBadge
          name={authorName}
          postedLabel={postedLabel}
          avatarUrl={avatarUrl}
          tone={tone}
        />

        {/* Mobile: date sits next to profile */}
        {hasDate && (
          <div
            className={[
              "sm:hidden",
              "mt-1 shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-semibold",
              isOnDark
                ? "border-white/25 bg-white/10 text-white/90"
                : "border-black/10 bg-black/5 text-black/70",
            ].join(" ")}
          >
            {dateText}
          </div>
        )}
      </div>

      <div className="pt-4 text-center">
        <h1
          className={[
            "text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl",
            isOnDark ? "text-white" : "text-black",
          ].join(" ")}
        >
          {title}
        </h1>

        {/* Mobile: since date is shown next to profile, show meta without the date to avoid duplication */}
        <div className="sm:hidden">
          <TripMeta dateText="" locationText={locationText} tone={tone} />
        </div>
        <div className="hidden sm:block">
          <TripMeta
            dateText={dateText}
            locationText={locationText}
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

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/6] md:aspect-[16/5]">
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

      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/10" />
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
    <section className="relative w-full overflow-hidden rounded-3xl border border-black/10">
      <CoverImage
        coverImageUrl={coverImageUrl}
        title={title}
        showGradient={false}
      />
    </section>
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
  return (
    <>
      {/* Mobile: no cover photo */}
      <section className="w-full sm:hidden">
        <div className="rounded-3xl border border-black/10 bg-white p-5">
          <RecapBlogHeader
            title={title}
            dateText={dateText}
            locationText={locationText}
            authorName={authorName}
            postedLabel={postedLabel}
            avatarUrl={avatarUrl}
            tone="onLight"
          />
        </div>
      </section>

      {/* Desktop: cover photo + overlay */}
      <section className="relative hidden w-full overflow-hidden rounded-3xl border border-black/10 sm:block">
        <CoverImage coverImageUrl={coverImageUrl} title={title} showGradient />

        <div className="pointer-events-none absolute inset-0 flex flex-col p-5 sm:p-7">
          <div className="pointer-events-auto">
            <AuthorBadge
              name={authorName}
              postedLabel={postedLabel}
              avatarUrl={avatarUrl}
              tone="onDark"
            />
          </div>

          <div className="flex-1" />

          <div className="pb-4 text-center sm:pb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              {title}
            </h1>
            <TripMeta
              dateText={dateText}
              locationText={locationText}
              tone="onDark"
            />
          </div>
        </div>
      </section>
    </>
  );
}
