"use client";

/**
 * My Places Photo Map — single Mapbox entry point.
 * GeoJSON source + clustering; viewport-based thumbnail loading; DEBUG support.
 * Uses REAL data (places from getMyPlacesFromUser / realData).
 *
 * List-map sync: activePlaceId (from parent) drives marker highlight (selected-ring overlay)
 * and camera flyTo. State A (feature-state active with larger circle/photo) was removed;
 * markers use one fixed size; selection is a separate overlay ring only. Toggle debug: window.__DEBUG_MAP_INTERACTIONS = true
 *
 * Manual test plan:
 * - Click 5 random list items in a row; map highlights correct marker each time.
 * - Filter list, click item; marker still correct.
 * - Sort list (if applicable), click item; marker still correct.
 * - No console errors.
 */

import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from "react";
import { createRoot } from "react-dom/client";
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
import {
  applyLinkedSpacesMapStyle,
  MAPBOX_STYLE_URL,
} from "../../mapbox-linkedspaces-style";
import {
  drawCircularThumb,
  canvasToImageBitmap,
} from "../../mapbox-photo-marker-utils";
import {
  MARKER_CIRCLE_RADIUS,
  MARKER_CIRCLE_STROKE_WIDTH,
  MARKER_SELECTED_RING_RADIUS,
  MARKER_SELECTED_RING_STROKE_WIDTH,
} from "../../mapbox-marker-constants";
import {
  getCategoryPinImageId,
  getCategoryPinSvgDataUrl,
  getCategoryPinDataUrlById,
  getAllCategoryPinIdsForPreload,
  fetchAndSetSentimentPngs,
} from "../../mapbox-category-pins";
import type { UserSentiment } from "../../mapbox-category-pins";
import OrangePlaceMarker from "../../components/OrangePlaceMarker";
import type { SavedPlace } from "../mockData";
import WebGLHelpPopup from "@/components/ui/WebGLHelpPopup";

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
/** Selected-place overlay ring only; base marker size never changes (State A removed). */
const SELECTED_RING_LAYER_ID = "my-places-selected-ring";
const UNCLUSTERED_SYMBOL_LAYER_ID = "my-places-unclustered-symbol";
const UNCLUSTERED_PLACE_NAME_LAYER_ID = "my-places-unclustered-place-name";

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
  /** Called when user clicks a place marker or a photo in the preview popup. Pass photoIndex (0-based) when opening from a specific thumbnail so the modal can start at that photo. */
  onPlaceClick?: (placeId: string, photoIndex?: number) => void;
  /** Called when map view changes (moveend/zoomend) so parent can restore it when modal closes. */
  onMapViewChange?: (center: [number, number], zoom: number) => void;
  /** When set, map flies to this view (e.g. after closing place modal). Call onRestoreComplete when done. */
  restoreView?: { center: [number, number]; zoom: number } | null;
  onRestoreComplete?: () => void;
  /** Called when user clicks the map background (not on a pin or cluster). Use to open full-screen map view. */
  onMapBackgroundClick?: () => void;
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
    const rawId = p.id;
    if (rawId == null || String(rawId).trim() === "") {
      console.warn("[PhotoMap] Skipped place (missing id):", p.name);
      skipped++;
      continue;
    }
    const id = String(rawId);
    const thumbnailUrl =
      p.thumbnailUrl && String(p.thumbnailUrl).trim()
        ? p.thumbnailUrl.trim()
        : null;
    const category = (p.category ?? "Others").toString();
    const sentiment = p.sentiment;
    features.push({
      type: "Feature",
      id,
      geometry: { type: "Point", coordinates: [lng, lat] },
      properties: {
        id,
        placeId: id,
        placeName: p.name ?? "",
        category,
        sentiment: sentiment ?? undefined,
        thumbnailUrl,
        thumbKey: thumbnailUrl ? `thumb:${p.id}` : DEFAULT_PIN_ID,
        categoryPinId: getCategoryPinImageId(category, sentiment),
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

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(s: string): string {
  const el = document.createElement("div");
  el.textContent = s;
  return el.innerHTML;
}

const FOCUS_ZOOM = 14;
const FLY_DURATION_MS = 800;

export default function PhotoMap({
  places,
  activePlaceId,
  onPlaceClick,
  onMapViewChange,
  restoreView,
  onRestoreComplete,
  onMapBackgroundClick,
}: PhotoMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const geoJsonRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const onPlaceClickRef = useRef(onPlaceClick);
  onPlaceClickRef.current = onPlaceClick;
  const onMapViewChangeRef = useRef(onMapViewChange);
  onMapViewChangeRef.current = onMapViewChange;
  const onMapBackgroundClickRef = useRef(onMapBackgroundClick);
  onMapBackgroundClickRef.current = onMapBackgroundClick;
  const markerPopupRef = useRef<any>(null);
  const placesForPopupRef = useRef<SavedPlace[]>([]);
  const openPopupFromHoverRef = useRef(false);
  const hoverCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const showPopupForPlaceIdRef = useRef<((placeId: string) => void) | null>(
    null,
  );
  const thumbCacheRef = useRef<ReturnType<typeof createThumbCache> | null>(
    null,
  );
  const moveEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delayedResizeTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const initCancelRef = useRef<(() => void) | null>(null);
  const cancelledRef = useRef(false);
  const lastSyncThumbnailsRef = useRef(0);
  const SYNC_THUMBNAILS_DEBOUNCE_MS = 500;
  /** DOM markers (OrangePlaceMarker) keyed by feature id; synced on moveend/zoomend. */
  const domMarkersRef = useRef<
    Map<
      string,
      { marker: any; root: ReturnType<typeof createRoot>; el: HTMLDivElement }
    >
  >(new Map());
  const syncDomMarkersRef = useRef<((map: any) => void) | null>(null);
  const [is3D, setIs3D] = useState(() => getPersisted3D());
  const is3DRef = useRef(is3D);
  is3DRef.current = is3D;
  const [mapReady, setMapReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const webGLSupported = isWebGLSupported();

  const token =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      : undefined;

  const validPlaces = places.filter(
    (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng),
  );
  placesForPopupRef.current = validPlaces;
  const geoJson = useRef(buildGeoJSON(validPlaces));
  geoJson.current = buildGeoJSON(validPlaces);

  const syncThumbnailsForViewport = useCallback((map: any) => {
    if (!map || !map.getSource(SOURCE_ID)) return;
    const now = Date.now();
    if (now - lastSyncThumbnailsRef.current < SYNC_THUMBNAILS_DEBOUNCE_MS)
      return;
    lastSyncThumbnailsRef.current = now;
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
          map.triggerRepaint();
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

    setContextLost(false);
    thumbCacheRef.current = createThumbCache(THUMB_CACHE_MAX);
    cancelledRef.current = false;
    initCancelRef.current = null;
    let map: any = null;
    let cancelRun: (() => void) | undefined;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxgl.accessToken = token;
      if (cancelledRef.current) return;

      cancelRun = runWhenReady(() => {
        if (cancelledRef.current || !containerRef.current) return;
        try {
          map = new mapboxgl.Map({
            container: containerRef.current,
            style: MAPBOX_STYLE_URL,
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            preserveDrawingBuffer: true,
          });
        } catch (err) {
          if (typeof console !== "undefined")
            console.error("[PhotoMap] Map init failed", err);
          setContextLost(true);
          setShowHelpPopup(true);
          return;
        }
        mapRef.current = map;

        const canvas = map.getCanvas();
        if (canvas) {
          canvas.addEventListener("webglcontextlost", (e: Event) => {
            e.preventDefault();
            setContextLost(true);
          });
        }

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
          // Delayed resizes so map picks up final container size after layout settles (fixes pixelated tiles).
          const t1 = setTimeout(() => {
            if (mapRef.current) mapRef.current.resize();
          }, 150);
          const t2 = setTimeout(() => {
            if (mapRef.current) mapRef.current.resize();
          }, 500);
          delayedResizeTimeoutsRef.current = [t1, t2];
          const debouncedResize = () => {
            if (resizeTimeoutRef.current)
              clearTimeout(resizeTimeoutRef.current);
            resizeTimeoutRef.current = setTimeout(() => {
              resizeTimeoutRef.current = null;
              if (mapRef.current) mapRef.current.resize();
            }, 150);
          };
          const ro =
            containerRef.current && new ResizeObserver(debouncedResize);
          resizeObserverRef.current = ro;
          if (ro && containerRef.current) ro.observe(containerRef.current);
          map.loadImage(
            DEFAULT_PIN_SVG,
            (
              err: Error | null,
              img: HTMLImageElement | ImageBitmap | undefined,
            ) => {
              if (cancelledRef.current || !mapRef.current) return;
              if (!err && img && !map.hasImage(DEFAULT_PIN_ID)) {
                try {
                  map.addImage(DEFAULT_PIN_ID, img, { sdf: false });
                } catch (e) {
                  if (DEBUG_MAP)
                    console.warn("[PhotoMap] addImage default pin failed", e);
                  setContextLost(true);
                  return;
                }
              }

              const addCategoryPinsThenLayers = () => {
                const pinIds = getAllCategoryPinIdsForPreload();
                let loaded = 0;
                const total = pinIds.length;
                const addSourceAndLayers = () => {
                  try {
                    if (cancelledRef.current || !mapRef.current) return;
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
                        "text-font": [
                          "DIN Offc Pro Medium",
                          "Arial Unicode MS Bold",
                        ],
                        "text-size": 13,
                      },
                      paint: { "text-color": "#fff" },
                    });
                    /* Invisible circle layer: used only for queryRenderedFeatures so we know which points are unclustered. OrangePlaceMarker (DOM) draws the visible marker. */
                    map.addLayer({
                      id: UNCLUSTERED_CIRCLE_LAYER_ID,
                      type: "circle",
                      source: SOURCE_ID,
                      filter: ["!", ["has", "point_count"]],
                      paint: {
                        "circle-color": "rgba(249, 115, 22, 0.9)",
                        "circle-radius": MARKER_CIRCLE_RADIUS,
                        "circle-stroke-width": MARKER_CIRCLE_STROKE_WIDTH,
                        "circle-stroke-color": "#fff",
                        "circle-opacity": 0,
                      },
                    });
                    // Selected-place overlay ring; filter updated in effect. Base marker never resizes.
                    map.addLayer({
                      id: SELECTED_RING_LAYER_ID,
                      type: "circle",
                      source: SOURCE_ID,
                      filter: [
                        "==",
                        ["get", "id"],
                        activePlaceIdRef.current ?? "",
                      ],
                      paint: {
                        "circle-radius": MARKER_SELECTED_RING_RADIUS,
                        "circle-opacity": 0,
                        "circle-stroke-width":
                          MARKER_SELECTED_RING_STROKE_WIDTH,
                        "circle-stroke-color": "#fff",
                        "circle-stroke-opacity": 1,
                      },
                    });
                    /* Sync DOM markers (OrangePlaceMarker): one stable component per unclustered point so label stays centered by layout. */
                    const syncDomMarkers = (m: any) => {
                      if (!m || !m.getSource(SOURCE_ID)) return;
                      const features = m.queryRenderedFeatures(undefined, {
                        layers: [UNCLUSTERED_CIRCLE_LAYER_ID],
                      }) as GeoJSON.Feature<
                        GeoJSON.Point,
                        Record<string, unknown>
                      >[];
                      const currentIds = new Set(
                        features.map((f) =>
                          String(
                            f.properties?.id ??
                              (f as GeoJSON.Feature & { id?: string }).id ??
                              "",
                          ),
                        ),
                      );
                      const activeId = activePlaceIdRef.current ?? "";

                      for (const f of features) {
                        const id = String(
                          f.properties?.id ??
                            (f as GeoJSON.Feature & { id?: string }).id ??
                            "",
                        );
                        if (!id) continue;
                        const coords = f.geometry?.coordinates;
                        if (!coords || coords.length < 2) continue;
                        const props = f.properties ?? {};
                        const placeName = String(props.placeName ?? "");
                        const category = String(props.category ?? "Others");
                        const sentiment =
                          (props.sentiment as UserSentiment | undefined) ??
                          null;

                        if (domMarkersRef.current.has(id)) {
                          const entry = domMarkersRef.current.get(id)!;
                          entry.marker.setLngLat([coords[0], coords[1]]);
                          entry.root.render(
                            React.createElement(OrangePlaceMarker, {
                              placeName,
                              category,
                              sentiment,
                              selected: id === activeId,
                            }),
                          );
                          continue;
                        }
                        const el = document.createElement("div");
                        el.className = "orange-place-marker-wrapper";
                        el.style.cursor = "pointer";
                        el.addEventListener("click", (ev) => {
                          ev.stopPropagation();
                          onPlaceClickRef.current?.(id, 0);
                        });
                        const root = createRoot(el);
                        root.render(
                          React.createElement(OrangePlaceMarker, {
                            placeName,
                            category,
                            sentiment,
                            selected: id === activeId,
                          }),
                        );
                        const marker = new mapboxgl.Marker({ element: el })
                          .setLngLat([coords[0], coords[1]])
                          .addTo(m);
                        domMarkersRef.current.set(id, { marker, root, el });
                      }

                      for (const [
                        id,
                        entry,
                      ] of domMarkersRef.current.entries()) {
                        if (!currentIds.has(id)) {
                          try {
                            entry.marker.remove();
                            entry.root.unmount();
                          } catch {}
                          domMarkersRef.current.delete(id);
                        }
                      }
                    };

                    syncDomMarkersRef.current = syncDomMarkers;
                    syncDomMarkers(map);
                    // After source is loaded and a frame has painted, sync again so OrangePlaceMarker DOM is created (fixes orange markers missing on page load/revisit).
                    const onSourceLoaded = (e: {
                      sourceId?: string;
                      isSourceLoaded?: boolean;
                    }) => {
                      if (e.sourceId !== SOURCE_ID || !e.isSourceLoaded) return;
                      map.off("sourcedata", onSourceLoaded);
                      requestAnimationFrame(() => {
                        requestAnimationFrame(() =>
                          syncDomMarkersRef.current?.(map),
                        );
                      });
                    };
                    map.on("sourcedata", onSourceLoaded);
                    map.once("idle", () => syncDomMarkersRef.current?.(map));
                    map.on("moveend", () => syncDomMarkersRef.current?.(map));
                    map.on("zoomend", () => syncDomMarkersRef.current?.(map));
                  } catch (e) {
                    if (typeof console !== "undefined")
                      console.error("[PhotoMap] addSourceAndLayers failed", e);
                    setContextLost(true);
                  }
                };

                fetchAndSetSentimentPngs().then(() => {
                  pinIds.forEach((pinId) => {
                    if (map.hasImage(pinId)) {
                      loaded++;
                      if (loaded === total) addSourceAndLayers();
                      return;
                    }
                    const key = pinId.replace(/^pin-/, "");
                    const dataUrl =
                      getCategoryPinDataUrlById(pinId) ??
                      getCategoryPinSvgDataUrl(key);
                    const im = new Image();
                    im.onload = () => {
                      if (!map.hasImage(pinId))
                        map.addImage(pinId, im, { sdf: false });
                      loaded++;
                      if (loaded === total) addSourceAndLayers();
                    };
                    im.onerror = () => {
                      loaded++;
                      if (loaded === total) addSourceAndLayers();
                    };
                    im.src = dataUrl;
                  });
                  if (total === 0) addSourceAndLayers();
                });
              };

              addCategoryPinsThenLayers();

              let initialFitDone = false;
              const fitBoundsOnce = () => {
                if (initialFitDone) return;
                const features = geoJsonRef.current?.features;
                if (!features?.length) return;
                initialFitDone = true;
                // Anchor map on first place in the list (left-hand side)
                const first = features[0] as GeoJSON.Feature<GeoJSON.Point>;
                const c = first?.geometry?.coordinates;
                if (c && c.length >= 2) {
                  map.flyTo({
                    center: [c[0], c[1]],
                    zoom: FOCUS_ZOOM,
                    duration: 0,
                  });
                  return;
                }
                // Fallback: fit all places if first has no coords
                const bounds = new mapboxgl.LngLatBounds();
                geoJsonRef.current!.features.forEach((f) => {
                  const coords =
                    f.geometry?.type === "Point"
                      ? (f.geometry as GeoJSON.Point).coordinates
                      : undefined;
                  if (coords && coords.length >= 2)
                    bounds.extend([coords[0], coords[1]]);
                });
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

              const reportView = () => {
                const c = map.getCenter();
                onMapViewChangeRef.current?.([c.lng, c.lat], map.getZoom());
              };
              const onMoveEnd = () => {
                reportView();
                if (moveEndTimeoutRef.current)
                  clearTimeout(moveEndTimeoutRef.current);
                moveEndTimeoutRef.current = setTimeout(() => {
                  moveEndTimeoutRef.current = null;
                  syncThumbnailsForViewport(map);
                }, 150);
              };
              map.on("moveend", onMoveEnd);
              map.on("zoomend", onMoveEnd);
              map.once("idle", reportView);

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

              const showMarkerPopup = (
                placeId: string,
                lng: number,
                lat: number,
                fromHover: boolean,
              ) => {
                const place = placesForPopupRef.current.find(
                  (p) => p.id === String(placeId),
                );
                if (!place) return;
                if (markerPopupRef.current) {
                  try {
                    markerPopupRef.current.remove();
                  } catch {}
                  markerPopupRef.current = null;
                }
                if (hoverCloseTimeoutRef.current) {
                  clearTimeout(hoverCloseTimeoutRef.current);
                  hoverCloseTimeoutRef.current = null;
                }
                openPopupFromHoverRef.current = fromHover;
                const uris =
                  (place.photoListUris?.length ?? 0) > 0
                    ? place.photoListUris!.slice(0, 4)
                    : place.thumbnailUrl
                      ? [place.thumbnailUrl]
                      : [];
                const imgs = uris
                  .map(
                    (u, i) =>
                      `<div data-view-place data-photo-index="${i}" style="cursor:pointer;line-height:0;border-radius:6px;overflow:hidden;"><img src="${escapeAttr(ensureAbsoluteUrl(u))}" alt="" loading="lazy" style="width:64px;height:64px;object-fit:cover;display:block;" /></div>`,
                  )
                  .join("");
                const placeTitle = escapeHtml(place.name ?? "Place");
                const viewBtnHtml = `<button type="button" data-view-place data-photo-index="0" style="margin-top:10px;width:100%;padding:10px 16px;font-size:14px;font-weight:600;color:#fff;background:var(--color-main,#2563eb);border:none;border-radius:10px;cursor:pointer;">View</button>`;
                const html = `<div style="padding:18px 14px 14px;min-width:160px;max-width:280px;background:#fff;border-radius:15px;box-shadow:0 4px 20px rgba(0,0,0,0.12);">
                  <div style="font-weight:700;font-size:15px;color:#111;margin-bottom:16px;letter-spacing:0.01em;">${placeTitle}</div>
                  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;justify-items:stretch;">${imgs || '<div style="grid-column:1/-1;height:80px;background:#f3f4f6;border-radius:8px;"></div>'}</div>
                  ${viewBtnHtml}
                </div>`;
                const popup = new mapboxgl.Popup({
                  closeButton: true,
                  offset: 52,
                  anchor: "top",
                  className: "my-map-marker-popup",
                })
                  .setLngLat([lng, lat])
                  .setHTML(html);
                const placeIdToView = String(placeId);
                popup.on("open", () => {
                  const el = popup.getElement();
                  if (fromHover && el) {
                    const onMarkerMouseLeave = () => {
                      hoverCloseTimeoutRef.current = setTimeout(() => {
                        if (markerPopupRef.current) {
                          try {
                            markerPopupRef.current.remove();
                          } catch {}
                          markerPopupRef.current = null;
                        }
                        hoverCloseTimeoutRef.current = null;
                      }, 300);
                    };
                    el.addEventListener("mouseenter", () => {
                      if (hoverCloseTimeoutRef.current) {
                        clearTimeout(hoverCloseTimeoutRef.current);
                        hoverCloseTimeoutRef.current = null;
                      }
                    });
                    el.addEventListener("mouseleave", onMarkerMouseLeave);
                    popup.once("close", () => {
                      el.removeEventListener("mouseleave", onMarkerMouseLeave);
                    });
                  }
                  el?.querySelectorAll?.("[data-view-place]")?.forEach(
                    (node) => {
                      const handler = (ev: Event) => {
                        ev.preventDefault();
                        const el = ev.currentTarget as HTMLElement;
                        const idxAttr = el?.getAttribute?.("data-photo-index");
                        const photoIndex =
                          idxAttr != null && idxAttr !== ""
                            ? parseInt(idxAttr, 10)
                            : 0;
                        onPlaceClickRef.current?.(
                          placeIdToView,
                          Number.isFinite(photoIndex) ? photoIndex : 0,
                        );
                        try {
                          popup.remove();
                        } catch {}
                        markerPopupRef.current = null;
                      };
                      node.addEventListener("click", handler);
                      popup.once("close", () =>
                        node.removeEventListener("click", handler),
                      );
                    },
                  );
                });
                popup.addTo(map);
                markerPopupRef.current = popup;
              };

              showPopupForPlaceIdRef.current = (placeId: string) => {
                const feat = geoJsonRef.current?.features?.find(
                  (f) =>
                    (f.properties as Record<string, unknown>)?.placeId ===
                      placeId ||
                    (f as GeoJSON.Feature & { id?: string }).id === placeId,
                ) as GeoJSON.Feature<GeoJSON.Point> | undefined;
                const coords = feat?.geometry?.coordinates;
                if (!coords || coords.length < 2) return;
                showMarkerPopup(placeId, coords[0], coords[1], false);
              };

              const getPlaceIdAndCoordsFromEvent = (e: {
                point: { x: number; y: number };
              }): { placeId: string; lng: number; lat: number } | null => {
                const features = map.queryRenderedFeatures(e.point, {
                  layers: [UNCLUSTERED_CIRCLE_LAYER_ID],
                });
                if (!features.length) return null;
                const placeId = (features[0].properties?.placeId ??
                  features[0].properties?.id) as string | undefined;
                if (!placeId) return null;
                const geom = features[0].geometry as GeoJSON.Point;
                const coords = geom?.coordinates;
                const lng = coords?.[0] ?? 0;
                const lat = coords?.[1] ?? 0;
                return { placeId: String(placeId), lng, lat };
              };

              const onMarkerClick = (e: any) => {
                e.originalEvent?.stopPropagation();
                const data = getPlaceIdAndCoordsFromEvent(e);
                if (data) onPlaceClickRef.current?.(data.placeId, 0);
              };

              map.on("click", UNCLUSTERED_CIRCLE_LAYER_ID, onMarkerClick);

              const allInteractiveLayers = [
                CLUSTER_LAYER_ID,
                CLUSTER_COUNT_LAYER_ID,
                UNCLUSTERED_CIRCLE_LAYER_ID,
              ];
              const onMapClick = (e: any) => {
                const features = map.queryRenderedFeatures(e.point, {
                  layers: allInteractiveLayers,
                });
                if (features.length === 0) onMapBackgroundClickRef.current?.();
              };
              map.on("click", onMapClick);

              map.getCanvas().style.cursor = "default";
            },
          );
        });
      });
      initCancelRef.current = cancelRun ?? null;
    })();

    return () => {
      cancelledRef.current = true;
      initCancelRef.current?.();
      initCancelRef.current = null;
      if (moveEndTimeoutRef.current) clearTimeout(moveEndTimeoutRef.current);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
      delayedResizeTimeoutsRef.current.forEach((t) => clearTimeout(t));
      delayedResizeTimeoutsRef.current = [];
      if (resizeObserverRef.current && containerRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (hoverCloseTimeoutRef.current) {
        clearTimeout(hoverCloseTimeoutRef.current);
        hoverCloseTimeoutRef.current = null;
      }
      showPopupForPlaceIdRef.current = null;
      if (markerPopupRef.current) {
        try {
          markerPopupRef.current.remove();
        } catch {}
        markerPopupRef.current = null;
      }
      if (map) {
        try {
          domMarkersRef.current.forEach((entry) => {
            try {
              entry.marker.remove();
              entry.root.unmount();
            } catch {}
          });
          domMarkersRef.current.clear();
          syncDomMarkersRef.current = null;
          const cache = thumbCacheRef.current;
          if (cache)
            cache.imageIds().forEach((id) => {
              try {
                if (map.hasImage(id)) map.removeImage(id);
              } catch {}
            });
          [
            SELECTED_RING_LAYER_ID,
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
          getAllCategoryPinIdsForPreload().forEach((id) => {
            try {
              if (map.hasImage(id)) map.removeImage(id);
            } catch {}
          });
        } catch {}
        map.remove();
      }
      mapRef.current = null;
      geoJsonRef.current = null;
      thumbCacheRef.current = null;
      setMapReady(false);
    };
  }, [token, syncThumbnailsForViewport]);

  const activePlaceIdRef = useRef<string | null>(null);
  activePlaceIdRef.current = activePlaceId ?? null;

  /** Set of feature ids in current GeoJSON (string). */
  const featureIdSet = useMemo(() => {
    const set = new Set<string>();
    for (const f of geoJson.current.features) {
      const id = (f as GeoJSON.Feature & { id?: string | number }).id;
      if (id != null) set.add(String(id));
    }
    return set;
  }, [validPlaces.length, places]);

  /** Stable key so setData runs only when the list of places actually changes, not on every parent re-render. */
  const placesDataKey = useMemo(
    () => validPlaces.map((p) => p.id).join(","),
    [validPlaces],
  );

  // Update map data only when places change — do not run on activePlaceId change (avoids redundant setData and races).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || cancelledRef.current) return;
    const source = map.getSource(SOURCE_ID) as
      | { setData?: (d: GeoJSON.FeatureCollection) => void }
      | undefined;
    if (!source?.setData) return;
    try {
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
    } catch (e) {
      if (DEBUG_MAP) console.warn("[PhotoMap] setData failed", e);
    }
  }, [placesDataKey]);

  // When the places list changes (e.g. map category filter), fly to the first (nearest) place so the map stays anchored to the most relevant location.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || cancelledRef.current) return;
    const source = map.getSource(SOURCE_ID);
    if (!source) return;
    const features = geoJson.current?.features;
    if (!features?.length) return;
    const first = features[0] as GeoJSON.Feature<GeoJSON.Point>;
    const c = first?.geometry?.coordinates;
    if (c && c.length >= 2) {
      map.flyTo({
        center: [c[0], c[1]],
        zoom: FOCUS_ZOOM,
        duration: 400,
        essential: true,
      });
    }
  }, [placesDataKey]);

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

  // Update selected-ring layer filter when activePlaceId changes. State A (feature-state size change) was removed; selection is overlay-only.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer(SELECTED_RING_LAYER_ID)) return;
    try {
      map.setFilter(SELECTED_RING_LAYER_ID, [
        "==",
        ["get", "id"],
        activePlaceId ?? "",
      ]);
      debugLog("setFilter selected ring", activePlaceId ?? "");
    } catch (e) {
      debugLog("setFilter selected ring failed", e);
    }
  }, [activePlaceId]);

  // Re-sync DOM markers when activePlaceId changes so OrangePlaceMarker selected prop updates.
  useEffect(() => {
    syncDomMarkersRef.current?.(mapRef.current);
  }, [activePlaceId]);

  const onRestoreCompleteRef = useRef(onRestoreComplete);
  onRestoreCompleteRef.current = onRestoreComplete;
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !restoreView) return;
    map.flyTo({
      center: restoreView.center,
      zoom: restoreView.zoom,
      duration: 0.4,
      essential: true,
    });
    const onRestored = () => {
      map.off("moveend", onRestored);
      onRestoreCompleteRef.current?.();
    };
    map.once("moveend", onRestored);
    return () => {
      map.off("moveend", onRestored);
    };
  }, [restoreView]);

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

  if (contextLost) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 p-4 text-center text-sm text-gray-600">
        <p>Map temporarily unavailable.</p>
        <p className="text-gray-500">
          Try closing and reopening the map or refreshing the page.
        </p>
        <WebGLHelpPopup
          open={showHelpPopup}
          onClose={() => setShowHelpPopup(false)}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl border border-gray-200">
      <div ref={containerRef} className="h-full w-full" />
      <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
        <MapView3DToggle
          is3D={is3D}
          onToggle={handle3DToggle}
          map={mapReady ? mapRef.current : undefined}
          disabled={!webGLSupported}
        />
        <MapZoomControls map={mapReady ? mapRef.current : undefined} />
      </div>
      <div className="absolute bottom-3 left-3 rounded-lg border border-gray-200 bg-white/95 px-3 py-1.5 text-sm text-gray-700 shadow-sm">
        {validPlaces.length} {validPlaces.length === 1 ? "place" : "places"} on
        map
      </div>
    </div>
  );
}
