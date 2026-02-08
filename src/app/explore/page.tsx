"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ExploreMap from "@/components/explore/ExploreMap";
import ExplorePlacesList from "@/components/explore/ExplorePlacesList";
import PhotoLightbox from "@/components/ui/PhotoLightbox";
import { MOCK_NETWORK_PLACES } from "@/lib/mockNetwork";
import type { MockPlace } from "@/lib/mockNetwork";
import { getCachedUser } from "@/api/user";
import { getNetworkPlacesFromUser } from "@/lib/homeNetworkData";

const PLACEHOLDER_PHOTO =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80";

const CHIP_CLASS =
  "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2";

function normalizeCategory(cat: string | undefined): string {
  const t = (cat ?? "").trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : "Others";
}

export default function ExplorePage() {
  const user = getCachedUser();
  const places = useMemo(() => {
    const realPlaces = getNetworkPlacesFromUser(user ?? null);
    return realPlaces.length > 0 ? realPlaces : MOCK_NETWORK_PLACES;
  }, [user?._id, user?.placeVisitHistory?.length]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => {
      const c = normalizeCategory(p.category);
      if (c !== "All") set.add(c);
    });
    return ["All", ...[...set].sort((a, b) => a.localeCompare(b))];
  }, [places]);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPlace, setSelectedPlace] = useState<MockPlace | null>(null);
  /** Highlight in list when user clicks map marker or list row */
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  /** Expand list panel width (arrow button toggles). */
  const [listPanelExpanded, setListPanelExpanded] = useState(false);
  const LIST_PANEL_NARROW_PX = 380;
  const LIST_PANEL_WIDE_PX = 720;
  const listPanelWidthPx = listPanelExpanded
    ? LIST_PANEL_WIDE_PX
    : LIST_PANEL_NARROW_PX;

  const filteredPlaces = useMemo(() => {
    if (selectedCategory === "All") return places;
    return places.filter(
      (p) => normalizeCategory(p.category) === selectedCategory,
    );
  }, [places, selectedCategory]);

  const lightboxPhotos = selectedPlace
    ? selectedPlace.imageUrl
      ? [selectedPlace.imageUrl]
      : [PLACEHOLDER_PHOTO]
    : [];

  const handlePlaceClick = (place: MockPlace) => {
    setActivePlaceId(place.id);
    setSelectedPlace(place);
  };

  return (
    <div className="flex h-[calc(100vh-77px)] w-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <span className="shrink-0 text-sm font-medium text-gray-600">
          Category:
        </span>
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter map by category"
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`${CHIP_CLASS} ${
                  isActive
                    ? "bg-[var(--color-main)] text-white shadow-sm"
                    : "bg-white text-gray-700 shadow border border-gray-200 hover:bg-gray-50"
                }`}
                aria-pressed={isActive}
                aria-label={
                  cat === "All" ? "Show all places" : `Filter by ${cat}`
                }
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* List (left) + resize handle + Map (right), same flow as My Places My Map. Mobile: list on top, map below. */}
      <div
        className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(200px,2fr)_minmax(300px,3fr)] gap-0 lg:grid-rows-1 lg:[grid-template-columns:var(--explore-list-px)_20px_1fr]"
        style={{
          minHeight: 0,
          ["--explore-list-px" as string]: `${listPanelWidthPx}px`,
        }}
      >
        <div className="relative min-h-0 min-w-0 overflow-y-auto border-b border-gray-200 bg-gray-50/50 px-4 py-4 pr-3 lg:border-b-0 lg:border-r">
          <ExplorePlacesList
            places={filteredPlaces}
            activePlaceId={activePlaceId}
            onSelectPlace={setActivePlaceId}
            onPlaceClick={handlePlaceClick}
          />
        </div>
        {/* Resize handle: arrow right = expand list, arrow left = collapse (visible on lg only) */}
        <div className="hidden w-5 shrink-0 items-center justify-center bg-gray-100 transition-colors hover:bg-gray-200 lg:flex">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setListPanelExpanded((prev) => !prev);
            }}
            className="flex h-full w-full items-center justify-center text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-main)]"
            aria-label={
              listPanelExpanded ? "Narrow place list" : "Widen place list"
            }
          >
            {listPanelExpanded ? (
              <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
            ) : (
              <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
            )}
          </button>
        </div>
        <div className="relative min-h-[400px] min-w-0">
          <ExploreMap
            places={filteredPlaces}
            className="absolute inset-0 h-full w-full"
            onPlaceClick={handlePlaceClick}
          />
        </div>
      </div>

      {selectedPlace && lightboxPhotos.length > 0 && (
        <PhotoLightbox
          photos={lightboxPhotos}
          initialIndex={0}
          title={selectedPlace.name}
          onClose={() => setSelectedPlace(null)}
        />
      )}
    </div>
  );
}
