"use client";

/**
 * Zoom in / zoom out buttons for Mapbox maps. Place below the 2D/3D toggle.
 */

import { Plus, Minus } from "lucide-react";

export interface MapZoomControlsProps {
  /** Map instance; when undefined, buttons are disabled */
  map?: any;
  /** Optional class for the wrapper */
  className?: string;
}

const ZOOM_DURATION_MS = 200;

export default function MapZoomControls({
  map,
  className = "",
}: MapZoomControlsProps) {
  const disabled = !map;

  const zoomIn = () => {
    if (!map) return;
    map.zoomIn({ duration: ZOOM_DURATION_MS });
  };

  const zoomOut = () => {
    if (!map) return;
    map.zoomOut({ duration: ZOOM_DURATION_MS });
  };

  const buttonClass = `
    flex h-9 w-9 items-center justify-center rounded-lg border bg-white/95 shadow-sm
    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
    ${disabled ? "cursor-not-allowed border-gray-200 text-gray-400" : "cursor-pointer border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400"}
  `.trim();

  return (
    <div
      className={`flex flex-col gap-1 ${className}`.trim()}
      role="group"
      aria-label="Map zoom"
    >
      <button
        type="button"
        onClick={zoomIn}
        disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        aria-label="Zoom in"
        className={buttonClass}
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={zoomOut}
        disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        aria-label="Zoom out"
        className={buttonClass}
      >
        <Minus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
