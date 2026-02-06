"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { LayoutGrid, Search } from "lucide-react";
import { getCachedUser } from "@/api/user";
import { getMyPlacesFromUser } from "./realData";
import type { PlaceCategory, SavedPlace } from "./mockData";
import dynamic from "next/dynamic";
import LatestActivityCarousel from "./components/LatestActivityCarousel";
import PlacesList from "./components/PlacesList";
import FilterPopover from "./components/FilterPopover";
import PlaceLightboxModal, {
  type LightboxImage,
} from "../top-places/components/PlaceLightboxModal";
import MyPlacesSearchOverlay from "./components/MyPlacesSearchOverlay";
import type { SearchPlace } from "./searchMockData";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

const PLACEHOLDER_IMAGE = "https://picsum.photos/400/600?random=place";

/** Parse date/time: ISO, YYYY-MM-DD, or "YYYY:MM:DD HH:mm:ss" (digitizedTime). */
function parseDateTime(s: string): Date | null {
  const raw = String(s).trim();
  if (!raw) return null;
  let d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d;
  const withTime =
    /^(\d{4})[-:](\d{2})[-:](\d{2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(raw);
  if (withTime) {
    const y = Number(withTime[1]),
      m = Number(withTime[2]) - 1,
      day = Number(withTime[3]);
    const h = Number(withTime[4]),
      min = Number(withTime[5]),
      sec = Number(withTime[6] ?? 0);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(day))
      return new Date(y, m, day, h, min, sec);
  }
  const dateOnly = /^(\d{4})[-:](\d{2})[-:](\d{2})/.exec(raw);
  if (dateOnly) {
    const y = Number(dateOnly[1]),
      m = Number(dateOnly[2]) - 1,
      day = Number(dateOnly[3]);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(day))
      return new Date(y, m, day);
  }
  return null;
}

/** Format visit date/time for lightbox with actual hours and minutes. */
function formatVisitDateForLightbox(isoOrYmd: string | undefined): string {
  if (!isoOrYmd?.trim()) return "";
  const d = parseDateTime(isoOrYmd);
  if (!d || Number.isNaN(d.getTime())) return isoOrYmd.trim();
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "long" });
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const h12 = hours % 12 || 12;
  const ampm = hours < 12 ? "AM" : "PM";
  const timeStr = `${h12}:${String(minutes).padStart(2, "0")} ${ampm}`;
  return `${day} ${month} ${d.getFullYear()} at ${timeStr}`;
}

const PhotoMap = dynamic(() => import("./components/PhotoMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100" />
  ),
});

