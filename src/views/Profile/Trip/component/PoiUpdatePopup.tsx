"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { MapPin, X, ExternalLink } from "lucide-react";
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
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 sm:p-6 pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Card */}
      <div className="relative w-full max-w-[340px] rounded-[32px] bg-white shadow-[0_24px_48px_rgba(0,0,0,0.12)] overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 ease-out">
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full text-black/40 hover:text-black/70 hover:bg-black/5 transition-colors focus:outline-none z-10"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Container */}
        <div className="px-6 pt-10 pb-6 flex flex-col items-center justify-center w-full min-h-[300px]">
          {/* Header text */}
          <div className="flex flex-col items-center text-center max-w-full">
            <h2 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight max-w-full break-words">
              {poi.name}
            </h2>

            {poi.category && (
              <span className="mt-3 inline-flex items-center justify-center rounded-full bg-blue-50 px-3 py-1 text-[13px] font-medium text-blue-500">
                {poi.category}
              </span>
            )}
          </div>

          <div className="mt-5 mb-6 flex flex-col items-center">
            {/* Subtle location pin context */}
            <div className="flex items-center gap-1.5 mb-4">
              <ExternalLink className="w-4 h-4 text-blue-500 shrink-0" />
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-medium text-blue-500 hover:text-blue-600 hover:underline transition-colors"
              >
                Open in Google Maps
              </a>
            </div>
            {/* Subtle Divider */}
            <div className="w-12 h-px bg-gray-200 rounded-full" />
          </div>

          {/* Action Area */}
          <div className="w-full flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onConfirm}
              disabled={saving}
              className="w-full h-14 text-[15px] font-bold text-white bg-blue-600 rounded-[20px] shadow-sm shadow-blue-500/20 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/30 hover:-translate-y-[0.5px] transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting Location...
                </span>
              ) : (
                "Confirm Location"
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="w-full h-12 text-[14px] font-semibold text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
