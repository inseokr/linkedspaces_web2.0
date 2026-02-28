"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, MapPin, Pencil, Check, Loader2, ExternalLink } from "lucide-react";

function generateMapsUrl(lat: number, lng: number, label: string) {
  const baseUrl = "https://www.google.com/maps/search/?api=1";
  const query = encodeURIComponent(`${label} ${lat},${lng}`);
  return `${baseUrl}&query=${query}`;
}

import MapboxMap, {
  type MarkerData,
  type PoiInfo,
} from "@/views/Profile/travel-stats/components/MapBoxMap";
import type { RecapEntry } from "./RecapBlogPlace";

type Props = {
  /** The entry being edited */
  entry: RecapEntry;
  /** All entries across ALL days — passed in but unused for markers (single-marker mode) */
  allEntries: RecapEntry[];
  /** Called when user changes the place name text */
  onPlaceNameChange: (next: string) => void;
  /** Called when user confirms a POI from the map — passes the POI info and the entry id */
  onPoiConfirm: (poi: PoiInfo, entryId: string) => Promise<void> | void;
  onClose: () => void;
};

type SearchResult = {
  poi: PoiInfo;
  fullName: string;
};

export default function PlaceMapEditorModal({
  entry,
  allEntries,
  onPlaceNameChange,
  onPoiConfirm,
  onClose,
}: Props) {
  const [localName, setLocalName] = useState(entry.placeName);
  // The staged POI from a map tap — shown in header, confirmed via button
  const [stagedPoi, setStagedPoi] = useState<PoiInfo | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [mapResizeKey, setMapResizeKey] = useState(0);
  // Keep camera on POI after click (updated dynamically so the map doesn't zoom out)
  const [focusLatLng, setFocusLatLng] = useState<
    { lat: number; lng: number } | undefined
  >(
    entry.coordinate?.latitude && entry.coordinate?.longitude
      ? { lat: entry.coordinate.latitude, lng: entry.coordinate.longitude }
      : undefined,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Search state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<number | undefined>(undefined);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Resize map after portal mounts
  useEffect(() => {
    const id = window.setTimeout(() => setMapResizeKey((k) => k + 1), 80);
    return () => window.clearTimeout(id);
  }, []);

  // Sync name if upstream changes (e.g., after confirm)
  useEffect(() => {
    setLocalName(entry.placeName);
  }, [entry.placeName]);

  // Focus input on open
  useEffect(() => {
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, []);

  // ESC: clear staging and dropdown, then close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showDropdown) {
          setShowDropdown(false);
        } else if (stagedPoi) {
          // Revert name back, clear staging
          setLocalName(entry.placeName);
          setStagedPoi(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, stagedPoi, entry.placeName, showDropdown]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", onClick);
    }
    return () => document.removeEventListener("mousedown", onClick);
  }, [showDropdown]);

  // Single marker for this entry only
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

  const searchMapboxPlaces = async (query: string) => {
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) return;

      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&autocomplete=true&limit=6`,
      );
      if (!res.ok) return;
      const data = await res.json();

      const results: SearchResult[] = (data.features || []).map((f: any) => ({
        poi: {
          name: f.text,
          category: f.properties?.category || f.place_type?.[0] || "",
          lat: f.center[1],
          lng: f.center[0],
        },
        fullName: f.place_name || f.text,
      }));
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNameChange = (next: string) => {
    setLocalName(next);
    setStagedPoi(null); // clear any staged POI if user types manually
    onPlaceNameChange(next);

    if (next.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    if (searchTimeoutRef.current !== undefined) {
      window.clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = window.setTimeout(() => {
      searchMapboxPlaces(next);
    }, 350);
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    setStagedPoi(result.poi);
    setLocalName(result.poi.name);
    setFocusLatLng({ lat: result.poi.lat, lng: result.poi.lng });
    setShowDropdown(false);
  };

  // POI tap on map → stage it + update name input + keep camera centered
  const handlePoiClick = useCallback((poi: PoiInfo) => {
    setStagedPoi(poi);
    setLocalName(poi.name);
    setShowDropdown(false);
    // Keep the camera where it is — just update focusLatLng to the POI
    // so the map doesn't fall back to fitToCurrentMarkersBounds
    setFocusLatLng({ lat: poi.lat, lng: poi.lng });
  }, []);

  // Confirm button → persist staged POI
  const handleConfirm = useCallback(async () => {
    if (!stagedPoi) return;
    setConfirming(true);
    try {
      await onPoiConfirm(stagedPoi, entry.id);
      setStagedPoi(null);
      onClose();
    } finally {
      setConfirming(false);
    }
  }, [stagedPoi, onPoiConfirm, entry.id, onClose]);

  const handleReset = useCallback(() => {
    const original = entry.originalPlaceName || entry.placeName;
    setLocalName(original);
    setStagedPoi(null);
    onPlaceNameChange(original);
  }, [entry, onPlaceNameChange]);

  if (typeof document === "undefined") return null;

  const MAP_HEIGHT = 600;
  const hasStaged = !!stagedPoi;

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

      {/* Modal panel */}
      <div
        className="relative z-10 w-full max-w-[1075px] bg-white rounded-[28px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.08] bg-white relative z-20">
          {/* Close — top left */}
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

          {/* Place name input (fills center) */}
          <div
            className="flex-1 flex items-center gap-2 min-w-0 relative"
            ref={searchContainerRef}
          >
            <MapPin className="h-4 w-4 text-black/30 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={localName}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => {
                if (localName.trim().length >= 2 && searchResults.length > 0) {
                  setShowDropdown(true);
                }
              }}
              placeholder="Search for a place…"
              className="flex-1 min-w-0 bg-transparent text-[17px] font-bold text-black placeholder:text-black/30 focus:outline-none"
            />
            {isSearching && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500 shrink-0 mr-1" />
            )}
            {!hasStaged && !isSearching && (
              <Pencil className="h-3.5 w-3.5 text-black/20 shrink-0" />
            )}

            {/* Live Search Dropdown */}
            {showDropdown && localName.trim().length >= 2 && (
              <div className="absolute top-[100%] left-0 right-12 mt-3 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden z-[600] max-h-[340px] flex flex-col">
                {isSearching && searchResults.length === 0 ? (
                  <div className="px-5 py-4 text-sm font-medium text-black/40">
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-5 py-4 text-sm font-medium text-black/40">
                    No matching places found.
                  </div>
                ) : (
                  <div className="overflow-y-auto overscroll-contain py-2">
                    {searchResults.map((res, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSearchResult(res)}
                        className="w-full text-left px-5 py-3 hover:bg-black/[0.03] active:bg-black/[0.06] transition-colors flex flex-col gap-0.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-bold text-black/90">
                            {res.poi.name}
                          </span>
                          {res.poi.category && (
                            <span className="text-[12px] font-medium text-black/40 bg-black/5 px-2 py-0.5 rounded-md">
                              {res.poi.category}
                            </span>
                          )}
                        </div>
                        <span className="text-[13px] text-black/50 line-clamp-1 mt-0.5">
                          {res.fullName}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reset + Confirm / Confirm controls — top right, only shown when name is edited or POI is staged */}
          <div className="shrink-0 flex items-center gap-2 pr-2 ml-2">
            {((entry.originalPlaceName &&
              entry.originalPlaceName !== localName) ||
              stagedPoi) && (
              <button
                type="button"
                onClick={handleReset}
                className="shrink-0 inline-flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 px-3 py-2 transition-colors group"
                aria-label="Reset place name"
                title="Revert to original place name"
              >
                <span className="text-[13px] font-bold text-black/60 group-hover:text-black/80">
                  Reset
                </span>
              </button>
            )}

            {hasStaged && (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={confirming}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-70 shadow-sm shadow-blue-500/30"
              >
                {confirming ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Confirm</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Meta row */}
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
            {hasStaged
              ? `"${stagedPoi!.name}" selected — tap Confirm to save`
              : "Search or tap a POI on the map to update this location"}
          </span>
        </div>

        {/* Map */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: MAP_HEIGHT }}
        >
          <MapboxMap
            mode="place"
            placeMarkers={placeMarkers}
            activePlaceMarkerId={entry.id}
            focusLatLng={focusLatLng}
            onPlaceMarkerClick={() => {}}
            onPoiClick={handlePoiClick}
            showPlacePath={false}
            showZoomControls={true}
            containerResizeKey={mapResizeKey}
          />

          {/* Hint pill */}
          {!entry.externalUrl && !hasStaged && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none whitespace-nowrap">
              <div className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 shadow-lg shadow-blue-500/40 text-[13px] font-semibold text-white">
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                </span>
                Search or tap a nearby place on the map to refine this location
              </div>
            </div>
          )}

          {/* Staged POI pill — shows name + invite to confirm */}
          {hasStaged && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none whitespace-nowrap flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md border border-blue-200 px-4 py-2.5 shadow-lg text-[13px] font-semibold text-blue-600">
                <Check className="h-3.5 w-3.5 shrink-0" />
                {stagedPoi!.name}
                {stagedPoi!.category && (
                  <span className="font-normal text-blue-400">
                    · {stagedPoi!.category}
                  </span>
                )}
              </div>
              <a
                href={generateMapsUrl(
                  stagedPoi!.lat,
                  stagedPoi!.lng,
                  stagedPoi!.name,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-blue-100 hover:bg-white hover:border-blue-200 transition-colors group"
                aria-label="Open in Google Maps"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[12px] font-medium text-blue-500 group-hover:text-blue-600 opacity-90 transition-colors">
                  Open in Google Maps
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
