"use client";

/**
 * My Places Photo Map — single Mapbox entry point.
 * GeoJSON source + clustering; viewport-based thumbnail loading; DEBUG support.
 * Uses REAL data (places from getMyPlacesFromUser / realData).
 *
 * List-map sync: activePlaceId (from parent) drives marker highlight (feature-state)
 * and camera flyTo. Toggle debug: window.__DEBUG_MAP_INTERACTIONS = true
 *
 * Manual test plan:
 * - Click 5 random list items in a row; map highlights correct marker each time.
 * - Filter list, click item; marker still correct.
 * - Sort list (if applicable), click item; marker still correct.
 * - No console errors.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import {
  add3DBuildingsLayer,
  getPersisted3D,
  setPersisted3D,
  update3DBuildingsVisibility,
  set3DBuildingsVisibility,
  PITCH_3D,
  BEARING_3D,
} from "../../mapbox-3d-config";
import MapView3DToggle from "../../components/MapView3DToggle";
import { isWebGLSupported } from "../../components/MapView3DToggle";
import { applyLinkedSpacesMapStyle } from "../../mapbox-linkedspaces-style";
import {
  drawCircularThumb,
  canvasToImageBitmap,
} from "../../mapbox-photo-marker-utils";
import type { SavedPlace } from "../mockData";

const DEBUG_MAP =
  typeof process !== "undefined" &&
  process.env.NODE_ENV === "development" &&
  typeof window !== "undefined" &&
  (window as unknown as { __DEBUG_MAP?: boolean }).__DEBUG_MAP;
/** Toggle in console: window.__DEBUG_MAP_INTERACTIONS = true */
function debugLog(...args: unknown[]) {
  if (
    typeof window !== "undefined" &&
    (window as unknown as { __DEBUG_MAP_INTERACTIONS?: boolean })
      .__DEBUG_MAP_INTERACTIONS
  ) {
    console.log("[PhotoMap]", ...args);
  }
}

const SOURCE_ID = "my-places-photos";
const CLUSTER_LAYER_ID = "my-places-clusters";
const CLUSTER_COUNT_LAYER_ID = "my-places-cluster-count";
const UNCLUSTERED_CIRCLE_LAYER_ID = "my-places-unclustered-circle";
const UNCLUSTERED_SYMBOL_LAYER_ID = "my-places-unclustered-symbol";

const CLUSTER_RADIUS = 50;
const CLUSTER_MAX_ZOOM = 14;
const ZOOM_EXTRA_ON_CLUSTER_CLICK = 3;
const DEFAULT_PIN_ID = "default-pin";
const THUMB_ZOOM_MIN = 6;
const THUMB_CACHE_MAX = 100;
const THUMB_BATCH_SIZE = 16;
const DEFAULT_CENTER: [number, number] = [-98.5795, 39.8283];
const DEFAULT_ZOOM = 2;

const DEFAULT_PIN_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#f97316" stroke="#fff" stroke-width="2"/></svg>',
  );

export interface PhotoMapProps {
  places: SavedPlace[];
  /** Single source of truth: which place is selected (list click). Drives marker highlight and camera flyTo. */
  activePlaceId?: string | null;
}

function buildGeoJSON(
  places: SavedPlace[],
): GeoJSON.FeatureCollection<GeoJSON.Point, Record<string, unknown>> {
  const features: GeoJSON.Feature<GeoJSON.Point, Record<string, unknown>>[] =
    [];
  let skipped = 0;
  for (const p of places) {
    const lat = p.lat;
    const lng = p.lng;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      skipped++;
      console.warn("[PhotoMap] Skipped place (invalid coords):", p.id, {
        lat,
        lng,
      });
      continue;
    }
    const id = p.id;
    if (id == null || String(id).trim() === "") {
      console.warn("[PhotoMap] Skipped place (missing id):", p.name);
      skipped++;
      continue;
    }
    const thumbnailUrl =
      p.thumbnailUrl && String(p.thumbnailUrl).trim()
        ? p.thumbnailUrl.trim()
        : null;
    features.push({
      type: "Feature",
      id,
      geometry: { type: "Point", coordinates: [lng, lat] },
      properties: {
        id,
        placeId: id,
        placeName: p.name ?? "",
        thumbnailUrl,
        thumbKey: thumbnailUrl ? `thumb:${p.id}` : DEFAULT_PIN_ID,
        createdAt: p.visitedDate ?? "",
        address: p.address ?? "",
      },
    });
  }
  if (DEBUG_MAP && skipped > 0)
    console.log("[PhotoMap] Skipped places (invalid coords):", skipped);
  return { type: "FeatureCollection", features };
}

