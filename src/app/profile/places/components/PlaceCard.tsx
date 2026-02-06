"use client";

import type { PlaceWithSavedAt } from "../mockData";

interface PlaceCardProps {
  place: PlaceWithSavedAt;
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

export default function PlaceCard({ place }: PlaceCardProps) {
  const { title, imageUrl } = place;

  return (
    <article
      className="group relative aspect-square w-full overflow-hidden rounded-xl bg-gray-200 shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-[var(--color-main)] focus-within:ring-offset-2"
      aria-label={`Place: ${title}`}
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
      {/* Bottom-left overlay with gradient */}
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
