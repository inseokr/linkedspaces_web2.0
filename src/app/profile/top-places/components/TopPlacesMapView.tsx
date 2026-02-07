"use client";

/**
 * Top Places full-screen Mapbox map: GeoJSON source, clustering, popup on point click.
 * 3D buildings + 2D/3D toggle; photo-based markers for clusters and unclustered points.
 *
 * Step 1 – Audit: Why photos might not have shown before
 * - Cluster icon uses dynamic image id (cluster-${cluster_id}); images are added async on moveend/zoomend,
 *   so clusters show default pin until syncClusterThumbnails runs and addImage completes.
 * - Unclustered thumbnails only sync when zoom >= THUMB_ZOOM_MIN (6); below that, only default pin.
 * - GeoJSON has imageUrl/thumbKey per feature; cluster representative was "first leaf" only (no visitedTime).
 * - Cluster circle was fully opaque, so the orange circle dominated over the photo symbol.
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
import MapZoomControls from "../../components/MapZoomControls";
import { applyLinkedSpacesMapStyle } from "../../mapbox-linkedspaces-style";
import TopPlacesMapStrip from "./TopPlacesMapStrip";
import {
  drawCircularThumb,
  canvasToImageBitmap,
} from "../../mapbox-photo-marker-utils";
import type { TopPlaceCardModel } from "../types";

const DEBUG_MAP =
  typeof process !== "undefined" &&
  process.env.NODE_ENV === "development" &&
  typeof window !== "undefined" &&
  (window as unknown as { __DEBUG_TOP_PLACES_MAP?: boolean })
    .__DEBUG_TOP_PLACES_MAP;

const SOURCE_ID = "top-places-points";
const CLUSTER_LAYER_ID = "top-places-clusters";
const CLUSTER_SYMBOL_LAYER_ID = "top-places-clusters-symbol";
const CLUSTER_COUNT_LAYER_ID = "top-places-cluster-count";
const UNCLUSTERED_LAYER_ID = "top-places-unclustered";
const UNCLUSTERED_SYMBOL_LAYER_ID = "top-places-unclustered-symbol";

const CLUSTER_RADIUS = 50;
const CLUSTER_MAX_ZOOM = 14;
const ZOOM_EXTRA_ON_CLUSTER_CLICK = 3;
const DEFAULT_PIN_ID = "top-places-default-pin";
const THUMB_ZOOM_MIN = 6;
const THUMB_CACHE_MAX = 100;
const THUMB_BATCH_SIZE = 40;
const THUMB_SYNC_THROTTLE_MS = 180;
const CLUSTER_ICON_CACHE_MAX = 50;
const CLUSTER_ICON_BATCH_SIZE = 20;
const CLUSTER_LEAVES_FOR_REP = 25;

const DEFAULT_PIN_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#f97316" stroke="#fff" stroke-width="2"/></svg>',
  );
const MAX_ZOOM_CLUSTER = 20;
const DEFAULT_CENTER: [number, number] = [-98.5795, 39.8283];
const DEFAULT_ZOOM = 2;
const FIT_PADDING = 60;
const FIT_MAX_ZOOM = 14;

function escapeHtml(s: string): string {
  const el = document.createElement("div");
  el.textContent = s;
  return el.innerHTML;
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

interface PlaceFeatureProps {
  id: string;
  name: string;
  imageUrl: string;
  thumbKey: string;
}

function buildGeoJSON(
  places: TopPlaceCardModel[],
): GeoJSON.FeatureCollection<GeoJSON.Point, PlaceFeatureProps> {
  const features: GeoJSON.Feature<GeoJSON.Point, PlaceFeatureProps>[] = [];
  for (const p of places) {
    const lat = p.latitude;
    const lng = p.longitude;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const imageUrl =
      p.imageUrl && String(p.imageUrl).trim() ? p.imageUrl.trim() : "";
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [lng, lat] },
      properties: {
        id: p.id,
        name: p.title || "Unnamed place",
        imageUrl,
        thumbKey: imageUrl ? `thumb:${p.id}` : DEFAULT_PIN_ID,
      },
    });
  }
  return { type: "FeatureCollection", features };
}

function ensureAbsoluteUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (typeof window !== "undefined" && url.startsWith("/"))
    return `${window.location.origin}${url}`;
  return url;
}

function createThumbCache(max: number) {
  const order: string[] = [];
  const idToImageId = new Map<string, string>();
  return {
    get(id: string) {
      return idToImageId.get(id);
    },
    set(id: string, imageId: string) {
      if (idToImageId.has(id)) order.splice(order.indexOf(id), 1);
      else if (order.length >= max) {
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

/** LRU cache for cluster icon image ids (cluster_id -> map image id). Evicts oldest when full. */
function createClusterIconCache(max: number) {
  const order: number[] = [];
  const idToImageId = new Map<number, string>();
  return {
    get(clusterId: number) {
      return idToImageId.get(clusterId);
    },
    set(clusterId: number, imageId: string) {
      if (idToImageId.has(clusterId)) {
        order.splice(order.indexOf(clusterId), 1);
      } else if (order.length >= max) {
        const evict = order.shift();
        if (evict != null) idToImageId.delete(evict);
      }
      idToImageId.set(clusterId, imageId);
      order.push(clusterId);
    },
    has(clusterId: number) {
      return idToImageId.has(clusterId);
    },
    imageIds(): string[] {
      return Array.from(idToImageId.values());
    },
  };
}

