"use client";

import * as React from "react";
import { MapPin, Camera, Clock, Heart, Star } from "lucide-react";
import type { TopPlaceCardModel } from "../types";

export interface BigPlaceCardProps {
  place: TopPlaceCardModel;
  /** When set, the card is clickable and opens the place full-screen modal */
  onPlaceClick?: (place: TopPlaceCardModel) => void;
}

export default function BigPlaceCard({
  place,
  onPlaceClick,
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
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-shadow ${onPlaceClick ? "cursor-pointer hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2" : ""}`}
      aria-label={`Featured: ${place.title}, ${place.city}, ${place.country}${onPlaceClick ? ". Click to open full screen" : ""}`}
    >
      {/* Photo - same 4/3 scale as small cards but larger; fills available bottom space */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden bg-gray-100">
        <div className="aspect-[4/3] h-full w-auto min-h-[200px] max-w-full md:min-h-[240px]">
          {!showPlaceholder ? (
            <img
              src={place.imageUrl}
              alt=""
              className="h-full w-full object-cover"
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
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 shadow-sm backdrop-blur-sm">
          <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-500" />
          <span className="text-sm font-bold text-gray-800">#{place.rank}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex shrink-0 flex-col p-3">
        <h2 className="truncate text-lg font-semibold text-gray-900">
          {place.title}
        </h2>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-gray-600">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
          {place.city}, {place.country}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <span
            className="flex items-center gap-1"
            aria-label={`${place.photosCount} photos`}
          >
            <Camera className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            {place.photosCount} {place.photosCount === 1 ? "photo" : "photos"}
          </span>
          <span
            className="flex items-center gap-1"
            aria-label={`${place.visitsCount} visits`}
          >
            <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            {place.visitsCount} {place.visitsCount === 1 ? "visit" : "visits"}
          </span>
          <span
            className="flex items-center gap-1"
            aria-label={`${place.likesCount} likes`}
          >
            <Heart className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            {place.likesCount} likes
          </span>
        </div>
      </div>
    </article>
  );
}
