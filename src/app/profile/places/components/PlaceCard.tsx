"use client";

import type { PlaceWithSavedAt } from "../mockData";

interface PlaceCardProps {
  place: PlaceWithSavedAt;
  /** Called when the card is clicked (e.g. open lightbox). */
  onPlaceClick?: (place: PlaceWithSavedAt) => void;
  /** Short date to show on the photo (e.g. "Jan 24"). */
  dateLabel?: string;
}

function ImagePlaceholder() {
  return (
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        background:
          "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
      }}
    />
  );
}

export default function PlaceCard({
  place,
  onPlaceClick,
  dateLabel,
}: PlaceCardProps) {
  const { title, imageUrl } = place;

  return (
    <article
      role={onPlaceClick ? "button" : undefined}
      tabIndex={onPlaceClick ? 0 : undefined}
      onClick={onPlaceClick ? () => onPlaceClick(place) : undefined}
      onKeyDown={
        onPlaceClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPlaceClick(place);
              }
            }
          : undefined
      }
      className={`group relative aspect-square w-full overflow-hidden rounded-xl bg-gray-200 shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-[var(--color-main)] focus-within:ring-offset-2 ${onPlaceClick ? "cursor-pointer" : ""}`}
      aria-label={
        onPlaceClick ? `Place: ${title}. Click to view` : `Place: ${title}`
      }
    >
      <div className="absolute inset-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const next = e.currentTarget.nextElementSibling;
              if (next instanceof HTMLElement) next.style.display = "block";
            }}
          />
        ) : null}
        <div
          className={imageUrl ? "hidden absolute inset-0" : "absolute inset-0"}
          aria-hidden
        >
          <ImagePlaceholder />
        </div>
      </div>
      {/* Top-right: abbreviated month + date on the photo */}
      {dateLabel ? (
        <div
          className="absolute right-3 top-3 rounded-md bg-black/50 px-2 py-1 text-sm font-medium text-white backdrop-blur-sm"
          aria-hidden
        >
          {dateLabel}
        </div>
      ) : null}
      {/* Bottom overlay with gradient */}
      <div
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent pt-16 pb-3 pl-3 pr-3"
        aria-hidden
      >
        <h3 className="text-base font-semibold leading-tight text-white drop-shadow-sm">
          {title}
        </h3>
      </div>
    </article>
  );
}
