"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { SavedPlace } from "../mockData";
import type { MarkerData } from "@/views/Profile/travel-stats/components/MapBoxMap";
import MapPlaceholder from "./MapPlaceholder";

const MapboxMap = dynamic(
  () => import("@/views/Profile/travel-stats/components/MapBoxMap"),
  { ssr: false, loading: () => <MapPlaceholderFallback /> },
);

function MapPlaceholderFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100" />
  );
}

function toMarkerData(place: SavedPlace): MarkerData {
  return {
    id: place.id,
    lat: place.lat,
    lng: place.lng,
    year: new Date().getFullYear(),
    label: place.name,
    imageUrl: place.thumbnailUrl ?? `https://picsum.photos/80/80?random=${place.id}`,
    dateLabel: place.visitedDate.replace(/^Visited\s/i, ""),
  };
}

interface MyPlacesMapProps {
  places: SavedPlace[];
}

export default function MyPlacesMap({ places }: MyPlacesMapProps) {
  const token =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      : undefined;

  const placeMarkers = useMemo(
    () => places.map(toMarkerData),
    [places],
  ) as MarkerData[];

  if (!token) {
    return (
      <div className="absolute inset-0">
        <MapPlaceholder places={places} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl border border-gray-200">
      <MapboxMap
        mode="place"
        placeMarkers={placeMarkers}
        showPlacePath={false}
        useSimpleMarkers
        overlayTopRight={
          <div className="rounded-lg border border-gray-200 bg-white/95 px-3 py-1.5 text-sm text-gray-700 shadow-sm">
            {places.length} {places.length === 1 ? "place" : "places"} on map
          </div>
        }
      />
    </div>
  );
}
