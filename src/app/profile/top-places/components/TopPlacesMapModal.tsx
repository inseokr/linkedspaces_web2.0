"use client";

import * as React from "react";
import type { TopPlaceCardModel } from "../types";
import type { CountryWithCount } from "../mockData";
import type { CategoryWithCount } from "./FiltersPopover";
import CountryChipsRow from "./CountryChipsRow";
import CategoryChipsRow from "./CategoryChipsRow";
import TopPlacesMapView from "./TopPlacesMapView";
import BigPlaceCard from "./BigPlaceCard";
import TopPlacesHorizontalList from "./TopPlacesHorizontalList";
import PlaceLightboxModal, { type LightboxImage } from "./PlaceLightboxModal";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/** Format visit date for lightbox (ISO or "YYYY:MM:DD HH:mm:ss"). */
function formatVisitDate(isoOrYmd: string): string {
  const s = String(isoOrYmd).trim();
  if (!s) return "Date unknown";
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "long" });
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const h12 = hours % 12 || 12;
    const ampm = hours < 12 ? "AM" : "PM";
    return `${day} ${month} ${d.getFullYear()} at ${h12}:${String(minutes).padStart(2, "0")} ${ampm}`;
  }
  return s;
}

export interface TopPlacesMapModalProps {
  open: boolean;
  onClose: () => void;
  /** Filtered places (same as grid); map will use those with valid lat/lng when wired to real data */
  places: TopPlaceCardModel[];
  countryPills: CountryWithCount[];
  categoryPills: CategoryWithCount[];
  activeCountryId: string | null;
  activeCategory: string | "All";
  onCountrySelect: (id: string | null) => void;
  onCategorySelect: (category: string | "All") => void;
}

