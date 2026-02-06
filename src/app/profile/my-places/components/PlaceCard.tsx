"use client";

import type { LatestActivityPlace } from "../mockData";
import { ThumbsUp } from "lucide-react";

interface PlaceCardProps {
  place: LatestActivityPlace;
}

/** Gradient placeholder when imageUrl is missing or fails */
function ImagePlaceholder() {
  return (
    <div
      className="h-full w-full bg-cover bg-center"
      style={{
        background:
          "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
      }}
    />
  );
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const { name, date, category, imageUrl, caption, saved } = place;

  return (
    <article
      className="flex shrink-0 w-[320px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-[var(--color-main)] focus-within:ring-offset-2"
      aria-label={`Place: ${name}`}
    >
      <div className="relative h-52 w-full overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const placeholder = e.currentTarget.nextElementSibling;
              if (placeholder instanceof HTMLElement) placeholder.style.display = "block";
            }}
          />
        ) : null}
        <div
          className={imageUrl ? "absolute inset-0 hidden" : "absolute inset-0"}
          aria-hidden
        >
          <ImagePlaceholder />
        </div>
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs text-gray-700 shadow-sm">
          {saved && (
            <ThumbsUp
              className="h-3.5 w-3.5 text-green-600"
              aria-hidden
            />
          )}
          <span className="font-medium">{date}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <h3 className="min-w-0 flex-1 truncate text-lg font-semibold text-gray-900">
            {name}
          </h3>
          <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
            {category}
          </span>
        </div>
        <p className="mt-2 line-clamp-3 text-sm text-gray-600 leading-snug" title={caption}>
          {caption}
        </p>
      </div>
    </article>
  );
}
