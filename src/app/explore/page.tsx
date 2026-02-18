"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ExploreHeader from "@/components/explore/ExploreHeader";
import TrendingCarousel from "@/components/explore/TrendingCarousel";
import BestMomentsGrid from "@/components/explore/BestMomentsGrid";
import ExplorePlacesList from "@/components/explore/ExplorePlacesList";
import RecapBlogsList from "@/components/explore/RecapBlogsList";
import FriendsActivityList from "@/components/explore/FriendsActivityList";
import ExploreDetailDrawer from "@/components/explore/ExploreDetailDrawer";
import type { ExploreDetailItem } from "@/components/explore/ExploreDetailDrawer";
import ExploreMapPanel from "@/components/explore/ExploreMapPanel";
import ExploreEmptyState from "@/components/explore/ExploreEmptyState";
import { MOCK_NETWORK_PLACES } from "@/lib/mockNetwork";
import type { MockPlace } from "@/lib/mockNetwork";
import { getCachedUser } from "@/api/user";
import { getNetworkPlacesFromUser } from "@/lib/homeNetworkData";
import { useFriendsNetwork } from "@/contexts/FriendsNetworkContext";
import { networkPlacesFromFriendsVisitHistory } from "@/lib/lsHomeMappers";
import {
  getNetworkTrendingPlaces,
  getNetworkBestMoments,
  getNetworkRecapBlogs,
  getNetworkFriendActivity,
  toExploreMapPlace,
} from "@/lib/explore/exploreDataAdapter";
import type {
  ExploreTimeFilter,
  ExploreContentFilter,
  ExploreRadiusMi,
  ExploreSortMode,
  NetworkTrendingPlace,
  NetworkBestMoment,
  NetworkRecapBlogItem,
  NetworkFriendActivity,
  ExploreMapPlace,
} from "@/lib/explore/exploreTypes";