function createThumbCache(max: number) {
  const order: string[] = [];
  const idToImageId = new Map<string, string>();
  return {
    get(id: string) {
      return idToImageId.get(id);
    },
    set(id: string, imageId: string) {
      if (idToImageId.has(id)) {
        order.splice(order.indexOf(id), 1);
      } else if (order.length >= max) {
        const evict = order.shift();
        if (evict) idToImageId.delete(evict);
      }
      idToImageId.set(id, imageId);
      order.push(id);
    },
    has(id: string) {
      return idToImageId.has(id);
    },
    imageIds(): string[] {
      return Array.from(idToImageId.values());
    },
  };
}

function ensureAbsoluteUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (typeof window !== "undefined" && url.startsWith("/"))
    return `${window.location.origin}${url}`;
  return url;
}

const FOCUS_ZOOM = 14;
const FLY_DURATION_MS = 800;

export default function PhotoMap({ places, activePlaceId }: PhotoMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const geoJsonRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const thumbCacheRef = useRef<ReturnType<typeof createThumbCache> | null>(
    null,
  );
  const moveEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [is3D, setIs3D] = useState(() => getPersisted3D());
  const is3DRef = useRef(is3D);
  is3DRef.current = is3D;
  const [mapReady, setMapReady] = useState(false);
  const webGLSupported = isWebGLSupported();

  const token =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      : undefined;

  const validPlaces = places.filter(
    (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng),
  );
  const geoJson = useRef(buildGeoJSON(validPlaces));
  geoJson.current = buildGeoJSON(validPlaces);

  const syncThumbnailsForViewport = useCallback((map: any) => {
    if (map.getZoom() < THUMB_ZOOM_MIN) return;
    const source = map.getSource(SOURCE_ID) as
      | { setData?: (d: GeoJSON.FeatureCollection) => void }
      | undefined;
    if (!source?.setData) return;
    const cache = thumbCacheRef.current;
    if (!cache) return;

    const unclustered = map.queryRenderedFeatures(undefined, {
      layers: [UNCLUSTERED_CIRCLE_LAYER_ID],
    }) as GeoJSON.Feature<GeoJSON.Point, Record<string, unknown>>[];
    const toLoad: { id: string; thumbKey: string; url: string }[] = [];
    for (const f of unclustered) {
      const p = f.properties ?? {};
      const id = String(p.id ?? "");
      const thumbKey = String(p.thumbKey ?? DEFAULT_PIN_ID);
      if (thumbKey === DEFAULT_PIN_ID || cache.has(id)) continue;
      if (map.hasImage(thumbKey)) continue;
      const url = p.thumbnailUrl;
      if (!url || typeof url !== "string" || !url.trim()) continue;
      toLoad.push({ id, thumbKey, url: url.trim() });
    }

    const batch = toLoad.slice(0, THUMB_BATCH_SIZE);
    for (const { id, thumbKey, url } of batch) {
      const absUrl = ensureAbsoluteUrl(url);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (!map.getSource(SOURCE_ID) || map.hasImage(thumbKey)) return;
        const addImageToMap = (
          image: HTMLImageElement | ImageBitmap | HTMLCanvasElement,
        ) => {
          try {
            map.addImage(thumbKey, image, { sdf: false });
          } catch (e) {
            if (DEBUG_MAP)
              console.error("[PhotoMap] addImage failed", thumbKey, e);
            setFallbackThumbKey(geoJsonRef, source, id);
            return;
          }
          cache.set(id, thumbKey);
          if (source?.setData) source.setData(geoJsonRef.current!);
          map.triggerRepaint();
          requestAnimationFrame(() => syncThumbnailsForViewport(map));
        };
        const canvas = drawCircularThumb(img);
        if (canvas instanceof HTMLCanvasElement) {
          canvasToImageBitmap(canvas).then((bitmap) => {
            if (!map.getSource(SOURCE_ID) || map.hasImage(thumbKey)) return;
            if (bitmap) addImageToMap(bitmap);
            else addImageToMap(img);
          });
        } else {
          addImageToMap(canvas as HTMLImageElement);
        }
      };
      img.onerror = () => {
        if (DEBUG_MAP) console.error("[PhotoMap] loadImage failed", absUrl);
        setFallbackThumbKey(geoJsonRef, source, id);
        if (source?.setData) source.setData(geoJsonRef.current!);
      };
      img.src = absUrl;
    }

    if (DEBUG_MAP) {
      const clusters = map.queryRenderedFeatures(undefined, {
        layers: [CLUSTER_LAYER_ID],
      }).length;
      console.log("[PhotoMap] health:", {
        pointsLoaded: geoJsonRef.current?.features?.length ?? 0,
        visibleUnclustered: unclustered.length,
        clustersOnScreen: clusters,
        zoom: map.getZoom().toFixed(2),
        bounds: map.getBounds().toArray(),
      });
    }
  }, []);

  function setFallbackThumbKey(
    ref: React.MutableRefObject<GeoJSON.FeatureCollection | null>,
    source: { setData?: (d: GeoJSON.FeatureCollection) => void },
    placeId: string,
  ) {
    const gj = ref.current;
    if (!gj) return;
    const next = {
      ...gj,
      features: gj.features.map((f) => {
        const prop = f.properties ?? {};
        if (String(prop.id) !== placeId) return f;
        return { ...f, properties: { ...prop, thumbKey: DEFAULT_PIN_ID } };
      }),
    };
    ref.current = next;
    if (source?.setData) source.setData(next);
  }

  useEffect(() => {
    if (!token || !containerRef.current) return;
    if (!token.trim()) {
      console.error(
        "[PhotoMap] Missing NEXT_PUBLIC_MAPBOX_TOKEN. Add it to .env.local and restart.",
      );
      return;
    }

    const container = containerRef.current;
    /** Wait for container to have non-zero size (avoids Mapbox init with 0x0 when loaded via dynamic import) */
    function runWhenReady(cb: () => void) {
      if (container.offsetWidth > 0 && container.offsetHeight > 0) {
        cb();
        return;
      }
      const ro = new ResizeObserver(() => {
        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
          ro.disconnect();
          cb();
        }
      });
      ro.observe(container);
      // Fallback: try after a short delay in case ResizeObserver doesn't fire
      const t = setTimeout(() => {
        ro.disconnect();
        cb();
      }, 500);
      return () => clearTimeout(t);
    }

    thumbCacheRef.current = createThumbCache(THUMB_CACHE_MAX);
    let map: any = null;
    let cancelRun: (() => void) | undefined;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxgl.accessToken = token;

      cancelRun = runWhenReady(() => {
        if (!containerRef.current) return;
        map = new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
        });
        mapRef.current = map;

        map.on("load", () => {
          applyLinkedSpacesMapStyle(map);
          // 3D buildings layer added before our marker layers so markers render on top
          add3DBuildingsLayer(map);
          const initial3D = getPersisted3D();
          if (initial3D) {
            map.setPitch(PITCH_3D);
            map.setBearing(BEARING_3D);
            update3DBuildingsVisibility(map, true);
          } else {
            set3DBuildingsVisibility(map, false);
          }
          map.on("zoomend", () => {
            update3DBuildingsVisibility(map, is3DRef.current);
          });
          setMapReady(true);
          map.resize();
          requestAnimationFrame(() => map.resize());
          const ro =
            containerRef.current &&
            new ResizeObserver(() => {
              if (mapRef.current) mapRef.current.resize();
            });
          if (ro && containerRef.current) ro.observe(containerRef.current);
          map.loadImage(
            DEFAULT_PIN_SVG,
            (
              err: Error | null,
              img: HTMLImageElement | ImageBitmap | undefined,
            ) => {
              if (!err && img && !map.hasImage(DEFAULT_PIN_ID))
                map.addImage(DEFAULT_PIN_ID, img, { sdf: false });
              geoJsonRef.current = geoJson.current;
              map.addSource(SOURCE_ID, {
                type: "geojson",
                data: geoJsonRef.current!,
                cluster: true,
                clusterRadius: CLUSTER_RADIUS,
                clusterMaxZoom: CLUSTER_MAX_ZOOM,
              });

              map.addLayer({
                id: CLUSTER_LAYER_ID,
                type: "circle",
                source: SOURCE_ID,
                filter: ["has", "point_count"],
                paint: {
                  "circle-color": "rgba(249, 115, 22, 0.75)",
                  "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    20,
                    10,
                    28,
                    25,
                    36,
                    50,
                    50,
                  ],
                  "circle-stroke-width": 2,
                  "circle-stroke-color": "#fff",
                },
              });
              map.addLayer({
                id: CLUSTER_COUNT_LAYER_ID,
                type: "symbol",
                source: SOURCE_ID,
                filter: ["has", "point_count"],
                layout: {
                  "text-field": ["get", "point_count_abbreviated"],
                  "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                  "text-size": 13,
                },
                paint: { "text-color": "#fff" },
              });
              map.addLayer({
                id: UNCLUSTERED_CIRCLE_LAYER_ID,
                type: "circle",
                source: SOURCE_ID,
                filter: ["!", ["has", "point_count"]],
                paint: {
                  "circle-color": [
                    "case",
                    ["boolean", ["feature-state", "active"], false],
                    "rgba(234, 88, 12, 1)",
                    "rgba(249, 115, 22, 0.9)",
                  ],
                  "circle-radius": [
                    "case",
                    ["boolean", ["feature-state", "active"], false],
                    16,
                    12,
                  ],
                  "circle-stroke-width": [
                    "case",
                    ["boolean", ["feature-state", "active"], false],
                    3,
                    2,
                  ],
                  "circle-stroke-color": "#fff",
                },
              });
              map.addLayer({
                id: UNCLUSTERED_SYMBOL_LAYER_ID,
                type: "symbol",
                source: SOURCE_ID,
                filter: ["!", ["has", "point_count"]],
                layout: {
                  "icon-image": [
                    "coalesce",
                    ["get", "thumbKey"],
                    DEFAULT_PIN_ID,
                  ],
                  "icon-size": 0.65,
                  "icon-allow-overlap": true,
                  "icon-ignore-placement": true,
                },
              });

              let initialFitDone = false;
              const fitBoundsOnce = () => {
                if (initialFitDone) return;
                const d = geoJsonRef.current?.features?.length;
                if (!d || d === 0) return;
                initialFitDone = true;
                const bounds = new mapboxgl.LngLatBounds();
                geoJsonRef.current!.features.forEach(
                  (f: GeoJSON.Feature<GeoJSON.Point>) => {
                    const c = f.geometry?.coordinates;
                    if (c && c.length >= 2) bounds.extend([c[0], c[1]]);
                  },
                );
                map.fitBounds(bounds, {
                  padding: 60,
                  maxZoom: 12,
                  duration: 0,
                });
              };

              map.on(
                "data",
                (e: { sourceId?: string; isSourceLoaded?: boolean }) => {
                  if (e.sourceId === SOURCE_ID && e.isSourceLoaded) {
                    fitBoundsOnce();
                    setTimeout(() => syncThumbnailsForViewport(map), 300);
                  }
                },
              );

              const onMoveEnd = () => {
                if (moveEndTimeoutRef.current)
                  clearTimeout(moveEndTimeoutRef.current);
                moveEndTimeoutRef.current = setTimeout(() => {
                  moveEndTimeoutRef.current = null;
                  syncThumbnailsForViewport(map);
                }, 150);
              };
              map.on("moveend", onMoveEnd);
              map.on("zoomend", onMoveEnd);

              const onClusterClick = (e: any) => {
                e.originalEvent?.stopPropagation();
                const source = map.getSource(SOURCE_ID);
                if (
                  !source ||
                  typeof source.getClusterExpansionZoom !== "function"
                )
                  return;
                // Query both cluster layers so click on circle OR count label triggers zoom
                const features = map.queryRenderedFeatures(e.point, {
                  layers: [CLUSTER_LAYER_ID, CLUSTER_COUNT_LAYER_ID],
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
                      zoom: Math.min(zoom + ZOOM_EXTRA_ON_CLUSTER_CLICK, 18),
                      duration: 350,
                    });
                  },
                );
              };
              map.on("click", CLUSTER_LAYER_ID, onClusterClick);
              map.on("click", CLUSTER_COUNT_LAYER_ID, onClusterClick);

              map.getCanvas().style.cursor = "default";
              map.on("mouseenter", CLUSTER_LAYER_ID, () => {
                map.getCanvas().style.cursor = "pointer";
              });
              map.on("mouseleave", CLUSTER_LAYER_ID, () => {
                map.getCanvas().style.cursor = "default";
              });
              map.on("mouseenter", CLUSTER_COUNT_LAYER_ID, () => {
                map.getCanvas().style.cursor = "pointer";
              });
              map.on("mouseleave", CLUSTER_COUNT_LAYER_ID, () => {
                map.getCanvas().style.cursor = "default";
              });
              map.on("mouseenter", UNCLUSTERED_CIRCLE_LAYER_ID, () => {
                map.getCanvas().style.cursor = "pointer";
              });
              map.on("mouseleave", UNCLUSTERED_CIRCLE_LAYER_ID, () => {
                map.getCanvas().style.cursor = "default";
              });
            },
          );
        });
      }); // close runWhenReady callback
    })();

    return () => {
      if (moveEndTimeoutRef.current) clearTimeout(moveEndTimeoutRef.current);
      if (map) {
        try {
          const cache = thumbCacheRef.current;
          if (cache)
            cache.imageIds().forEach((id) => {
              try {
                if (map.hasImage(id)) map.removeImage(id);
              } catch {}
            });
          [
            UNCLUSTERED_SYMBOL_LAYER_ID,
            UNCLUSTERED_CIRCLE_LAYER_ID,
            CLUSTER_COUNT_LAYER_ID,
            CLUSTER_LAYER_ID,
          ].forEach((id) => {
            try {
              if (map.getLayer(id)) map.removeLayer(id);
            } catch {}
          });
          if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
          if (map.hasImage(DEFAULT_PIN_ID)) map.removeImage(DEFAULT_PIN_ID);
        } catch {}
        map.remove();
      }
      mapRef.current = null;
      geoJsonRef.current = null;
      thumbCacheRef.current = null;
      setMapReady(false);
    };
  }, [token, syncThumbnailsForViewport]);

  const previousActivePlaceIdRef = useRef<string | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    const source = map?.getSource(SOURCE_ID) as
      | { setData?: (d: GeoJSON.FeatureCollection) => void }
      | undefined;
    if (!source?.setData) return;
    geoJsonRef.current = geoJson.current;
    source.setData(geoJsonRef.current!);
    if (DEBUG_MAP)
      console.log(
        "[PhotoMap] setData: points =",
        geoJson.current.features.length,
      );
    const markerIds = geoJson.current.features.map(
      (f) =>
        (f as GeoJSON.Feature & { id?: string }).id ??
        (f.properties as Record<string, unknown>)?.id,
    );
    debugLog("setData: marker ids =", markerIds);
    if (activePlaceId && map) {
      try {
        map.setFeatureState(
          { source: SOURCE_ID, id: activePlaceId },
          { active: true },
        );
        previousActivePlaceIdRef.current = activePlaceId;
      } catch (_) {}
    }
  }, [validPlaces.length, places, activePlaceId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      pitch: is3D ? PITCH_3D : 0,
      bearing: is3D ? BEARING_3D : 0,
      duration: 500,
    });
    update3DBuildingsVisibility(map, is3D);
  }, [is3D]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const setFeatureActive = (placeId: string | null, active: boolean) => {
      if (!placeId) return;
      try {
        map.setFeatureState({ source: SOURCE_ID, id: placeId }, { active });
        debugLog("setFeatureState", placeId, { active });
      } catch (e) {
        debugLog("setFeatureState failed", placeId, e);
      }
    };

    const prev = previousActivePlaceIdRef.current;
    if (prev && prev !== activePlaceId) setFeatureActive(prev, false);
    if (activePlaceId) setFeatureActive(activePlaceId, true);
    previousActivePlaceIdRef.current = activePlaceId;

    if (!activePlaceId) return;
    const place = validPlaces.find((p) => p.id === activePlaceId);
    if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lng))
      return;
    debugLog(
      "flyTo",
      activePlaceId,
      [place.lng, place.lat],
      "zoom",
      FOCUS_ZOOM,
    );
    map.flyTo({
      center: [place.lng, place.lat],
      zoom: FOCUS_ZOOM,
      duration: FLY_DURATION_MS / 1000,
      essential: true,
    });
  }, [activePlaceId, validPlaces]);

  const handle3DToggle = useCallback(() => {
    const next = !is3D;
    setPersisted3D(next);
    setIs3D(next);
    // Apply camera and 3D layer immediately on click so toggle works even if map wasn't passed to child
    const m = mapRef.current;
    if (m) {
      m.easeTo({
        pitch: next ? PITCH_3D : 0,
        bearing: next ? BEARING_3D : 0,
        duration: 500,
      });
      update3DBuildingsVisibility(m, next);
    }
  }, [is3D]);

  if (!token) {
    return (
      <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-500">
        Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local to show the map.
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl border border-gray-200">
      <div ref={containerRef} className="h-full w-full" />
      <div className="absolute right-3 top-3 z-10">
        <MapView3DToggle
          is3D={is3D}
          onToggle={handle3DToggle}
          map={mapReady ? mapRef.current : undefined}
          disabled={!webGLSupported}
        />
      </div>
      <div className="absolute bottom-3 left-3 rounded-lg border border-gray-200 bg-white/95 px-3 py-1.5 text-sm text-gray-700 shadow-sm">
        {validPlaces.length} {validPlaces.length === 1 ? "place" : "places"} on
        map
      </div>
    </div>
  );
}
