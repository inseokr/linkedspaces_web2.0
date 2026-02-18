"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { createRoot } from "react-dom/client";
import type { MockPlace } from "@/lib/mockNetwork";
import { haversineMiles } from "@/lib/haversine";
import {
  applyLinkedSpacesMapStyle,
  MAPBOX_STYLE_URL,
} from "@/app/profile/mapbox-linkedspaces-style";
import {
  MARKER_CIRCLE_RADIUS,
  MARKER_CIRCLE_STROKE_WIDTH,
} from "@/app/profile/mapbox-marker-constants";
import type { UserSentiment } from "@/app/profile/mapbox-category-pins";
import OrangePlaceMarker from "@/app/profile/components/OrangePlaceMarker";
import { getCachedUser } from "@/api/user";
import { useCachedUserLocation } from "@/contexts/UserLocationContext";

const VALID_SENTIMENTS: UserSentiment[] = ["positive", "neutral", "negative"];

/** Normalize sentiment from feature props; default to "neutral" so Explore markers always show a badge. */
function getExploreMarkerSentiment(value: unknown): UserSentiment {
  const s = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (VALID_SENTIMENTS.includes(s as UserSentiment)) return s as UserSentiment;
  return "neutral";
}

const DEFAULT_RADIUS_MILES = 500;
const SAN_JOSE_CENTER = { lat: 37.3382, lng: -121.8863 };
/** Zoom level when centered on user location or neighborhood; zoomed in to see markers clearly. */
const DEFAULT_ZOOM = 14;
const FLY_TO_ZOOM = 15;
function getDefaultMapCenter(): { lat: number; lng: number } {
  const user = getCachedUser();
  const home = user?.homeLocation;
  if (
    home &&
    Number.isFinite(home.latitude) &&
    Number.isFinite(home.longitude)
  ) {
    return { lat: home.latitude, lng: home.longitude };
  }
  return SAN_JOSE_CENTER;
}
/** Zoom in by this much on cluster click to disperse clusters (same as My Places / Top Places). */
const ZOOM_EXTRA_ON_CLUSTER_CLICK = 3;
const MAX_ZOOM_CLUSTER = 18;
/** Duration for flying to closest place on load and when flyToTarget changes */
const FLY_TO_CLOSEST_DURATION_MS = 800;

export interface ExploreMapProps {
  places: MockPlace[];
  className?: string;
  /** Radius in miles for filtering pins (default 500). */
  radiusMiles?: number;
  /** When set, map flies to this point (e.g. when user clicks a card). */
  flyToLngLat?: { lng: number; lat: number } | null;
  /** Place id to highlight (selected ring on marker). */
  highlightedPlaceId?: string | null;
  /** Called when user clicks a place marker; use to open the place photo modal */
  onPlaceClick?: (place: MockPlace) => void;
}

function usePlacesWithinRadius(
  places: MockPlace[],
  center: { lat: number; lng: number } | null,
  radiusMiles: number,
) {
  return useMemo(() => {
    if (!center) return [];
    return places.filter(
      (p) =>
        haversineMiles(center.lat, center.lng, p.lat, p.lng) <= radiusMiles,
    );
  }, [places, center, radiusMiles]);
}

/** Find the place in the list closest to the given center (for positioning the map). */
function findClosestPlace(
  places: MockPlace[],
  center: { lat: number; lng: number },
): MockPlace | null {
  if (places.length === 0) return null;
  let closest = places[0];
  let minDist = haversineMiles(
    center.lat,
    center.lng,
    closest.lat,
    closest.lng,
  );
  for (let i = 1; i < places.length; i++) {
    const p = places[i];
    const d = haversineMiles(center.lat, center.lng, p.lat, p.lng);
    if (d < minDist) {
      minDist = d;
      closest = p;
    }
  }
  return closest;
}

