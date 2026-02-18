"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { MapPin, ExternalLink, Check, X } from "lucide-react";
import type { PoiInfo } from "@/views/Profile/travel-stats/components/MapBoxMap";

function generateMapsUrl(lat: number, lng: number, label: string) {
  const baseUrl = "https://www.google.com/maps/search/?api=1";
  const query = encodeURIComponent(`${label} ${lat},${lng}`);
  return `${baseUrl}&query=${query}`;
}

type Props = {
  poi: PoiInfo;
  /** Name of the place entry that will be overwritten */
  targetPlaceName: string;
  saving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function PoiUpdatePopup({
  poi,
  targetPlaceName,
  saving,
  onConfirm,
  onCancel,
}: Props) {
  const mapsUrl = generateMapsUrl(poi.lat, poi.lng, poi.name);

  // ESC to cancel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onCancel}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50">
              <MapPin className="w-4 h-4 text-blue-500" />
            </span>
            <h2 className="text-[15px] font-semibold text-gray-900 truncate">
              {poi.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex-shrink-0 ml-2 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-5 pb-4 space-y-2">
          {poi.category && (
            <span className="inline-block text-[12px] font-medium text-blue-600 bg-blue-50 rounded-full px-2.5 py-0.5">
              {poi.category}
            </span>
          )}

          <p className="text-[13px] text-gray-500 leading-relaxed">
            <span className="font-medium text-gray-700">{poi.name}</span>
            {poi.category ? ` · ${poi.category}` : ""}
          </p>

          <p className="text-[12px] text-gray-400">
            {poi.lat.toFixed(5)}, {poi.lng.toFixed(5)}
          </p>

          {/* Google Maps link */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] text-blue-500 hover:text-blue-700 hover:underline transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in Google Maps
          </a>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-5" />

        {/* Confirm section */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-[13px] text-gray-600">
            Update{" "}
            <span className="font-semibold text-gray-900">
              &ldquo;{targetPlaceName}&rdquo;
            </span>{" "}
            with this location?
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex-1 py-2 text-[13px] font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={saving}
              className="flex-1 py-2 text-[13px] font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {saving ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Updating…
                </span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Update Place
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
