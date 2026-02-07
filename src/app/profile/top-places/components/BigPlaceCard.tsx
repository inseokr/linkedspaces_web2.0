"use client";

import * as React from "react";
import {
  Bookmark,
  Heart,
  Star,
  Camera,
  MapPin,
  Clock,
  MessageCircle,
} from "lucide-react";
import type { TopPlaceCardModel } from "../types";

export interface BigPlaceCardProps {
  place: TopPlaceCardModel;
  /** When set, the card is clickable and opens the place full-screen modal */
  onPlaceClick?: (place: TopPlaceCardModel) => void;
  /** Display likes count (can differ when user toggles heart). Defaults to place.likesCount */
  displayLikes?: number;
  isBookmarked?: boolean;
  isLiked?: boolean;
  onBookmarkToggle?: () => void;
  onLikeToggle?: () => void;
}

export default function BigPlaceCard({
  place,
  onPlaceClick,
  displayLikes = place.likesCount,
  isBookmarked = false,
  isLiked = false,
  onBookmarkToggle,
  onLikeToggle,
}: BigPlaceCardProps) {
  const [imgError, setImgError] = React.useState(false);
  const showPlaceholder = !place.imageUrl || imgError;

  const handleClick = () => onPlaceClick?.(place);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onPlaceClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onPlaceClick(place);
    }
  };

  return (
    <article
      role={onPlaceClick ? "button" : undefined}
      tabIndex={onPlaceClick ? 0 : undefined}
      onClick={onPlaceClick ? handleClick : undefined}
      onKeyDown={onPlaceClick ? handleKeyDown : undefined}
      className={`flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-shadow ${onPlaceClick ? "cursor-pointer hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2" : ""}`}
      aria-label={`Featured: ${place.title}, ${place.city}, ${place.country}${onPlaceClick ? ". Click to open full screen" : ""}`}
    >
      {/* Photo - full width, 4/3 aspect, image fills with object-cover */}
      <div className="relative w-full shrink-0 overflow-hidden bg-gray-100">
        <div className="aspect-[4/3] w-full">
          {!showPlaceholder ? (
            <img
              src={place.imageUrl}
              alt=""
              className="h-full w-full object-cover object-center"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                background:
                  "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
              }}
              aria-hidden
            />
          )}
        </div>
        {/* Overlay: bookmark and heart (top right) — same as full place card */}
        <div className="absolute right-2 top-2 flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookmarkToggle?.();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
            aria-label={
              isBookmarked ? "Remove bookmark" : "Bookmark this place"
            }
            aria-pressed={isBookmarked}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-current text-[var(--color-main)]" : ""}`}
            />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLikeToggle?.();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
            aria-label={isLiked ? "Unlike" : "Like this place"}
            aria-pressed={isLiked}
          >
            <Heart
              className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Content - match full place card layout: name, location + rank, caption, stats */}
      <div className="flex shrink-0 flex-col p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-gray-900">
              {place.title}
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin
                className="h-3.5 w-3.5 shrink-0 text-gray-400"
                aria-hidden
              />
              <span className="truncate">
                {place.city}, {place.country}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-800">
            <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
            <span className="text-xs font-semibold">#{place.rank}</span>
          </div>
        </div>

        {place.caption?.trim() ? (
          <div className="mt-2">
            <p
              className="line-clamp-3 text-sm text-gray-600"
              title={place.caption.trim()}
            >
              {place.caption.trim()}
            </p>
            {place.captionFromOtherPhoto ? (
              <p className="mt-1 text-xs text-gray-500">From another photo</p>
            ) : null}
          </div>
        ) : null}

        {/* Metadata row: photos, visits, comments (left) | likes (right) */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-gray-100 pt-2 text-xs text-gray-700">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <Camera className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              {place.photosCount} {place.photosCount === 1 ? "photo" : "photos"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              {place.visitsCount} {place.visitsCount === 1 ? "visit" : "visits"}
            </span>
            {typeof place.commentsCount === "number" ? (
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {place.commentsCount}{" "}
                {place.commentsCount === 1 ? "comment" : "comments"}
              </span>
            ) : null}
          </div>
          <span
            className="flex items-center gap-1 font-medium"
            aria-label={`${displayLikes} likes`}
          >
            <Heart
              className={`h-3.5 w-3.5 shrink-0 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}`}
            />
            <span>{displayLikes}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
