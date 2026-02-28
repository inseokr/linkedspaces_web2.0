"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, MapPin, Pencil } from "lucide-react";

import MapboxMap, {
  type MarkerData,
  type PoiInfo,
} from "@/views/Profile/travel-stats/components/MapBoxMap";
import PoiUpdatePopup from "@/views/Profile/Trip/component/PoiUpdatePopup";
import type { RecapEntry } from "./RecapBlogPlace";

type Props = {
  /** The entry being edited */
  entry: RecapEntry;
  /** All entries across ALL days — used to build route polyline context on the map */
  allEntries: RecapEntry[];
  /** Called when user changes the place name text */
  onPlaceNameChange: (next: string) => void;
  /** Called when user confirms a POI from the map — passes the POI info and the entry id */
  onPoiConfirm: (poi: PoiInfo, entryId: string) => Promise<void> | void;
  onClose: () => void;
};

export default function PlaceMapEditorModal({
  entry,
  allEntries,
  onPlaceNameChange,
  onPoiConfirm,
  onClose,
}: Props) {
  const [localName, setLocalName] = useState(entry.placeName);
  const [pendingPoi, setPendingPoi] = useState<PoiInfo | null>(null);
  const [poiSaving, setPoiSaving] = useState(false);
  // Incrementing this forces MapboxMap to call resize() after the portal mounts
  const [mapResizeKey, setMapResizeKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Trigger a map resize shortly after mount so Mapbox fills the container
  useEffect(() => {
    const id = window.setTimeout(() => setMapResizeKey((k) => k + 1), 80);
    return () => window.clearTimeout(id);
  }, []);

  // Sync if entry.placeName changes from outside (e.g., POI confirm upstream)
  useEffect(() => {
    setLocalName(entry.placeName);
  }, [entry.placeName]);

  // Focus input when modal opens
  useEffect(() => {
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, []);

  // ESC closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (pendingPoi) {
          setPendingPoi(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, pendingPoi]);

  // Only show this single entry's marker — no other places, no route path
  const placeMarkers: MarkerData[] =
    entry.coordinate?.latitude && entry.coordinate?.longitude
      ? [
          {
            id: entry.id,
            lat: entry.coordinate.latitude,
            lng: entry.coordinate.longitude,
            year: new Date().getFullYear(),
            label: entry.placeName,
            imageUrl: entry.photos?.[0] ?? "/images/avatar.png",
            visitIndex: entry.visitIndex,
            visitTimeText: entry.timeRangeText ?? "",
            externalUrl: entry.externalUrl,
            markerRole: entry.markerRole ?? "poi",
          },
        ]
      : [];

  const focusLatLng =
    entry.coordinate?.latitude && entry.coordinate?.longitude
      ? { lat: entry.coordinate.latitude, lng: entry.coordinate.longitude }
      : undefined;

  const handleNameChange = (next: string) => {
    setLocalName(next);
    onPlaceNameChange(next);
  };

  const handlePoiClick = useCallback((poi: PoiInfo) => {
    setPendingPoi(poi);
  }, []);

  const handlePoiConfirm = useCallback(async () => {
    if (!pendingPoi) return;
    setPoiSaving(true);
    try {
      await onPoiConfirm(pendingPoi, entry.id);
      setLocalName(pendingPoi.name);
    } finally {
      setPoiSaving(false);
      setPendingPoi(null);
    }
  }, [pendingPoi, onPoiConfirm, entry.id]);

  if (typeof document === "undefined") return null;

  // Fixed heights so Mapbox GL gets a concrete pixel measurement
  const MAP_HEIGHT = 600;

  return createPortal(
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Edit place location"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel — width capped, height determined by fixed map + chrome */}
      <div
        className="relative z-10 w-full max-w-[1075px] bg-white rounded-[28px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.08] bg-white">
          {/* Close button — top left */}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold text-black/60 hover:text-black hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </button>

          <div className="h-6 w-px bg-black/10 shrink-0" />

          {/* Place name input */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 text-black/30 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={localName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Place name…"
              className="flex-1 min-w-0 bg-transparent text-[17px] font-bold text-black placeholder:text-black/30 focus:outline-none"
            />
            <Pencil className="h-3.5 w-3.5 text-black/20 shrink-0" />
          </div>
        </div>

        {/* Place meta row */}
        <div className="flex items-center gap-3 px-5 py-2.5 bg-black/[0.02] border-b border-black/[0.05] flex-wrap">
          {entry.timeRangeText?.trim() && (
            <span className="text-[13px] font-semibold text-black/50">
              {entry.timeRangeText}
            </span>
          )}
          {entry.categoryLabel && (
            <span className="rounded-full bg-black/5 px-3 py-0.5 text-[12px] font-semibold text-black/60">
              {entry.categoryLabel}
            </span>
          )}
          {entry.markerRole && entry.markerRole !== "poi" && (
            <span
              className="rounded-full px-3 py-0.5 text-[12px] font-bold text-white"
              style={{
                background:
                  entry.markerRole === "start"
                    ? "rgb(34,197,94)"
                    : "rgb(249,115,22)",
              }}
            >
              {entry.markerRole === "start" ? "Start" : "End"}
            </span>
          )}
          <span className="text-[12px] font-medium text-black/30 ml-auto">
            Tap a POI on the map to update this location
          </span>
        </div>

        {/* ── Map — explicit height so Mapbox GL can render ── */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: MAP_HEIGHT }}
        >
          <MapboxMap
            mode="place"
            placeMarkers={placeMarkers}
            activePlaceMarkerId={entry.id}
            focusLatLng={focusLatLng}
            onPlaceMarkerClick={() => {
              /* clicking own marker — no-op */
            }}
            onPoiClick={handlePoiClick}
            showPlacePath={false}
            containerResizeKey={mapResizeKey}
          />

          {/* "No link" hint pill */}
          {!entry.externalUrl && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none whitespace-nowrap">
              <div className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 shadow-lg shadow-blue-500/40 text-[13px] font-semibold text-white">
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                </span>
                Tap a nearby place on the map to refine this location
              </div>
            </div>
          )}
        </div>
      </div>

      {/* POI confirmation popup (rendered above modal, via its own portal) */}
      {pendingPoi && (
        <PoiUpdatePopup
          poi={pendingPoi}
          targetPlaceName={localName || entry.placeName}
          saving={poiSaving}
          onConfirm={handlePoiConfirm}
          onCancel={() => setPendingPoi(null)}
        />
      )}
    </div>,
    document.body,
  );
}
