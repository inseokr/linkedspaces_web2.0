"use client";

import {
  Maximize2,
  Plus,
  Minus,
  Compass,
  MapPin,
} from "lucide-react";
import type { SavedPlace } from "../mockData";

interface MapPlaceholderProps {
  /** Filtered places used to show mock marker count and positions */
  places: SavedPlace[];
}

/** Mock cluster marker for the placeholder map */
function MockMarker({
  label,
  count,
  topPercent,
  leftPercent,
  icon: Icon = MapPin,
}: {
  label: string;
  count?: number;
  topPercent: number;
  leftPercent: number;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className="absolute flex items-center justify-center gap-1 rounded-full bg-orange-500 px-2 py-1 text-white shadow-lg"
      style={{
        top: `${topPercent}%`,
        left: `${leftPercent}%`,
        transform: "translate(-50%, -50%)",
      }}
      role="presentation"
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="max-w-[80px] truncate text-xs font-medium">
        {count !== undefined ? `${label} ${count}` : label}
      </span>
    </div>
  );
}

export default function MapPlaceholder({ places }: MapPlaceholderProps) {
  const count = places.length;

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
      role="img"
      aria-label="Map placeholder showing saved places"
    >
      {/* Map-like gradient background (North America style) */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "linear-gradient(180deg, #e8eef4 0%, #d4dce4 30%, #c5cfd9 70%, #b8c4ce 100%)",
        }}
      />
      {/* Subtle grid for map feel */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Mock clustered markers - positioned to look like US/cities */}
      <MockMarker label="Pho LAN" topPercent={52} leftPercent={28} />
      <MockMarker label="Noodle" count={2} topPercent={48} leftPercent={26} />
      <MockMarker label="Boba Bliss" topPercent={50} leftPercent={27} />
      <MockMarker label="Sushi" topPercent={51} leftPercent={29} />
      <MockMarker label="BJ's" topPercent={49} leftPercent={27} />
      <MockMarker label="Sunright" topPercent={47} leftPercent={26} />

      {/* Map controls - right side */}
      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          aria-label="Fullscreen map"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <div className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-inset"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-inset"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-inset"
            aria-label="Compass / rotate north"
          >
            <Compass className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded text-[var(--color-main)] transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-inset"
            aria-label="Locate me / center map"
          >
            <MapPin className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Optional: show filtered count */}
      <div className="absolute bottom-3 left-3 rounded-lg border border-gray-200 bg-white/95 px-3 py-1.5 text-sm text-gray-700 shadow-sm">
        {count} {count === 1 ? "place" : "places"} on map
      </div>
    </div>
  );
}
