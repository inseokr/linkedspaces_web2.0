"use client";

import * as React from "react";
import { Bookmark, Heart, Star, Camera, MapPin, Clock } from "lucide-react";
import type { TopPlaceCardModel } from "../types";

interface TopPlaceCardProps {
  place: TopPlaceCardModel;
  /** Display likes count (can differ from place.likesCount when user toggles heart) */
  displayLikes: number;
  isBookmarked: boolean;
  isLiked: boolean;
  onBookmarkToggle: () => void;
  onLikeToggle: () => void;
  /** Called when the card is clicked (e.g. to open detail modal). Overlay buttons do not trigger this. */
  onPlaceClick?: (place: TopPlaceCardModel) => void;
}

function ImagePlaceholder() {
  return (
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        background:
          "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
      }}
      aria-hidden
    />
  );
}

export default function TopPlaceCard({
  place,
  displayLikes,
  isBookmarked,
  isLiked,
  onLikeToggle,
  onPlaceClick,
}: TopPlaceCardProps) {
  const [imgError, setImgError] = React.useState(false);
  const showPlaceholder = !place.imageUrl || imgError;

  const handleCardClick = () => {
    onPlaceClick?.(place);
  };

  return (
    <article
      onClick={onPlaceClick ? handleCardClick : undefined}
      role={onPlaceClick ? "button" : undefined}
      tabIndex={onPlaceClick ? 0 : undefined}
      onKeyDown={
        onPlaceClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick();
              }
            }
          : undefined
      }
      className={`group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-[var(--color-main)] focus-within:ring-offset-2 ${onPlaceClick ? "cursor-pointer" : ""}`}
      aria-label={`Top place: ${place.title}, ${place.city}, ${place.country}`}
    >
      {/* Image: 4/3 aspect so cards are shorter and ~6 fit on screen */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {!showPlaceholder ? (
          <img
            src={place.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : null}
        {showPlaceholder && <ImagePlaceholder />}

        {/* Overlay: bookmark and heart (top right) */}
        <div className="absolute right-1.5 top-1.5 flex gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookmarkToggle();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
            aria-label={
              isBookmarked ? "Remove bookmark" : "Bookmark this place"
            }
            aria-pressed={isBookmarked}
          >
            <Bookmark
              className={`h-3.5 w-3.5 ${isBookmarked ? "fill-current text-[var(--color-main)]" : ""}`}
            />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLikeToggle();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
            aria-label={isLiked ? "Unlike" : "Like this place"}
            aria-pressed={isLiked}
          >
            <Heart
              className={`h-3.5 w-3.5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col p-3">
        <div className="min-h-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-gray-900">
                {place.title}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-600">
                <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                <span className="truncate">
                  {place.city}, {place.country}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-800">
              <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
              <span className="text-xs font-semibold">#{place.rank}</span>
            </div>
          </div>

          {place.caption?.trim() ? (
            <div className="mt-2">
              <p
                className="line-clamp-2 text-sm text-gray-600"
                title={place.caption.trim()}
              >
                {place.caption.trim()}
              </p>
              {place.captionFromOtherPhoto ? (
                <p className="mt-1 text-xs text-gray-500" aria-hidden>
                  From another photo
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Metadata row: fixed at bottom left (photos, visits) and bottom right (likes) */}
        <div className="mt-auto flex shrink-0 items-center justify-between gap-3 pt-2 text-xs text-gray-700">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Camera className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{place.photosCount} photos</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{place.visitsCount} visits</span>
            </span>
          </div>
          <span
            className="flex items-center gap-1 font-medium"
            aria-label={`${displayLikes} likes`}
          >
            <Heart
              className={`h-3.5 w-3.5 shrink-0 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}`}
              aria-hidden
            />
            <span>{displayLikes}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