/** Throttle fn to at most once per `ms`. Used for viewport-based sync to avoid jank with 500+ points. */
function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const run = (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    } else if (timer == null) {
      timer = setTimeout(
        () => {
          timer = null;
          last = Date.now();
          fn(...args);
        },
        ms - (now - last),
      );
    }
  };
  return run as T;
}

const SELECTED_PIN_LAYER_ID = "top-places-selected-pin";

export interface TopPlacesMapViewProps {
  /** Filtered places (with valid lat/lng used for map; others skipped) */
  places: TopPlaceCardModel[];
  /** For DEBUG: current filter labels */
  activeCountryId?: string | null;
  activeCategory?: string | "All";
  /** Currently selected place id; map centers on it and highlights its pin */
  selectedPlaceId?: string | null;
  /** Called when user clicks a place pin on the map */
  onPlaceSelect?: (placeId: string) => void;
}

export default function TopPlacesMapView({
  places,
  activeCountryId,
  activeCategory,
  selectedPlaceId = null,
  onPlaceSelect,
}: TopPlacesMapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const mapboxglRef = useRef<any>(null);
  const popupRef = useRef<any>(null);
  const selectedPlaceIdRef = useRef<string | null>(selectedPlaceId);
  selectedPlaceIdRef.current = selectedPlaceId;
  const onPlaceSelectRef = useRef(onPlaceSelect);
  onPlaceSelectRef.current = onPlaceSelect;
  const geoJsonRef = useRef<GeoJSON.FeatureCollection<
    GeoJSON.Point,
    PlaceFeatureProps
  > | null>(null);
  const thumbCacheRef = useRef<ReturnType<typeof createThumbCache> | null>(
    null,
  );
  const clusterCacheRef = useRef<ReturnType<
    typeof createClusterIconCache
  > | null>(null);
  const loadingClustersRef = useRef<Set<number>>(new Set());
  const initialFitDoneRef = useRef(false);
  const [is3D, setIs3D] = useState(() => getPersisted3D());
  const is3DRef = useRef(is3D);
  is3DRef.current = is3D;
  const webGLSupported = isWebGLSupported();

  const token =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      : undefined;

  const placesWithCoords = places.filter(
    (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude),
  );
  const geoJson = useRef(buildGeoJSON(placesWithCoords));
  geoJson.current = buildGeoJSON(placesWithCoords);

  const logDebug = useCallback(
    (map: any, extra?: Record<string, unknown>) => {
      if (!DEBUG_MAP || !map) return;
      const unclustered = map.queryRenderedFeatures(undefined, {
        layers: [UNCLUSTERED_LAYER_ID],
      }).length;
      console.log("[TopPlacesMapView]", {
        pointsLoaded: geoJsonRef.current?.features?.length ?? 0,
        visibleUnclustered: unclustered,
        zoom: map.getZoom().toFixed(2),
        selectedCountry: activeCountryId ?? "all",
        selectedCategory: activeCategory ?? "All",
        ...extra,
      });
    },
    [activeCountryId, activeCategory],
  );

  const setFallbackThumbKey = useCallback(
    (
      ref: typeof geoJsonRef,
      source: { setData?: (d: GeoJSON.FeatureCollection) => void },
      placeId: string,
    ) => {
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
    },
    [],
  );

  /** Viewport-based unclustered thumbnails. Capped to THUMB_BATCH_SIZE (40) per moveend/zoomend. */
  const syncThumbnailsForViewport = useCallback(
    (map: any) => {
      if (map.getZoom() < THUMB_ZOOM_MIN) return;
      const source = map.getSource(SOURCE_ID) as
        | { setData?: (d: GeoJSON.FeatureCollection) => void }
        | undefined;
      if (!source?.setData) return;
      const cache = thumbCacheRef.current;
      if (!cache) return;
      const unclustered = map.queryRenderedFeatures(undefined, {
        layers: [UNCLUSTERED_LAYER_ID],
      }) as GeoJSON.Feature<GeoJSON.Point, PlaceFeatureProps>[];
      const toLoad: { id: string; thumbKey: string; url: string }[] = [];
      for (const f of unclustered) {
        const p = f.properties ?? {};
        const id = String(p.id ?? "");
        const thumbKey = String(p.thumbKey ?? DEFAULT_PIN_ID);
        if (thumbKey === DEFAULT_PIN_ID || cache.has(id)) continue;
        if (map.hasImage(thumbKey)) continue;
        const url = p.imageUrl;
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
                console.error(
                  "[TopPlacesMapView] addImage failed",
                  thumbKey,
                  e,
                );
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
          if (DEBUG_MAP)
            console.error("[TopPlacesMapView] loadImage failed", absUrl);
          setFallbackThumbKey(geoJsonRef, source, id);
          if (source?.setData) source.setData(geoJsonRef.current!);
        };
        img.src = absUrl;
      }
    },
    [setFallbackThumbKey],
  );

  /** Load representative thumbnail for visible clusters. Pick most recent by visitedTime, else first leaf with imageUrl. Viewport-only, batched. */
  const syncClusterThumbnails = useCallback((map: any) => {
    const source = map.getSource(SOURCE_ID) as
      | {
          getClusterLeaves?: (
            id: number,
            limit: number,
            offset: number,
            cb: (
              err: Error | null,
              features: GeoJSON.Feature<GeoJSON.Point, PlaceFeatureProps>[],
            ) => void,
          ) => void;
        }
      | undefined;
    if (!source?.getClusterLeaves) return;
    const cache = clusterCacheRef.current;
    if (!cache) return;
    const loading = loadingClustersRef.current;
    let features: GeoJSON.Feature<GeoJSON.Point, PlaceFeatureProps>[];
    try {
      features = map.queryRenderedFeatures(undefined, {
        layers: [CLUSTER_LAYER_ID],
      }) as GeoJSON.Feature<GeoJSON.Point, PlaceFeatureProps>[];
    } catch {
      return;
    }
    const toLoad: number[] = [];
    for (const f of features) {
      const clusterId = f.properties?.cluster_id;
      if (clusterId == null || typeof clusterId !== "number") continue;
      const imageId = `cluster-${clusterId}`;
      if (
        map.hasImage(imageId) ||
        cache.has(clusterId) ||
        loading.has(clusterId)
      )
        continue;
      toLoad.push(clusterId);
    }
    const batch = toLoad.slice(0, CLUSTER_ICON_BATCH_SIZE);
    for (const clusterId of batch) {
      loading.add(clusterId);
      source.getClusterLeaves!(
        clusterId,
        CLUSTER_LEAVES_FOR_REP,
        0,
        (
          err: Error | null,
          leaves: GeoJSON.Feature<GeoJSON.Point, PlaceFeatureProps>[],
        ) => {
          loading.delete(clusterId);
          if (err || !leaves?.length || !map.getSource(SOURCE_ID)) return;
          const withUrl = leaves.filter(
            (l) =>
              (l.properties as PlaceFeatureProps)?.imageUrl &&
              String((l.properties as PlaceFeatureProps).imageUrl).trim(),
          );
          const byTime = [...withUrl].sort((a, b) => {
            const ta = (a.properties as PlaceFeatureProps)?.visitedTime ?? "";
            const tb = (b.properties as PlaceFeatureProps)?.visitedTime ?? "";
            return tb.localeCompare(ta);
          });
          const leaf = byTime[0] ?? withUrl[0] ?? leaves[0];
          const props = leaf.properties as PlaceFeatureProps | undefined;
          const imageUrl = props?.imageUrl;
          if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim())
            return;
          const absUrl = ensureAbsoluteUrl(imageUrl.trim());
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            if (
              !map.getSource(SOURCE_ID) ||
              map.hasImage(`cluster-${clusterId}`)
            )
              return;
            const addImageToMap = (
              image: HTMLImageElement | ImageBitmap | HTMLCanvasElement,
            ) => {
              try {
                map.addImage(`cluster-${clusterId}`, image, { sdf: false });
                cache.set(clusterId, `cluster-${clusterId}`);
                map.triggerRepaint();
              } catch (e) {
                if (DEBUG_MAP)
                  console.error(
                    "[TopPlacesMapView] cluster addImage failed",
                    clusterId,
                    e,
                  );
              }
            };
            const canvas = drawCircularThumb(img);
            if (canvas instanceof HTMLCanvasElement) {
              canvasToImageBitmap(canvas).then((bitmap) => {
                if (
                  !map.getSource(SOURCE_ID) ||
                  map.hasImage(`cluster-${clusterId}`)
                )
                  return;
                if (bitmap) addImageToMap(bitmap);
                else addImageToMap(img);
              });
            } else {
              addImageToMap(canvas as HTMLImageElement);
            }
          };
          img.onerror = () => {
            if (DEBUG_MAP)
              console.error(
                "[TopPlacesMapView] cluster loadImage failed",
                absUrl,
              );
          };
          img.src = absUrl;
        },
      );
    }
  }, []);

  useEffect(() => {
    if (!token || !containerRef.current) return;
    if (!token.trim()) {
      console.error(
        "[TopPlacesMapView] Missing NEXT_PUBLIC_MAPBOX_TOKEN. Add it to .env.local and restart.",
      );
      return;
    }

    let map: any = null;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxglRef.current = mapboxgl;
      mapboxgl.accessToken = token;
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
        map.resize();
        requestAnimationFrame(() => map.resize());
        const ro =
          containerRef.current &&
          new ResizeObserver(() => {
            if (mapRef.current) mapRef.current.resize();
          });
        if (ro && containerRef.current) ro.observe(containerRef.current);

        thumbCacheRef.current = createThumbCache(THUMB_CACHE_MAX);
        clusterCacheRef.current = createClusterIconCache(
          CLUSTER_ICON_CACHE_MAX,
        );
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

            /* Marker layers added after 3D buildings so they render above fill-extrusion. */
            map.addLayer({
              id: CLUSTER_LAYER_ID,
              type: "circle",
              source: SOURCE_ID,
              filter: ["has", "point_count"],
              paint: {
                "circle-color": "rgba(249, 115, 22, 0.75)",
                "circle-opacity": 0.5,
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
            // Cluster photo: representative thumbnail (first leaf). Fallback to default pin when not yet loaded.
            map.addLayer(
              {
                id: CLUSTER_SYMBOL_LAYER_ID,
                type: "symbol",
                source: SOURCE_ID,
                filter: ["has", "point_count"],
                layout: {
                  "icon-image": [
                    "coalesce",
                    [
                      "image",
                      [
                        "concat",
                        "cluster-",
                        ["to-string", ["get", "cluster_id"]],
                      ],
                    ],
                    DEFAULT_PIN_ID,
                  ],
                  "icon-size": 0.6,
                  "icon-allow-overlap": true,
                  "icon-ignore-placement": true,
                },
              },
              CLUSTER_COUNT_LAYER_ID,
            );
            map.addLayer({
              id: CLUSTER_COUNT_LAYER_ID,
              type: "symbol",
              source: SOURCE_ID,
              filter: ["has", "point_count"],
              layout: {
                "text-field": ["get", "point_count_abbreviated"],
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 12,
                "text-offset": [0.4, -0.4],
              },
              paint: {
                "text-color": "#fff",
                "text-halo-color": "rgba(0,0,0,0.6)",
                "text-halo-width": 1,
              },
            });
            map.addLayer({
              id: UNCLUSTERED_LAYER_ID,
              type: "circle",
              source: SOURCE_ID,
              filter: ["!", ["has", "point_count"]],
              paint: {
                "circle-color": "rgba(249, 115, 22, 0.9)",
                "circle-radius": 12,
                "circle-stroke-width": 2,
                "circle-stroke-color": "#fff",
              },
            });
            map.addLayer({
              id: SELECTED_PIN_LAYER_ID,
              type: "circle",
              source: SOURCE_ID,
              filter: ["==", ["get", "id"], selectedPlaceIdRef.current ?? ""],
              paint: {
                "circle-radius": 20,
                "circle-opacity": 0,
                "circle-stroke-width": 3,
                "circle-stroke-color": "#fff",
                "circle-stroke-opacity": 1,
              },
            });
            map.addLayer({
              id: UNCLUSTERED_SYMBOL_LAYER_ID,
              type: "symbol",
              source: SOURCE_ID,
              filter: ["!", ["has", "point_count"]],
              layout: {
                "icon-image": ["coalesce", ["get", "thumbKey"], DEFAULT_PIN_ID],
                "icon-size": 0.65,
                "icon-allow-overlap": true,
                "icon-ignore-placement": true,
              },
            });
            map.addLayer({
              id: "top-places-unclustered-name",
              type: "symbol",
              source: SOURCE_ID,
              filter: ["!", ["has", "point_count"]],
              layout: {
                "text-field": ["get", "name"],
                "text-font": [
                  "DIN Offc Pro Medium",
                  "Arial Unicode MS Regular",
                ],
                "text-size": 11,
                "text-anchor": "top",
                "text-offset": [0, 1.35],
                "text-max-width": 10,
                "text-allow-overlap": false,
              },
              paint: {
                "text-color": "#fff",
                "text-halo-color": "rgba(0,0,0,0.75)",
                "text-halo-width": 1.5,
              },
            });

            /** Anchor map to selected place or Top Places result #1. */
            const fitBoundsOnce = () => {
              if (initialFitDoneRef.current) return;
              const features = geoJsonRef.current?.features;
              if (!features?.length) return;
              initialFitDoneRef.current = true;
              const sid = selectedPlaceIdRef.current;
              let target: GeoJSON.Feature<GeoJSON.Point> | undefined;
              if (sid) {
                target = features.find(
                  (f: GeoJSON.Feature<GeoJSON.Point>) =>
                    (f.properties as PlaceFeatureProps)?.id === sid,
                ) as GeoJSON.Feature<GeoJSON.Point> | undefined;
              }
              if (!target)
                target = features[0] as GeoJSON.Feature<GeoJSON.Point>;
              const c = target?.geometry?.coordinates;
              if (c && c.length >= 2) {
                const [lng, lat] = c;
                map.flyTo({
                  center: [lng, lat],
                  zoom: FIT_MAX_ZOOM,
                  duration: 0,
                });
              } else {
                const bounds = new mapboxgl.LngLatBounds();
                features.forEach((f: GeoJSON.Feature<GeoJSON.Point>) => {
                  const coords = f.geometry?.coordinates;
                  if (coords && coords.length >= 2)
                    bounds.extend([coords[0], coords[1]]);
                });
                map.fitBounds(bounds, {
                  padding: FIT_PADDING,
                  maxZoom: FIT_MAX_ZOOM,
                  duration: 0,
                });
              }
            };

            const throttledSync = throttle(() => {
              syncThumbnailsForViewport(map);
              syncClusterThumbnails(map);
              logDebug(map);
            }, THUMB_SYNC_THROTTLE_MS);

            map.on(
              "data",
              (e: { sourceId?: string; isSourceLoaded?: boolean }) => {
                if (e.sourceId === SOURCE_ID && e.isSourceLoaded) {
                  fitBoundsOnce();
                  setTimeout(() => throttledSync(), 300);
                }
              },
            );

            map.on("moveend", throttledSync);
            map.on("zoomend", throttledSync);

            const onClusterClick = (e: any) => {
              e.originalEvent?.stopPropagation();
              const source = map.getSource(SOURCE_ID);
              if (
                !source ||
                typeof source.getClusterExpansionZoom !== "function"
              )
                return;
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
                    zoom: Math.min(
                      zoom + ZOOM_EXTRA_ON_CLUSTER_CLICK,
                      MAX_ZOOM_CLUSTER,
                    ),
                    duration: 350,
                  });
                },
              );
            };
            map.on("click", CLUSTER_LAYER_ID, onClusterClick);
            map.on("click", CLUSTER_SYMBOL_LAYER_ID, onClusterClick);
            map.on("click", CLUSTER_COUNT_LAYER_ID, onClusterClick);

            const onUnclusteredClick = (e: any) => {
              e.originalEvent?.stopPropagation();
              const feat = e.features?.[0];
              if (!feat?.geometry?.coordinates?.length) return;
              const props = feat.properties as PlaceFeatureProps;
              const placeId = String(props.id ?? "");
              if (onPlaceSelectRef.current && placeId) {
                onPlaceSelectRef.current(placeId);
                return;
              }
              const [lng, lat] = feat.geometry.coordinates;
              if (popupRef.current) popupRef.current.remove();
              const thumbUrl = props.imageUrl
                ? ensureAbsoluteUrl(props.imageUrl)
                : "";
              const imgHtml = thumbUrl
                ? `<img src="${escapeAttr(thumbUrl)}" alt="" loading="lazy" style="width:120px;height:80px;object-fit:cover;border-radius:6px;display:block;margin-bottom:6px;" />`
                : "";
              const popup = new mapboxgl.Popup({
                closeButton: true,
                closeOnClick: false,
              })
                .setLngLat([lng, lat])
                .setHTML(
                  `<div style="max-width:200px;padding:4px 0;">
                <div style="font-weight:600;font-size:14px;margin-bottom:6px;color:#111;">${escapeHtml(props.name || "Place")}</div>
                ${imgHtml}
                <a href="/profile/top-places" style="display:inline-block;font-size:13px;color:var(--color-main,#2563eb);font-weight:500;">View place</a>
              </div>`,
                )
                .addTo(map);
              popupRef.current = popup;
            };
            map.on("click", UNCLUSTERED_LAYER_ID, onUnclusteredClick);
            map.on("click", UNCLUSTERED_SYMBOL_LAYER_ID, onUnclusteredClick);
            map.on("click", "top-places-unclustered-name", onUnclusteredClick);

            map.getCanvas().style.cursor = "default";
            map.on(
              "mouseenter",
              CLUSTER_LAYER_ID,
              () => (map.getCanvas().style.cursor = "pointer"),
            );
            map.on(
              "mouseleave",
              CLUSTER_LAYER_ID,
              () => (map.getCanvas().style.cursor = "default"),
            );
            map.on(
              "mouseenter",
              CLUSTER_SYMBOL_LAYER_ID,
              () => (map.getCanvas().style.cursor = "pointer"),
            );
            map.on(
              "mouseleave",
              CLUSTER_SYMBOL_LAYER_ID,
              () => (map.getCanvas().style.cursor = "default"),
            );
            map.on(
              "mouseenter",
              CLUSTER_COUNT_LAYER_ID,
              () => (map.getCanvas().style.cursor = "pointer"),
            );
            map.on(
              "mouseleave",
              CLUSTER_COUNT_LAYER_ID,
              () => (map.getCanvas().style.cursor = "default"),
            );
            map.on(
              "mouseenter",
              UNCLUSTERED_LAYER_ID,
              () => (map.getCanvas().style.cursor = "pointer"),
            );
            map.on(
              "mouseleave",
              UNCLUSTERED_LAYER_ID,
              () => (map.getCanvas().style.cursor = "default"),
            );
            map.on(
              "mouseenter",
              UNCLUSTERED_SYMBOL_LAYER_ID,
              () => (map.getCanvas().style.cursor = "pointer"),
            );
            map.on(
              "mouseleave",
              UNCLUSTERED_SYMBOL_LAYER_ID,
              () => (map.getCanvas().style.cursor = "default"),
            );
            map.on(
              "mouseenter",
              "top-places-unclustered-name",
              () => (map.getCanvas().style.cursor = "pointer"),
            );
            map.on(
              "mouseleave",
              "top-places-unclustered-name",
              () => (map.getCanvas().style.cursor = "default"),
            );
          },
        ); // end loadImage callback
      }); // end map.on("load")
    })();

    return () => {
      if (popupRef.current) {
        try {
          popupRef.current.remove();
        } catch {}
        popupRef.current = null;
      }
      if (map) {
        try {
          const cache = thumbCacheRef.current;
          if (cache)
            cache.imageIds().forEach((id) => {
              try {
                if (map.hasImage(id)) map.removeImage(id);
              } catch {}
            });
          const clusterCache = clusterCacheRef.current;
          if (clusterCache)
            clusterCache.imageIds().forEach((id) => {
              try {
                if (map.hasImage(id)) map.removeImage(id);
              } catch {}
            });
          [
            SELECTED_PIN_LAYER_ID,
            "top-places-unclustered-name",
            UNCLUSTERED_SYMBOL_LAYER_ID,
            UNCLUSTERED_LAYER_ID,
            CLUSTER_COUNT_LAYER_ID,
            CLUSTER_SYMBOL_LAYER_ID,
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
      mapboxglRef.current = null;
      geoJsonRef.current = null;
      thumbCacheRef.current = null;
      clusterCacheRef.current = null;
      loadingClustersRef.current = new Set();
      initialFitDoneRef.current = false;
    };
  }, [token, logDebug, syncThumbnailsForViewport, syncClusterThumbnails]);

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
    const source = map?.getSource(SOURCE_ID) as
      | { setData?: (d: GeoJSON.FeatureCollection) => void }
      | undefined;
    if (!source?.setData) return;
    const data = geoJson.current;
    geoJsonRef.current = data;
    source.setData(data);
    if (DEBUG_MAP)
      console.log("[TopPlacesMapView] setData: points =", data.features.length);
    logDebug(map);
    // Update selected-pin highlight filter when data or selection changes
    if (map.getLayer(SELECTED_PIN_LAYER_ID)) {
      map.setFilter(SELECTED_PIN_LAYER_ID, [
        "==",
        ["get", "id"],
        selectedPlaceId ?? "",
      ]);
    }
    // Anchor to selected place or #1 when data changes (e.g. filter change)
    if (data.features.length > 0) {
      const sid = selectedPlaceId;
      let target = data.features[0] as GeoJSON.Feature<GeoJSON.Point>;
      if (sid) {
        const found = data.features.find(
          (f: GeoJSON.Feature<GeoJSON.Point>) =>
            (f.properties as PlaceFeatureProps)?.id === sid,
        );
        if (found) target = found as GeoJSON.Feature<GeoJSON.Point>;
      }
      const c = target?.geometry?.coordinates;
      if (c && c.length >= 2) {
        const [lng, lat] = c;
        map.flyTo({
          center: [lng, lat],
          zoom: FIT_MAX_ZOOM,
          duration: 600,
        });
      }
    }
  }, [placesWithCoords.length, places, selectedPlaceId, logDebug]);

  // When selectedPlaceId changes, update highlight filter (flyTo is handled in the places/source effect above)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer(SELECTED_PIN_LAYER_ID)) return;
    map.setFilter(SELECTED_PIN_LAYER_ID, [
      "==",
      ["get", "id"],
      selectedPlaceId ?? "",
    ]);
  }, [selectedPlaceId]);

  const hasPoints = placesWithCoords.length > 0;

  const handleStripPlaceSelect = useCallback((place: TopPlaceCardModel) => {
    const lat = place.latitude;
    const lng = place.longitude;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [lng, lat],
      zoom: 14,
      duration: 0.6,
      essential: true,
    });
  }, []);

  const handle3DToggle = useCallback(() => {
    setIs3D((prev) => {
      const next = !prev;
      setPersisted3D(next);
      return next;
    });
  }, []);

  if (!token) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
        Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local to show the map.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {/* 3D toggle and zoom controls: right side, below modal close (X) */}
      <div className="absolute right-14 top-24 z-10 flex flex-col items-end gap-2 md:right-14 md:top-24">
        <MapView3DToggle
          is3D={is3D}
          onToggle={handle3DToggle}
          map={mapRef.current}
          disabled={!webGLSupported}
        />
        <MapZoomControls map={mapRef.current} />
      </div>
      {!hasPoints && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90">
          <p className="rounded-lg bg-white px-6 py-4 text-center text-gray-700 shadow-sm">
            No places match these filters.
          </p>
        </div>
      )}
      {hasPoints && !onPlaceSelect && (
        <TopPlacesMapStrip
          places={places}
          onPlaceSelect={handleStripPlaceSelect}
        />
      )}
    </div>
  );
}
