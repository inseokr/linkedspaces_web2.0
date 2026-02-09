"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import type { NetworkBestMoment } from "@/lib/explore/exploreTypes";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";

export interface BestMomentsGridProps {
  moments: NetworkBestMoment[];
  onMomentClick?: (moment: NetworkBestMoment) => void;
  isLoading?: boolean;
}

export default function BestMomentsGrid({
  moments,
  onMomentClick,
  isLoading,
}: BestMomentsGridProps) {
  if (isLoading) {
    return (
      <section className="w-full" aria-label="Best moments">
        <h2 className="mb-3 text-xl font-semibold text-[var(--card-text)]">
          Best Moments
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-xl bg-[var(--color-neutral)]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (moments.length === 0) return null;

  return (
    <section className="w-full" aria-label="Best moments">
      <h2 className="mb-3 text-xl font-semibold text-[var(--card-text)]">
        Best Moments
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {moments.map((moment) => {
          const { src, unoptimized } = normalizeImageSrc(moment.imageUrl);
          const avatarSrc = moment.friendAvatarUrl
            ? normalizeImageSrc(moment.friendAvatarUrl).src
            : undefined;
          return (
            <button
              key={moment.id}
              type="button"
              onClick={() => onMomentClick?.(moment)}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 text-left"
            >
              <div className="relative aspect-square w-full bg-[var(--color-neutral)]">
                <Image
                  src={src}
                  alt=""
                  fill
                  unoptimized={unoptimized}
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 280px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-2">
                  <div className="flex items-center gap-2">
                    {avatarSrc && (
                      <div className="relative h-6 w-6 overflow-hidden rounded-full border border-white/50">
                        <Image
                          src={avatarSrc}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="24px"
                        />
                      </div>
                    )}
                    <span className="text-xs font-medium text-white drop-shadow">
                      {moment.friendName}
                    </span>
                  </div>
                  {typeof moment.likes === "number" && (
                    <span className="flex items-center gap-0.5 text-xs text-white drop-shadow">
                      <Heart className="h-3.5 w-3.5 fill-current" />
                      {moment.likes}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-2">
                <p className="truncate text-sm font-medium text-[var(--card-text)]">
                  {moment.placeName}
                </p>
                <p className="text-xs text-[var(--card-text-muted)]">
                  {moment.timeAgo}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
