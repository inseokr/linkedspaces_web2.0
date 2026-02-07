"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Maximize2,
  Search,
  X,
} from "lucide-react";
import { getCachedUser } from "@/api/user";
import { getMyPlacesFromUser } from "./realData";
import type { PlaceCategory, SavedPlace } from "./mockData";
import { PLACE_CATEGORIES } from "./mockData";
import dynamic from "next/dynamic";
import LatestActivityCarousel from "./components/LatestActivityCarousel";
import PlacesList from "./components/PlacesList";
import MapCategoryChips, {
  type MapCategoryFilter,
} from "./components/MapCategoryChips";
import PlaceLightboxModal, {
  type LightboxImage,
  type PlaceComment,
} from "../top-places/components/PlaceLightboxModal";
import EditPlaceModal from "./components/EditPlaceModal";
import MyPlacesSearchOverlay from "./components/MyPlacesSearchOverlay";
import type { SearchPlace } from "./searchMockData";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import { useLayoutMode } from "@/components/layout/LayoutModeContext";

const PLACEHOLDER_IMAGE = "https://picsum.photos/400/600?random=place";

/** Approximate distance in km between two points (Haversine). */
function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Centroid of places with valid coords; fallback to first place or null. */
function centroid(places: SavedPlace[]): { lat: number; lng: number } | null {
  const valid = places.filter(
    (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng),
  );
  if (valid.length === 0) return null;
  const lat = valid.reduce((s, p) => s + p.lat, 0) / valid.length;
  const lng = valid.reduce((s, p) => s + p.lng, 0) / valid.length;
  return { lat, lng };
}

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
  const [user, setUser] = useState<ReturnType<typeof getCachedUser>>(null);
  const { latestActivity, savedPlaces, categories } = useMemo(
    () => getMyPlacesFromUser(user),
    [user],
  );
  /** User's current location for sorting the list (nearest first). Null until resolved or unavailable. */
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    const syncUser = () => {
      setUser(getCachedUser());
      setMounted(true);
    };
    queueMicrotask(syncUser);
    window.addEventListener("focus", syncUser);
    return () => window.removeEventListener("focus", syncUser);
  }, []);

  useEffect(() => {
    if (!user || typeof navigator === "undefined" || !navigator.geolocation)
      return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (Number.isFinite(lat) && Number.isFinite(lng))
          setUserLocation({ lat, lng });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, [user]);

  const [selectedCategories, setSelectedCategories] = useState<
    Set<PlaceCategory>
  >(() => new Set(PLACE_CATEGORIES));
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
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
  const [openWithComments, setOpenWithComments] = useState(false);
  const [searchLightboxImages, setSearchLightboxImages] = useState<
    LightboxImage[] | null
  >(null);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [editPlace, setEditPlace] = useState<SavedPlace | null>(null);
  const [mapFullScreen, setMapFullScreen] = useState(false);
  const [mapCategoryFilter, setMapCategoryFilter] =
    useState<MapCategoryFilter>("All");
  const [listPanelExpanded, setListPanelExpanded] = useState(false);
  const LIST_PANEL_NARROW_PX = 480;
  const LIST_PANEL_WIDE_PX = 720;
  const listPanelWidthPx = listPanelExpanded
    ? LIST_PANEL_WIDE_PX
    : LIST_PANEL_NARROW_PX;
  const { setFullScreenMapActive } = useLayoutMode();

  useEffect(() => {
    if (!mapFullScreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMapFullScreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mapFullScreen]);

  useEffect(() => {
    setFullScreenMapActive(mapFullScreen);
    return () => setFullScreenMapActive(false);
  }, [mapFullScreen, setFullScreenMapActive]);

  /** Local overrides for visibility (private/public) when user saves in Edit modal before backend persist. */
  const [visibilityOverrides, setVisibilityOverrides] = useState<
    Record<string, "private" | "public">
  >({});
  /** Local overrides for category when user saves in Edit modal before backend persist. */
  const [categoryOverrides, setCategoryOverrides] = useState<
    Record<string, PlaceCategory>
  >({});
  const listScrollRef = useRef<HTMLDivElement | null>(null);
  const lastMapViewRef = useRef<{
    center: [number, number];
    zoom: number;
  } | null>(null);
  const viewToRestoreRef = useRef<{
    center: [number, number];
    zoom: number;
  } | null>(null);
  const [viewToRestore, setViewToRestore] = useState<{
    center: [number, number];
    zoom: number;
  } | null>(null);
  const [listScrollReady, setListScrollReady] = useState(false);
  const setListScrollRef = useCallback((el: HTMLDivElement | null) => {
    listScrollRef.current = el;
    setListScrollReady(!!el);
  }, []);
  const prevFilteredPlacesRef = useRef<SavedPlace[]>([]);

  const saveMapViewBeforeOpen = useCallback(() => {
    viewToRestoreRef.current = lastMapViewRef.current
      ? {
          center: [...lastMapViewRef.current.center],
          zoom: lastMapViewRef.current.zoom,
        }
      : null;
  }, []);

  const filteredPlaces = useMemo(() => {
    if (selectedCategories.size === 0) return [];
    return savedPlaces.filter((p: SavedPlace) =>
      selectedCategories.has(p.category),
    );
  }, [savedPlaces, selectedCategories]);

  const sortedPlacesForList = useMemo(() => {
    if (filteredPlaces.length === 0) return filteredPlaces;
    const ref = userLocation ?? centroid(filteredPlaces);
    if (!ref) return filteredPlaces;
    return [...filteredPlaces].sort((a, b) => {
      const aOk = Number.isFinite(a.lat) && Number.isFinite(a.lng);
      const bOk = Number.isFinite(b.lat) && Number.isFinite(b.lng);
      if (!aOk && !bOk) return 0;
      if (!aOk) return 1;
      if (!bOk) return -1;
      const dA = distanceKm(a.lat, a.lng, ref.lat, ref.lng);
      const dB = distanceKm(b.lat, b.lng, ref.lat, ref.lng);
      return dA - dB;
    });
  }, [filteredPlaces, userLocation]);

  /** Places to show on the map: filtered by map overlay category (All or single category), still sorted by distance. */
  const placesForMap = useMemo(() => {
    if (mapCategoryFilter === "All") return sortedPlacesForList;
    return sortedPlacesForList.filter((p) => p.category === mapCategoryFilter);
  }, [sortedPlacesForList, mapCategoryFilter]);

  const initialCommentsByPlaceId = useMemo((): Record<
    string,
    PlaceComment[]
  > => {
    const m: Record<string, PlaceComment[]> = {};
    for (const p of savedPlaces) {
      if (p.comments?.length) m[p.id] = p.comments as PlaceComment[];
    }
    return m;
  }, [savedPlaces]);

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
    const visibility =
      visibilityOverrides[selectedPlace.id] ??
      selectedPlace.visibility ??
      "public";
    const category =
      categoryOverrides[selectedPlace.id] ?? selectedPlace.category;
    const base = {
      placeId: selectedPlace.id,
      placeName: selectedPlace.name,
      dateTime,
      visibility,
      ...(category ? { category } : {}),
      ...(caption ? { caption } : {}),
      ...(selectedPlace.city ? { placeCity: selectedPlace.city } : {}),
    };
    return uris.length > 0
      ? uris.map((src) => ({ src, ...base }))
      : [{ src: "https://picsum.photos/400/600?random=placeholder", ...base }];
  }, [selectedPlace, visibilityOverrides, categoryOverrides]);

  const hasPlaces = savedPlaces.length > 0;

  useEffect(() => {
    if (!listScrollReady || placesForMap.length === 0) return;
    const prev = prevFilteredPlacesRef.current;
    const listChanged =
      prev !== placesForMap ||
      prev.length !== placesForMap.length ||
      prev[0]?.id !== placesForMap[0]?.id;
    prevFilteredPlacesRef.current = placesForMap;
    if (listChanged) {
      const nextId = placesForMap[0].id;
      const id = setTimeout(() => setActivePlaceId(nextId), 0);
      return () => clearTimeout(id);
    }
  }, [listScrollReady, placesForMap]);

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
        <header className="shrink-0 border-b border-gray-200 bg-white px-4 pt-6 pb-4 md:px-6 md:pt-8 md:pb-5 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            My Places
          </h1>
        </header>
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
      {/* Page title: My Places at top left; padding pushes Latest Activity and My Map down */}
      <header className="shrink-0 border-b border-gray-200 bg-white px-4 pt-6 pb-4 md:px-6 md:pt-8 md:pb-5 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          My Places
        </h1>
      </header>

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
            className="flex min-w-0 flex-1 items-center gap-2 rounded-full border-2 border-gray-300 bg-transparent px-4 py-2 text-left text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 focus:border-[var(--color-main)] sm:max-w-md"
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
            setOpenWithComments(false);
            setLightboxStartIndex(0);
            const full = savedPlaces.find((p) => p.id === placeId);
            if (full) setSelectedPlace(full);
          }}
          onCommentClick={(placeId) => {
            setSearchLightboxImages(null);
            setOpenWithComments(true);
            setLightboxStartIndex(0);
            const full = savedPlaces.find((p) => p.id === placeId);
            if (full) setSelectedPlace(full);
          }}
        />
      </section>

      {/* My Map: larger fixed height (5 places visible); header sits flush under main header when scrolled to top. Click map background to expand full screen. */}
      <section
        className={
          mapFullScreen
            ? "fixed top-0 right-0 bottom-0 z-[100] flex flex-col bg-white overflow-hidden"
            : "shrink-0 border-t border-gray-200 bg-white px-4 pt-4 pb-6 md:px-6 md:pt-4 lg:px-8"
        }
        style={
          mapFullScreen ? { left: "var(--sidebar-offset, 0px)" } : undefined
        }
        aria-labelledby="my-map-heading"
        role={mapFullScreen ? "dialog" : undefined}
        aria-modal={mapFullScreen ? "true" : undefined}
        aria-label={mapFullScreen ? "My Map full screen" : undefined}
      >
        {mapFullScreen && (
          /* Top bar above map/list so Close is always clickable (same pattern as Top Places map modal) */
          <div className="absolute left-0 top-0 right-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 pr-14 md:px-6 md:pr-14">
            <h2
              id="my-map-heading"
              className="text-xl font-semibold text-gray-900"
            >
              My Map
            </h2>
            <button
              type="button"
              onClick={() => setMapFullScreen(false)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-md transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
              aria-label="Close full screen map"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {!mapFullScreen && (
          <div className="mb-4 flex w-full items-center justify-between gap-3">
            <h2
              id="my-map-heading"
              className="text-xl font-semibold text-gray-900"
            >
              My Map
            </h2>
            <button
              type="button"
              onClick={() => setMapFullScreen(true)}
              className="ml-auto flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
              aria-label="Full screen map"
            >
              <Maximize2 className="h-4 w-4" />
              Full Screen
            </button>
          </div>
        )}

        {/* List on left, resize handle, map on right. Full screen: same layout, fills viewport; non–full screen: fixed height. */}
        <div
          className={
            mapFullScreen
              ? "grid min-h-0 flex-1 grid-rows-1 gap-0 px-4 pb-4 pt-14 md:px-6 md:pt-14"
              : "grid grid-cols-1 grid-rows-[770px_0_770px] gap-6 lg:h-[770px] lg:grid-rows-none lg:[grid-template-columns:var(--list-panel-width,380px)_20px_1fr]"
          }
          style={{
            ["--list-panel-width" as string]: `${listPanelWidthPx}px`,
            ...(mapFullScreen
              ? { gridTemplateColumns: `${listPanelWidthPx}px 20px 1fr` }
              : {}),
          }}
        >
          <div
            ref={setListScrollRef}
            className="relative min-h-0 min-w-0 overflow-y-auto pr-1"
          >
            <PlacesList
              places={placesForMap}
              activePlaceId={activePlaceId}
              onSelectPlace={(placeId) => setActivePlaceId(placeId)}
              onPlaceClick={(place) => {
                saveMapViewBeforeOpen();
                setSearchLightboxImages(null);
                setOpenWithComments(false);
                setLightboxStartIndex(0);
                setSelectedPlace(place);
              }}
              onCommentClick={(place) => {
                saveMapViewBeforeOpen();
                setSearchLightboxImages(null);
                setOpenWithComments(true);
                setLightboxStartIndex(0);
                setSelectedPlace(place);
              }}
            />
            <ScrollToTopButton
              scrollContainerRef={listScrollRef}
              scrollTargetReady={listScrollReady}
              showAfterPx={400}
            />
          </div>
          {/* Resize handle: arrow right = expand list, arrow left = collapse */}
          <div
            className={`flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors ${
              mapFullScreen
                ? "w-5"
                : "hidden lg:flex w-5 row-start-2 lg:row-auto"
            }`}
            style={!mapFullScreen ? { minHeight: 0 } : undefined}
          >
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
          <div className="relative h-full min-h-[400px] min-w-0 w-full">
            <PhotoMap
              places={placesForMap}
              activePlaceId={activePlaceId}
              onPlaceClick={(placeId, photoIndex) => {
                saveMapViewBeforeOpen();
                setSearchLightboxImages(null);
                setActivePlaceId(placeId);
                setLightboxStartIndex(photoIndex ?? 0);
                const full = savedPlaces.find((p) => p.id === placeId);
                if (full) setSelectedPlace(full);
              }}
              onMapViewChange={(center, zoom) => {
                lastMapViewRef.current = { center, zoom };
              }}
              restoreView={viewToRestore}
              onRestoreComplete={() => setViewToRestore(null)}
              onMapBackgroundClick={() => setMapFullScreen(true)}
            />
            <div className="absolute left-0 top-0 z-10 w-full p-3 pointer-events-none">
              <div className="pointer-events-auto">
                <MapCategoryChips
                  categories={PLACE_CATEGORIES}
                  selected={mapCategoryFilter}
                  onSelect={setMapCategoryFilter}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <PlaceLightboxModal
        isOpen={
          (!!selectedPlace && lightboxImages.length > 0) ||
          (searchLightboxImages != null && searchLightboxImages.length > 0)
        }
        onClose={() => {
          setViewToRestore(
            viewToRestoreRef.current
              ? {
                  center: [...viewToRestoreRef.current.center],
                  zoom: viewToRestoreRef.current.zoom,
                }
              : null,
          );
          setActivePlaceId(null);
          setOpenWithComments(false);
          setLightboxStartIndex(0);
          if (searchLightboxImages != null) setSearchLightboxImages(null);
          else setSelectedPlace(null);
        }}
        images={
          searchLightboxImages?.length ? searchLightboxImages : lightboxImages
        }
        startIndex={lightboxStartIndex}
        initialCommentsByPlaceId={initialCommentsByPlaceId}
        initialCommentsOpen={openWithComments}
        onEdit={
          selectedPlace
            ? () => {
                setEditPlace(selectedPlace);
                setViewToRestore(
                  viewToRestoreRef.current
                    ? {
                        center: [...viewToRestoreRef.current.center],
                        zoom: viewToRestoreRef.current.zoom,
                      }
                    : null,
                );
                setActivePlaceId(null);
                setSelectedPlace(null);
                if (searchLightboxImages != null) setSearchLightboxImages(null);
              }
            : undefined
        }
      />
      <EditPlaceModal
        isOpen={editPlace !== null}
        categories={categories}
        place={
          editPlace
            ? {
                ...editPlace,
                visibility:
                  visibilityOverrides[editPlace.id] ??
                  editPlace.visibility ??
                  "public",
                category:
                  categoryOverrides[editPlace.id] ??
                  editPlace.category ??
                  "Others",
              }
            : null
        }
        onClose={() => {
          if (editPlace) setSelectedPlace(editPlace);
          setEditPlace(null);
        }}
        onSave={(updates) => {
          if (editPlace) {
            if (updates.visibility !== undefined) {
              setVisibilityOverrides((prev) => ({
                ...prev,
                [editPlace.id]: updates.visibility!,
              }));
            }
            if (updates.category !== undefined) {
              setCategoryOverrides((prev) => ({
                ...prev,
                [editPlace.id]: updates.category!,
              }));
            }
          }
          // TODO: persist name/caption/visibility/category to backend
        }}
        onDelete={
          editPlace
            ? (placeId) => {
                // TODO: remove place from backend; for now just close
                setEditPlace(null);
              }
            : undefined
        }
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
                placeId: place.id,
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