export default function ExplorePage() {
  const router = useRouter();

  const user = getCachedUser();
  const { visitEntries } = useFriendsNetwork();

  // ── Places data ──
  const places = useMemo(() => {
    const myPlaces = getNetworkPlacesFromUser(user ?? null);
    const friendsPlaces =
      visitEntries !== null
        ? networkPlacesFromFriendsVisitHistory(visitEntries)
        : [];
    const combined = [...myPlaces, ...friendsPlaces];
    return combined.length > 0 ? combined : MOCK_NETWORK_PLACES;
  }, [user, visitEntries]);

  // ── Section data from adapters ──
  const trendingPlaces = useMemo(() => getNetworkTrendingPlaces(), []);
  const bestMoments = useMemo(() => getNetworkBestMoments(), []);
  const recapBlogs = useMemo(() => getNetworkRecapBlogs(), []);
  const friendActivity = useMemo(() => getNetworkFriendActivity(), []);

  const hasNetworkData =
    places.length > 0 ||
    trendingPlaces.length > 0 ||
    bestMoments.length > 0 ||
    recapBlogs.length > 0 ||
    friendActivity.length > 0;

  // ── Filter state ──
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<ExploreTimeFilter>("All");
  const [contentFilter, setContentFilter] =
    useState<ExploreContentFilter>("Places");
  const [radiusMi, setRadiusMi] = useState<ExploreRadiusMi>(50);
  const [sortMode, setSortMode] = useState<ExploreSortMode>("Trending");

  // ── Map interaction state ──
  const [flyToLngLat, setFlyToLngLat] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<string | null>(
    null,
  );
  const [mapCollapsed, setMapCollapsed] = useState(false);
  const [overlayPlace, setOverlayPlace] = useState<ExploreMapPlace | null>(
    null,
  );

  // ── Detail drawer state ──
  const [detailItem, setDetailItem] = useState<ExploreDetailItem | null>(null);

  // ── Place selection ──
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);

  // ── Filtered places ──
  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return places;
    return places.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.username && p.username.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)),
    );
  }, [places, searchQuery]);

  // ── Helper: build ExploreMapPlace from MockPlace ──
  const mockToMapPlace = useCallback(
    (place: MockPlace): ExploreMapPlace | null => {
      if (place.lat == null || place.lng == null) return null;
      return {
        id: place.id,
        name: place.name ?? "Unknown",
        lat: place.lat,
        lng: place.lng,
        imageUrl: place.imageUrl,
        username: place.username,
        category: place.category,
      };
    },
    [],
  );

  // ── Handlers ──
  const handleTrendingClick = useCallback((place: NetworkTrendingPlace) => {
    setActivePlaceId(place.id);
    setHighlightedPlaceId(place.id);
    setFlyToLngLat({ lng: place.lng, lat: place.lat });
    setOverlayPlace(toExploreMapPlace(place));
    setDetailItem({ type: "trending", place });
  }, []);

  const handleMomentClick = useCallback((moment: NetworkBestMoment) => {
    if (moment.lat != null && moment.lng != null) {
      setFlyToLngLat({ lng: moment.lng, lat: moment.lat });
      setHighlightedPlaceId(moment.id);
    }
    setDetailItem({ type: "moment", moment });
  }, []);

  const handlePlaceClick = useCallback(
    (place: MockPlace) => {
      setActivePlaceId(place.id);
      setHighlightedPlaceId(place.id);
      const mapPlace = mockToMapPlace(place);
      if (mapPlace) {
        setFlyToLngLat({ lng: mapPlace.lng, lat: mapPlace.lat });
        setOverlayPlace(mapPlace);
        setDetailItem({ type: "place", place: mapPlace });
      }
    },
    [mockToMapPlace],
  );

  const handleBlogClick = useCallback((blog: NetworkRecapBlogItem) => {
    if (blog.coordinates && blog.coordinates.length > 0) {
      const first = blog.coordinates[0];
      setFlyToLngLat({ lng: first.lng, lat: first.lat });
    }
  }, []);

  const handleActivityClick = useCallback((activity: NetworkFriendActivity) => {
    if (activity.lat != null && activity.lng != null) {
      setFlyToLngLat({ lng: activity.lng, lat: activity.lat });
      setHighlightedPlaceId(activity.id);
    }
  }, []);

  const handleMapPlaceClick = useCallback(
    (place: MockPlace) => {
      setActivePlaceId(place.id);
      setHighlightedPlaceId(place.id);
      const mapPlace = mockToMapPlace(place);
      if (mapPlace) {
        setOverlayPlace(mapPlace);
        setDetailItem({ type: "place", place: mapPlace });
      }
    },
    [mockToMapPlace],
  );

  const handleDrawerViewOnMap = useCallback(() => {
    if (detailItem) {
      let coords: { lng: number; lat: number } | null = null;
      if (detailItem.type === "place") {
        coords = { lng: detailItem.place.lng, lat: detailItem.place.lat };
      } else if (detailItem.type === "trending") {
        coords = { lng: detailItem.place.lng, lat: detailItem.place.lat };
      } else if (
        detailItem.type === "moment" &&
        detailItem.moment.lat != null &&
        detailItem.moment.lng != null
      ) {
        coords = { lng: detailItem.moment.lng, lat: detailItem.moment.lat };
      }
      if (coords) {
        setFlyToLngLat(coords);
        setMapCollapsed(false);
      }
    }
    setDetailItem(null);
  }, [detailItem]);

  const handleDrawerClose = useCallback(() => {
    setOverlayPlace(null);
    setDetailItem(null);
  }, []);

  const handleFindFriends = useCallback(() => {
    router.push("/friends");
  }, [router]);

  return (
    <div className="relative h-[calc(100vh-77px)] w-full">
      <div className="flex h-full w-full flex-col lg:flex-row">
        {/* ── Left Sidebar ── */}
        <div className="w-1/2 shrink-0 overflow-y-auto border-b border-gray-200 bg-gray-50/50 lg:h-full lg:w-1/2 lg:border-b-0 lg:border-r">
          <ExploreHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            contentFilter={contentFilter}
            onContentFilterChange={setContentFilter}
            radiusMi={radiusMi}
            onRadiusChange={setRadiusMi}
            sortMode={sortMode}
            onSortChange={setSortMode}
          />

          {!hasNetworkData ? (
            <ExploreEmptyState onFindFriends={handleFindFriends} />
          ) : (
            <div className="space-y-6 px-4 py-4">
              {trendingPlaces.length > 0 && (
                <section>
                  <TrendingCarousel
                    places={trendingPlaces}
                    onPlaceClick={handleTrendingClick}
                  />
                </section>
              )}

              {bestMoments.length > 0 && (
                <section>
                  <BestMomentsGrid
                    moments={bestMoments}
                    onMomentClick={handleMomentClick}
                  />
                </section>
              )}

              <section>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  Places
                </h2>
                <ExplorePlacesList
                  places={filteredPlaces}
                  activePlaceId={activePlaceId}
                  onSelectPlace={setActivePlaceId}
                  onPlaceClick={handlePlaceClick}
                />
              </section>

              {recapBlogs.length > 0 && (
                <section>
                  <RecapBlogsList
                    blogs={recapBlogs}
                    onBlogClick={handleBlogClick}
                  />
                </section>
              )}

              {friendActivity.length > 0 && (
                <section>
                  <FriendsActivityList
                    activities={friendActivity}
                    onActivityClick={handleActivityClick}
                  />
                </section>
              )}
            </div>
          )}
        </div>

        {/* ── Map Panel ── */}
        <div className="w-1/2 lg:w-1/2 min-h-[300px] min-w-0 flex-1 lg:h-full">
          <ExploreMapPanel
            places={filteredPlaces}
            radiusMiles={radiusMi}
            flyToLngLat={flyToLngLat}
            highlightedPlaceId={highlightedPlaceId}
            overlayPlace={overlayPlace}
            onPlaceClick={handleMapPlaceClick}
            collapsed={mapCollapsed}
            onCollapsedChange={setMapCollapsed}
            className="h-full w-full"
          />
        </div>
      </div>

      {/* ── Detail Drawer (fixed overlay, outside flex flow) ── */}
      <ExploreDetailDrawer
        item={detailItem}
        onClose={handleDrawerClose}
        onViewOnMap={handleDrawerViewOnMap}
      />
    </div>
  );
}