export default function ProfileMyPlacesPage() {
  const [mounted, setMounted] = useState(false);
  const user = mounted ? getCachedUser() : null;
  const { latestActivity, savedPlaces, categories } = useMemo(
    () => getMyPlacesFromUser(user),
    [user],
  );

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  const ALL_CATEGORIES = useMemo(
    () => new Set<PlaceCategory>(categories),
    [categories],
  );
  const [selectedCategories, setSelectedCategories] =
    useState<Set<PlaceCategory>>(ALL_CATEGORIES);
  /**
   * Single source of truth for list-map sync (PR: list/map mismatch fix).
   * Root cause: Previously we had scroll-based focus + click both updating "focusedPlaceId",
   * so the map kept flying on scroll (jitter) and sometimes the wrong marker highlighted
   * because scroll and click competed. Fix: one state (activePlaceId) updated only on
   * explicit list item click (and initial/filter change). Map reads it for feature-state
   * highlight and flyTo; no scroll-driven updates.
   */
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SavedPlace | null>(null);
  const [searchLightboxImages, setSearchLightboxImages] = useState<
    LightboxImage[] | null
  >(null);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const listScrollRef = useRef<HTMLDivElement | null>(null);
  const [listScrollReady, setListScrollReady] = useState(false);
  const setListScrollRef = useCallback((el: HTMLDivElement | null) => {
    listScrollRef.current = el;
    setListScrollReady(!!el);
  }, []);
  const prevFilteredPlacesRef = useRef<SavedPlace[]>([]);

  const filteredPlaces = useMemo(() => {
    if (selectedCategories.size === 0) return [];
    return savedPlaces.filter((p: SavedPlace) =>
      selectedCategories.has(p.category),
    );
  }, [savedPlaces, selectedCategories]);

  const lightboxImages: LightboxImage[] = useMemo(() => {
    if (!selectedPlace) return [];
    const uris = selectedPlace.photoListUris?.length
      ? selectedPlace.photoListUris
      : selectedPlace.thumbnailUrl
        ? [selectedPlace.thumbnailUrl]
        : [];
    const dateTime =
      formatVisitDateForLightbox(selectedPlace.visitedTimeRaw) ||
      "Date unknown";
    const caption = selectedPlace.caption ?? selectedPlace.snippet ?? undefined;
    const base = {
      placeName: selectedPlace.name,
      dateTime,
      ...(caption ? { caption } : {}),
      ...(selectedPlace.city ? { placeCity: selectedPlace.city } : {}),
    };
    return uris.length > 0
      ? uris.map((src) => ({ src, ...base }))
      : [{ src: "https://picsum.photos/400/600?random=placeholder", ...base }];
  }, [selectedPlace]);

  const hasPlaces = savedPlaces.length > 0;

  useEffect(() => {
    if (!listScrollReady || filteredPlaces.length === 0) return;
    const prev = prevFilteredPlacesRef.current;
    const listChanged =
      prev !== filteredPlaces ||
      prev.length !== filteredPlaces.length ||
      prev[0]?.id !== filteredPlaces[0]?.id;
    prevFilteredPlacesRef.current = filteredPlaces;
    if (listChanged) {
      const nextId = filteredPlaces[0].id;
      const id = setTimeout(() => setActivePlaceId(nextId), 0);
      return () => clearTimeout(id);
    }
  }, [listScrollReady, filteredPlaces]);

  if (!mounted) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-main)] border-t-transparent"
          aria-hidden
        />
        <p className="mt-3 text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
        <p className="text-center text-gray-600">
          Sign in to see your saved places and map.
        </p>
        <Link
          href="/sign-in"
          className="mt-4 rounded-lg bg-[var(--color-main)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (!hasPlaces) {
    return (
      <div className="flex min-h-full flex-col">
        <section className="shrink-0 border-b border-gray-200 bg-white px-4 py-6 md:px-6 lg:px-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Latest Activity
            </h2>
            <Link
              href="/profile/places"
              className="text-sm font-medium text-[var(--color-main)] hover:underline"
            >
              View All Places
            </Link>
          </div>
          <p className="text-gray-500">
            No places yet. Your saved places from trips will appear here.
          </p>
        </section>
        <section className="shrink-0 border-t border-gray-200 bg-white px-4 pt-4 pb-6 md:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-gray-900">My Map</h2>
          <p className="mt-4 text-gray-500">
            When you add places from your trip recaps, they’ll show on the map.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Latest Activity: header and carousel share same horizontal layout for a clean stretch */}
      <section
        className="shrink-0 border-b border-gray-200 bg-white px-4 py-6 md:px-6 lg:px-8"
        aria-labelledby="latest-activity-heading"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2
            id="latest-activity-heading"
            className="text-xl font-semibold text-gray-900"
          >
            Latest Activity
          </h2>
          <button
            type="button"
            onClick={() => setSearchOverlayOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-gray-200 bg-transparent px-4 py-2 text-left text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 sm:max-w-md"
            aria-label="Search places"
          >
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="hidden truncate sm:inline">Search places</span>
          </button>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/profile/places"
              className="text-sm font-medium text-[var(--color-main)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 rounded"
            >
              View All Places
            </Link>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
        <LatestActivityCarousel
          places={latestActivity}
          onPlaceClick={(placeId) => {
            setSearchLightboxImages(null);
            const full = savedPlaces.find((p) => p.id === placeId);
            if (full) setSelectedPlace(full);
          }}
        />
      </section>

      {/* My Map: larger fixed height (5 places visible); header sits flush under main header when scrolled to top */}
      <section
        className="shrink-0 border-t border-gray-200 bg-white px-4 pt-4 pb-6 md:px-6 md:pt-4 lg:px-8"
        aria-labelledby="my-map-heading"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2
            id="my-map-heading"
            className="text-xl font-semibold text-gray-900"
          >
            My Map
          </h2>
          <FilterPopover
            selectedCategories={selectedCategories}
            onSelectionChange={setSelectedCategories}
            categories={categories}
            label="Filter"
          />
        </div>

        {/* Fixed height (~5 place cards visible in list); list scrolls inside, map stays fixed. Stacked on small screens. */}
        <div className="grid grid-cols-1 grid-rows-[770px_770px] gap-6 lg:h-[770px] lg:grid-cols-[minmax(0,380px)_1fr] lg:grid-rows-none">
          <div
            ref={setListScrollRef}
            className="relative min-h-0 min-w-0 overflow-y-auto pr-1"
          >
            <PlacesList
              places={filteredPlaces}
              activePlaceId={activePlaceId}
              onSelectPlace={(placeId) => setActivePlaceId(placeId)}
              onPlaceClick={(place) => {
                setSearchLightboxImages(null);
                setSelectedPlace(place);
              }}
            />
            <ScrollToTopButton
              scrollContainerRef={listScrollRef}
              scrollTargetReady={listScrollReady}
              showAfterPx={400}
            />
          </div>
          <div className="relative h-full min-h-[400px] min-w-0 w-full">
            <PhotoMap places={filteredPlaces} activePlaceId={activePlaceId} />
          </div>
        </div>
      </section>

      <PlaceLightboxModal
        isOpen={
          (!!selectedPlace && lightboxImages.length > 0) ||
          (searchLightboxImages != null && searchLightboxImages.length > 0)
        }
        onClose={() => {
          if (searchLightboxImages != null) setSearchLightboxImages(null);
          else setSelectedPlace(null);
        }}
        images={
          searchLightboxImages?.length ? searchLightboxImages : lightboxImages
        }
        startIndex={0}
      />
      <MyPlacesSearchOverlay
        isOpen={searchOverlayOpen}
        onClose={() => setSearchOverlayOpen(false)}
        onSelectPlace={(place: SearchPlace) => {
          const matched = savedPlaces.find(
            (p) => p.id === place.id || p.name === place.name,
          );
          if (matched) {
            setSearchLightboxImages(null);
            setSelectedPlace(matched);
          } else {
            setSelectedPlace(null);
            setSearchLightboxImages([
              {
                src: PLACEHOLDER_IMAGE,
                placeName: place.name,
                dateTime: "Searched",
                placeCity: place.city,
              },
            ]);
          }
        }}
      />
    </div>
  );
}
