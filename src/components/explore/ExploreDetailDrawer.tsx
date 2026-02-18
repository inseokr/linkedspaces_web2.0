"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type {
  ExploreMapPlace,
  NetworkTrendingPlace,
  NetworkBestMoment,
} from "@/lib/explore/exploreTypes";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";
import Button from "@/components/ui/Button";

export type ExploreDetailItem =
  | { type: "place"; place: ExploreMapPlace }
  | { type: "trending"; place: NetworkTrendingPlace }
  | { type: "moment"; moment: NetworkBestMoment };

export interface ExploreDetailDrawerProps {
  item: ExploreDetailItem | null;
  onClose: () => void;
  onViewOnMap?: () => void;
}

function PlaceContent({
  place,
  onViewOnMap,
}: {
  place: ExploreMapPlace;
  onViewOnMap?: () => void;
}) {
  return (
    <>
      <div className="relative aspect-video w-full bg-[var(--color-neutral)]">
        {place.imageUrl && (
          <Image
            src={normalizeImageSrc(place.imageUrl).src}
            alt=""
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 480px) 100vw, 400px"
          />
        )}
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold text-[var(--card-text)]">
          {place.name}
        </h2>
        {(place.likes != null ||
          place.saves != null ||
          place.visits != null) && (
          <p className="mt-1 text-sm text-[var(--card-text-muted)]">
            {[
              place.likes != null && `${place.likes} likes`,
              place.saves != null && `${place.saves} saves`,
              place.visits != null && `${place.visits} visits`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        {onViewOnMap && (
          <Button
            type="button"
            variant="main"
            className="mt-4 w-full sm:w-auto"
            onClick={onViewOnMap}
          >
            View on map
          </Button>
        )}
      </div>
    </>
  );
}

function TrendingContent({
  place,
  onViewOnMap,
}: {
  place: NetworkTrendingPlace;
  onViewOnMap?: () => void;
}) {
  const { src, unoptimized } = normalizeImageSrc(place.coverImageUrl);
  return (
    <>
      <div className="relative aspect-video w-full bg-[var(--color-neutral)]">
        <Image
          src={src}
          alt=""
          fill
          unoptimized={unoptimized}
          className="object-cover"
          sizes="(max-width: 480px) 100vw, 400px"
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold text-[var(--card-text)]">
          {place.placeName}
        </h2>
        <p className="text-sm text-[var(--card-text-muted)]">
          {place.cityOrCountry}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {place.badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full bg-[var(--color-main)]/15 px-2 py-0.5 text-xs font-medium text-[var(--color-main)]"
            >
              {badge}
            </span>
          ))}
        </div>
        <p className="mt-2 text-sm text-[var(--card-text-muted)]">
          {place.likes} likes · {place.saves} saves · {place.visits} visits
        </p>
        {onViewOnMap && (
          <Button
            type="button"
            variant="main"
            className="mt-4 w-full sm:w-auto"
            onClick={onViewOnMap}
          >
            View on map
          </Button>
        )}
      </div>
    </>
  );
}

function MomentContent({
  moment,
  onViewOnMap,
}: {
  moment: NetworkBestMoment;
  onViewOnMap?: () => void;
}) {
  const { src, unoptimized } = normalizeImageSrc(moment.imageUrl);
  const avatarSrc = moment.friendAvatarUrl
    ? normalizeImageSrc(moment.friendAvatarUrl).src
    : null;
  return (
    <>
      <div className="relative aspect-video w-full bg-[var(--color-neutral)]">
        <Image
          src={src}
          alt=""
          fill
          unoptimized={unoptimized}
          className="object-cover"
          sizes="(max-width: 480px) 100vw, 400px"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          {avatarSrc && (
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-[var(--card-border)]">
              <Image
                src={avatarSrc}
                alt=""
                fill
                unoptimized
                className="object-cover"
                sizes="32px"
              />
            </div>
          )}
          <div>
            <p className="font-medium text-[var(--card-text)]">
              {moment.friendName}
            </p>
            <p className="text-xs text-[var(--card-text-muted)]">
              {moment.timeAgo}
            </p>
          </div>
        </div>
        <h2 className="mt-2 text-lg font-semibold text-[var(--card-text)]">
          {moment.placeName}
        </h2>
        {onViewOnMap && moment.lat != null && moment.lng != null && (
          <Button
            type="button"
            variant="main"
            className="mt-4 w-full sm:w-auto"
            onClick={onViewOnMap}
          >
            View on map
          </Button>
        )}
      </div>
    </>
  );
}

export default function ExploreDetailDrawer({
  item,
  onClose,
  onViewOnMap,
}: ExploreDetailDrawerProps) {
  useEffect(() => {
    if (!item) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Place detail"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        className="relative max-h-[85vh] w-full max-w-lg overflow-hidden rounded-t-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-[var(--card-text)] hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="max-h-[85vh] overflow-y-auto">
          {item.type === "place" && (
            <PlaceContent place={item.place} onViewOnMap={onViewOnMap} />
          )}
          {item.type === "trending" && (
            <TrendingContent place={item.place} onViewOnMap={onViewOnMap} />
          )}
          {item.type === "moment" && (
            <MomentContent moment={item.moment} onViewOnMap={onViewOnMap} />
          )}
        </div>
      </div>
    </div>
  );
}