export default function ExploreMap({
  places,
  className = "",
  radiusMiles = DEFAULT_RADIUS_MILES,
  flyToLngLat,
  highlightedPlaceId = null,
  onPlaceClick,
}: ExploreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const mapboxglRef = useRef<any>(null);
  const filteredPlacesRef = useRef<MockPlace[]>([]);
  const onPlaceClickRef = useRef<((place: MockPlace) => void) | undefined>(
    onPlaceClick,
  );
  const highlightedPlaceIdRef = useRef<string | null>(
    highlightedPlaceId ?? null,
  );
  highlightedPlaceIdRef.current = highlightedPlaceId ?? null;
  const { position: userLocation } = useCachedUserLocation();
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const neighborhoodCenter = useMemo(() => getDefaultMapCenter(), []);
  const center = userLocation ?? neighborhoodCenter;
  const filteredPlaces = usePlacesWithinRadius(places, center, radiusMiles);
  filteredPlacesRef.current = filteredPlaces;
  onPlaceClickRef.current = onPlaceClick;

  /** Fly target: explicit flyToLngLat from card click, or closest place, or center */
  const closestPlace = useMemo(
    () => findClosestPlace(places, center),
    [places, center],
  );
  const flyToTarget = useMemo(() => {
    if (flyToLngLat) return flyToLngLat;
    if (closestPlace) return { lng: closestPlace.lng, lat: closestPlace.lat };
    return { lng: center.lng, lat: center.lat };
  }, [flyToLngLat, closestPlace, center]);

  const initialCenterRef = useRef(center);
  initialCenterRef.current = center;

  const initMap = useCallback(async () => {
    const token =
      typeof process !== "undefined"
        ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        : undefined;
    if (!token) {
      setLoadError("NEXT_PUBLIC_MAPBOX_TOKEN is not set.");
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    const [lng, lat] = [
      initialCenterRef.current.lng,
      initialCenterRef.current.lat,
    ];
    try {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxglRef.current = mapboxgl;
      mapboxgl.accessToken = token;

      const map = new mapboxgl.Map({
        container,
        style: MAPBOX_STYLE_URL,
        center: [lng, lat],
        zoom: DEFAULT_ZOOM,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.on("load", () => {
        applyLinkedSpacesMapStyle(map);
        setMapReady(true);
      });

      mapRef.current = map;
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load the map.");
    }
  }, []);

  useEffect(() => {
    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initMap]);

  /** On load and when flyToTarget changes, fly to that point (zoom in when flyToLngLat is set) */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const zoom = flyToLngLat ? FLY_TO_ZOOM : DEFAULT_ZOOM;
    map.easeTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom,
      duration: FLY_TO_CLOSEST_DURATION_MS,
    });
  }, [mapReady, flyToTarget.lat, flyToTarget.lng, flyToLngLat]);

  const sourceId = "explore-places";
  const clusterLayerId = "explore-clusters";
  const clusterCountId = "explore-cluster-count";
  /** Invisible circle layer for queryRenderedFeatures; OrangePlaceMarker (DOM) draws the visible marker. */
  const unclusteredCircleLayerId = "explore-unclustered-circle";

  const domMarkersRef = useRef<
    Map<
      string,
      { marker: any; root: ReturnType<typeof createRoot>; el: HTMLDivElement }
    >
  >(new Map());
  const syncDomMarkersRef = useRef<((m: any) => void) | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (map.getSource(sourceId)) return;
    const domMarkers = domMarkersRef.current;

    map.addSource(sourceId, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });
    map.addLayer({
      id: clusterLayerId,
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#f97316",
        "circle-radius": ["step", ["get", "point_count"], 20, 10, 28, 50, 36],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff",
      },
    });
    map.addLayer({
      id: clusterCountId,
      type: "symbol",
      source: sourceId,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 14,
      },
      paint: { "text-color": "#ffffff" },
    });
    map.addLayer({
      id: unclusteredCircleLayerId,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "rgba(249, 115, 22, 0.9)",
        "circle-radius": MARKER_CIRCLE_RADIUS,
        "circle-stroke-width": MARKER_CIRCLE_STROKE_WIDTH,
        "circle-stroke-color": "#fff",
        "circle-opacity": 0,
      },
    });

    const syncDomMarkersAsync = async (m: any) => {
      if (!m || !m.getSource(sourceId)) return;
      const mapboxgl = await import("mapbox-gl");
      const features = m.queryRenderedFeatures(undefined, {
        layers: [unclusteredCircleLayerId],
      }) as GeoJSON.Feature<GeoJSON.Point, Record<string, unknown>>[];
      const currentIds = new Set(
        features.map((f) =>
          String(
            f.properties?.id ??
              (f as GeoJSON.Feature & { id?: string }).id ??
              "",
          ),
        ),
      );

      for (const f of features) {
        const id = String(
          f.properties?.id ?? (f as GeoJSON.Feature & { id?: string }).id ?? "",
        );
        if (!id) continue;
        const coords = f.geometry?.coordinates;
        if (!coords || coords.length < 2) continue;
        const props = f.properties ?? {};
        const placeName = String(props.placeName ?? props.name ?? "");
        const category = String(props.category ?? "Others");
        const sentiment = getExploreMarkerSentiment(props.sentiment);
        const subtext = props.username ? String(props.username) : undefined;
        const selected = id === (highlightedPlaceIdRef.current ?? "");

        if (domMarkersRef.current.has(id)) {
          const entry = domMarkersRef.current.get(id)!;
          entry.marker.setLngLat([coords[0], coords[1]]);
          entry.root.render(
            React.createElement(OrangePlaceMarker, {
              placeName,
              category,
              sentiment,
              subtext: subtext ?? null,
              selected,
            }),
          );
          continue;
        }
        const el = document.createElement("div");
        el.className = "orange-place-marker-wrapper";
        el.style.cursor = "pointer";
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const place = filteredPlacesRef.current.find((p) => p.id === id);
          if (place && onPlaceClickRef.current) onPlaceClickRef.current(place);
        });
        const root = createRoot(el);
        root.render(
          React.createElement(OrangePlaceMarker, {
            placeName,
            category,
            sentiment,
            subtext: subtext ?? null,
            selected,
          }),
        );
        const marker = new mapboxgl.default.Marker({ element: el })
          .setLngLat([coords[0], coords[1]])
          .addTo(m);
        domMarkersRef.current.set(id, { marker, root, el });
      }

      for (const [id, entry] of domMarkersRef.current.entries()) {
        if (!currentIds.has(id)) {
          try {
            entry.marker.remove();
            entry.root.unmount();
          } catch {
            // ignore
          }
          domMarkersRef.current.delete(id);
        }
      }
    };

    syncDomMarkersRef.current = (m: any) => {
      void syncDomMarkersAsync(m);
    };
    void syncDomMarkersAsync(map);
    map.on("moveend", () => syncDomMarkersRef.current?.(map));
    map.on("zoomend", () => syncDomMarkersRef.current?.(map));

    const onClusterClick = (e: { point: [number, number] }) => {
      const source = map.getSource(sourceId) as
        | {
            getClusterExpansionZoom?: (
              id: number,
              cb: (err: Error | null, zoom: number) => void,
            ) => void;
          }
        | undefined;
      if (!source || typeof source.getClusterExpansionZoom !== "function")
        return;
      const features = map.queryRenderedFeatures(e.point, {
        layers: [clusterLayerId, clusterCountId],
      });
      if (!features.length) return;
      const clusterId = features[0].properties?.cluster_id;
      if (clusterId == null) return;
      const geom = features[0].geometry as GeoJSON.Point;
      const coords = geom?.coordinates;
      if (!coords || coords.length < 2) return;
      const [lng, lat] = coords;
      source.getClusterExpansionZoom(
        clusterId,
        (err: Error | null, zoom: number) => {
          if (err) return;
          map.easeTo({
            center: [lng, lat],
            zoom: Math.min(
              zoom + ZOOM_EXTRA_ON_CLUSTER_CLICK,
              MAX_ZOOM_CLUSTER,
            ),
            duration: 350,
          });
        },
      );
    };
    map.on("click", clusterLayerId, onClusterClick);
    map.on("click", clusterCountId, onClusterClick);

    return () => {
      map.off("click", clusterLayerId, onClusterClick);
      map.off("click", clusterCountId, onClusterClick);
      for (const [, entry] of domMarkers.entries()) {
        try {
          entry.marker.remove();
          entry.root.unmount();
        } catch {
          // ignore
        }
      }
      domMarkers.clear();
      syncDomMarkersRef.current = null;
      try {
        if (map.getLayer(unclusteredCircleLayerId))
          map.removeLayer(unclusteredCircleLayerId);
        if (map.getLayer(clusterCountId)) map.removeLayer(clusterCountId);
        if (map.getLayer(clusterLayerId)) map.removeLayer(clusterLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // ignore
      }
    };
  }, [mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !map.getSource(sourceId)) return;
    (
      map.getSource(sourceId) as {
        setData: (d: GeoJSON.FeatureCollection) => void;
      }
    ).setData({
      type: "FeatureCollection",
      features: filteredPlaces.map((p) => ({
        type: "Feature",
        id: p.id,
        properties: {
          id: p.id,
          name: p.name,
          placeName: p.name,
          category: p.category ?? "Others",
          sentiment: p.sentiment ?? undefined,
          username: p.username ?? undefined,
        },
        geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      })),
    });
    // Re-sync DOM markers after data change and when highlight changes.
    setTimeout(() => syncDomMarkersRef.current?.(map), 0);
  }, [mapReady, filteredPlaces, highlightedPlaceId]);

  if (loadError) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-8 text-center ${className}`}
      >
        <p className="font-medium text-amber-800">Map unavailable</p>
        <p className="text-sm text-amber-700">{loadError}</p>
        <p className="text-xs text-amber-600">
          Add{" "}
          <code className="rounded bg-amber-100 px-1">
            NEXT_PUBLIC_MAPBOX_TOKEN
          </code>{" "}
          to <code className="rounded bg-amber-100 px-1">.env.local</code> and
          restart the dev server.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`h-full w-full min-h-[400px] ${className}`}
      aria-label="Explore map"
    />
  );
}