export default function TopPlacesMapModal({
  open,
  onClose,
  places,
  countryPills,
  categoryPills,
  activeCountryId,
  activeCategory,
  onCountrySelect,
  onCategorySelect,
}: TopPlacesMapModalProps) {
  const placesWithCoords = React.useMemo(
    () =>
      places.filter(
        (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude),
      ),
    [places],
  );

  const defaultSelectedId = React.useMemo(() => {
    const rankOne = placesWithCoords.find((p) => p.rank === 1);
    return rankOne?.id ?? placesWithCoords[0]?.id ?? null;
  }, [placesWithCoords]);

  const [selectedPlaceId, setSelectedPlaceId] = React.useState<string | null>(
    () => defaultSelectedId,
  );

  const [placeForLightbox, setPlaceForLightbox] =
    React.useState<TopPlaceCardModel | null>(null);

  const [bookmarked, setBookmarked] = React.useState<Set<string>>(new Set());
  const [liked, setLiked] = React.useState<Set<string>>(new Set());
  const [likeDelta, setLikeDelta] = React.useState<Record<string, number>>({});

  const onBookmarkToggle = React.useCallback((placeId: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
  }, []);

  const onLikeToggle = React.useCallback((placeId: string) => {
    setLiked((prev) => {
      const isCurrentlyLiked = prev.has(placeId);
      const next = new Set(prev);
      if (isCurrentlyLiked) next.delete(placeId);
      else next.add(placeId);
      setLikeDelta((d) => ({
        ...d,
        [placeId]: (d[placeId] ?? 0) + (isCurrentlyLiked ? -1 : 1),
      }));
      return next;
    });
  }, []);

  const lightboxImages: LightboxImage[] = React.useMemo(() => {
    if (!placeForLightbox) return [];
    const uris = placeForLightbox.photoListUris ?? [placeForLightbox.imageUrl];
    const dateTime =
      placeForLightbox.visitedTime != null &&
      String(placeForLightbox.visitedTime).trim()
        ? formatVisitDate(placeForLightbox.visitedTime)
        : "Date unknown";
    const base = {
      placeId: placeForLightbox.id,
      placeName: placeForLightbox.title,
      dateTime,
      category: placeForLightbox.category,
      visibility: "public" as const,
      ...(placeForLightbox.caption
        ? { caption: placeForLightbox.caption }
        : {}),
      ...(placeForLightbox.city ? { placeCity: placeForLightbox.city } : {}),
      ...(placeForLightbox.userSentiment
        ? { sentiment: placeForLightbox.userSentiment }
        : {}),
    };
    return uris.length > 0
      ? uris.map((src) => ({ src, ...base }))
      : [{ src: placeForLightbox.imageUrl, ...base }];
  }, [placeForLightbox]);

  React.useEffect(() => {
    if (!open) return;
    setSelectedPlaceId(defaultSelectedId);
  }, [open, defaultSelectedId]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const selectedPlace =
    selectedPlaceId != null
      ? (places.find((p) => p.id === selectedPlaceId) ?? null)
      : null;

  const handlePlaceSelect = React.useCallback((place: TopPlaceCardModel) => {
    setSelectedPlaceId(place.id);
  }, []);

  const handleMapPinSelect = React.useCallback((placeId: string) => {
    setSelectedPlaceId(placeId);
  }, []);

  const handleViewPhotos = React.useCallback(
    (placeId: string) => {
      const place = places.find((p) => p.id === placeId) ?? null;
      if (place) setPlaceForLightbox(place);
    },
    [places],
  );

  const selectedIndex = React.useMemo(
    () =>
      selectedPlaceId == null
        ? -1
        : placesWithCoords.findIndex((p) => p.id === selectedPlaceId),
    [selectedPlaceId, placesWithCoords],
  );

  const handleBigCardPrev = React.useCallback(() => {
    if (selectedIndex <= 0) return;
    setSelectedPlaceId(placesWithCoords[selectedIndex - 1].id);
  }, [selectedIndex, placesWithCoords]);

  const handleBigCardNext = React.useCallback(() => {
    if (selectedIndex < 0 || selectedIndex >= placesWithCoords.length - 1)
      return;
    setSelectedPlaceId(placesWithCoords[selectedIndex + 1].id);
  }, [selectedIndex, placesWithCoords]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-white"
      role="dialog"
      aria-modal="true"
      aria-label="Top Spaces full map"
    >
      {/* Top bar: filters full width (original layout), close on right */}
      <div className="absolute left-0 top-0 z-10 flex w-full items-start justify-between gap-4 p-3 pr-14 md:p-4 md:pr-14">
        <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden max-h-[40vh]">
          <CountryChipsRow
            countries={countryPills}
            selectedId={activeCountryId}
            onSelect={onCountrySelect}
            maxVisible={8}
          />
          <CategoryChipsRow
            categories={categoryPills}
            selectedCategory={activeCategory}
            onSelect={onCategorySelect}
            hideLabel
            hiddenByDefault={["education", "transportation", "airport"]}
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white/95 shadow-md transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          aria-label="Close map"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* Full screen map */}
      <div className="absolute inset-0">
        <TopPlacesMapView
          places={places}
          activeCountryId={activeCountryId}
          activeCategory={activeCategory}
          selectedPlaceId={selectedPlaceId}
          onPlaceSelect={handleMapPinSelect}
          onPlaceViewPhotos={handleViewPhotos}
        />
      </div>

      {/* Middle-left: section title + Big Place Card + horizontal list — height tied to viewport, scrolls on short screens */}
      <div className="absolute bottom-4 left-6 top-[11rem] z-10 flex w-[min(540px,calc(100vw-4rem))] flex-col md:left-10 md:w-[min(580px,calc(100vw-5rem))] lg:left-12 lg:w-[min(620px,calc(100vw-6rem))]">
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden rounded-xl border border-gray-200/90 bg-white/95 p-3 shadow-xl backdrop-blur-sm md:gap-4 md:p-4 [scrollbar-width:thin]">
          {/* Dynamic title: "Top Places Globally" or "Top Places [Country Name]" — matches main Top Places page */}
          <h2 className="shrink-0 text-lg font-semibold text-gray-900 md:text-xl">
            {activeCountryId && activeCountryId !== "all"
              ? (() => {
                  const country = countryPills.find(
                    (c) => c.id === activeCountryId,
                  );
                  return country
                    ? `Top Places ${country.name}`
                    : "Top Places Globally";
                })()
              : "Top Places Globally"}
          </h2>
          {/* Big Place Card at top — takes remaining space */}
          <div className="flex min-h-0 flex-1 flex-col">
            {selectedPlace ? (
              <div className="relative flex min-h-0 flex-1 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={handleBigCardPrev}
                  disabled={selectedIndex <= 0}
                  className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 -translate-x-1 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 md:h-12 md:w-12"
                  aria-label="Previous place"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700 md:h-6 md:w-6" />
                </button>
                <BigPlaceCard
                  place={selectedPlace}
                  onPlaceClick={() => setPlaceForLightbox(selectedPlace)}
                  displayLikes={
                    selectedPlace.likesCount +
                    (likeDelta[selectedPlace.id] ?? 0)
                  }
                  isBookmarked={bookmarked.has(selectedPlace.id)}
                  isLiked={liked.has(selectedPlace.id)}
                  onBookmarkToggle={() => onBookmarkToggle(selectedPlace.id)}
                  onLikeToggle={() => onLikeToggle(selectedPlace.id)}
                />
                <button
                  type="button"
                  onClick={handleBigCardNext}
                  disabled={
                    selectedIndex < 0 ||
                    selectedIndex >= placesWithCoords.length - 1
                  }
                  className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 translate-x-1 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 md:h-12 md:w-12"
                  aria-label="Next place"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700 md:h-6 md:w-6" />
                </button>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                Select a place to see details
              </div>
            )}
          </div>
          <div className="mt-2 shrink-0 md:mt-3">
            <TopPlacesHorizontalList
              places={places}
              selectedPlaceId={selectedPlaceId}
              onPlaceSelect={handlePlaceSelect}
            />
          </div>
        </div>
      </div>

      <PlaceLightboxModal
        isOpen={!!placeForLightbox}
        onClose={() => setPlaceForLightbox(null)}
        images={lightboxImages}
        startIndex={0}
      />
    </div>
  );
}
