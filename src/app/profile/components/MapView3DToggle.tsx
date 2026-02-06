"use client";

/**
 * Toggle between 2D and 3D map view. Accessible, keyboard-focusable, persists preference.
 * Parent controls map.easeTo and 3D layer visibility; this is UI only.
 */

import {
  setPersisted3D,
  PITCH_3D,
  BEARING_3D,
  update3DBuildingsVisibility,
} from "../mapbox-3d-config";

export function isWebGLSupported(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined")
    return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    return !!gl;
  } catch {
    return false;
  }
}

export interface MapView3DToggleProps {
  /** Current 3D state (from parent state) */
  is3D: boolean;
  /** Called when user toggles; parent should update state, persist, easeTo, and update layer visibility */
  onToggle: () => void;
  /** Map instance for optional immediate easeTo (if parent prefers, can do it in parent instead) */
  map?: any;
  /** When true, toggle is disabled and shows helper message (e.g. no WebGL) */
  disabled?: boolean;
  /** Optional class for the wrapper */
  className?: string;
}

export default function MapView3DToggle({
  is3D,
  onToggle,
  map,
  disabled = false,
  className = "",
}: MapView3DToggleProps) {
  const handleClick = () => {
    if (disabled) return;
    const next = !is3D;
    setPersisted3D(next);
    onToggle();
    if (map) {
      map.easeTo({
        pitch: next ? PITCH_3D : 0,
        bearing: next ? BEARING_3D : 0,
        duration: 500,
      });
      update3DBuildingsVisibility(map, next);
    }
  };

  const label = is3D ? "3D" : "2D";
  const ariaLabel = disabled
    ? "3D map is not available on this device"
    : `Switch to ${is3D ? "2D" : "3D"} map view`;

  return (
    <div
      className={`flex flex-col items-end gap-1 ${className}`.trim()}
      role="group"
      aria-label="Map view mode"
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-pressed={is3D}
        className={`
          rounded-lg border bg-white/95 px-3 py-2 text-sm font-medium shadow-sm
          transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
          ${disabled ? "cursor-not-allowed border-gray-200 text-gray-400" : "cursor-pointer border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400"}
        `.trim()}
      >
        {label}
      </button>
      {is3D && !disabled && (
        <span className="max-w-[140px] text-right text-xs text-gray-600">
          Zoom in to see 3D buildings
        </span>
      )}
      {disabled && (
        <span className="max-w-[120px] text-right text-xs text-gray-500">
          WebGL not supported
        </span>
      )}
    </div>
  );
}
