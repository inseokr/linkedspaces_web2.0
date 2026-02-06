"use client";

import { useState, useCallback } from "react";
import { Copy } from "lucide-react";
import type { SavedPlace } from "../mockData";

interface PlacesListProps {
  places: SavedPlace[];
}

const COPIED_DURATION_MS = 1500;

function ThumbnailPlaceholder() {
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

function PlaceRow({ place }: { place: SavedPlace }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(place.address).then(() => {
      setCopiedId(place.id);
      setTimeout(() => setCopiedId(null), COPIED_DURATION_MS);
    });
  }, [place.id, place.address]);

  const showCopied = copiedId === place.id;

  return (
    <div
      className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      role="article"
      aria-label={`Saved place: ${place.name}`}
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {place.thumbnailUrl ? (
          <img
            src={place.thumbnailUrl}
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
          className={place.thumbnailUrl ? "hidden h-full w-full" : "block h-full w-full"}
          aria-hidden
        >
          <ThumbnailPlaceholder />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {place.name}
          </h3>
          <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
            {place.category}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">{place.visitedDate}</p>
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">{place.snippet}</p>
        <button
          type="button"
          onClick={handleCopy}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--color-main)] px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          aria-label={showCopied ? "Address copied" : "Copy address"}
        >
          <Copy className="h-4 w-4 shrink-0" aria-hidden />
          {showCopied ? "Copied" : "Copy address"}
        </button>
      </div>
    </div>
  );
}

export default function PlacesList({ places }: PlacesListProps) {
  if (places.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
        No places match the current filter.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Saved places list">
      {places.map((place) => (
        <li key={place.id}>
          <PlaceRow place={place} />
        </li>
      ))}
    </ul>
  );
}
