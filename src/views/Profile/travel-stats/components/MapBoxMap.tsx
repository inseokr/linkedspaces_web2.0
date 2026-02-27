// 나라별로 색을 칠해서 하이라이트
//마커 찍기 (모드 2가지)
// place 모드에서는 마커들을 점선으로 연결
// 특정 국가로 카메라 자동 이동

"use client";

import type { GeoJSONSource, Map as MapboxMapType } from "mapbox-gl";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import { MAPBOX_STYLE_URL } from "@/app/profile/mapbox-linkedspaces-style";
import CircleTripMarker from "@/views/Profile/recap-blogs/components/CircleTripMarker";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";
import WebGLHelpPopup from "@/components/ui/WebGLHelpPopup";

export type PoiInfo = {
  name: string;
  category?: string;
  maki?: string;
  lat: number;
  lng: number;
};

export type MarkerData = {
  id: string;
  lat: number;
  lng: number;
  year: number;
  label: string;
  imageUrl: string;
  dateLabel?: string; // e.g. "Nov 2024" (recap-blog list marker)
  visitIndex?: number; // 1-based order within active day
  visitTimeText?: string; // e.g. "9:30 AM" or "9:30–10:10 AM"
  externalUrl?: string; // when present, place is a concrete POI (not abstract)
};

export interface CountryStat {
  code: string;
  value: number;
}

type Props = {
  countryCode?: string;
  highlightIso2?: string[];
  countryStats?: CountryStat[];
  worldview?: string;

  /** When focusing on a country (e.g. initial view), use this zoom so the map doesn't zoom in too much and other countries stay visible. Ignored when focusing on markers/lat-lng. */
  defaultFocusZoom?: number;

  focusLatLng?: { lat: number; lng: number };

  mode?: "place";

  markers?: MarkerData[];
  onMarkerClick?: (markerId: string) => void;
  activeMarkerId?: string;

  placeMarkers?: MarkerData[];
  onPlaceMarkerClick?: (markerId: string) => void;
  activePlaceMarkerId?: string;

  /** Optional UI rendered on top of the map. */
  overlayTopLeft?: ReactNode;
  /** Optional UI rendered on top of the map. */
  overlayTopRight?: ReactNode;

  /**
   * When the map container is moved in the DOM (e.g. via portal), Mapbox can
   * visually glitch unless we call resize(). Pass a value that changes when the
   * container target changes.
   */
  containerResizeKey?: string | number;

  /** When false, do not draw the orange dashed route line between place markers. Default true. */
  showPlacePath?: boolean;

  /** When true, use lightweight DOM-only place markers (no React roots). Reduces memory and improves performance. */
  useSimpleMarkers?: boolean;

  /** Fired when the user clicks a built-in Mapbox POI label on the map. */
  onPoiClick?: (poi: PoiInfo) => void;
};

function PlaceMarker({
  imageUrl,
  size = 72,
  isActive = false,
  visitIndex,
  visitTimeText,
}: {
  imageUrl: string;
  size?: number;
  isActive?: boolean;
  visitIndex?: number;
  visitTimeText?: string;
}) {
  const baseShadow = "0 8px 20px rgba(0,0,0,0.18)";
  const activeRings = [
    // crisp main ring
    "0 0 0 3px rgba(249, 115, 22, 0.98)",
    // soft outer rings
    "0 0 0 8px rgba(249, 115, 22, 0.32)",
    "0 0 0 14px rgba(249, 115, 22, 0.16)",
    // subtle inner highlight for pop
    "inset 0 0 0 1px rgba(255,255,255,0.55)",
  ].join(", ");

  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: 9999,
          overflow: "hidden",
          border: isActive
            ? "3px solid rgba(249, 115, 22, 0.98)" // orange-500
            : "3px solid rgba(255,255,255,0.9)",
          boxShadow: isActive ? `${baseShadow}, ${activeRings}` : baseShadow,
          background: "rgba(0,0,0,0.05)",
          transform: isActive ? "scale(1.03)" : "scale(1)",
          transition:
            "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        }}
      >
        <Image
          src={normalizeImageSrc(imageUrl).src}
          alt=""
          fill
          unoptimized={normalizeImageSrc(imageUrl).unoptimized}
          sizes={`${size ?? 80}px`}
          style={{ objectFit: "cover" }}
        />
      </div>

      {typeof visitIndex === "number" && Number.isFinite(visitIndex) && (
        <div
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            minWidth: 26,
            height: 26,
            padding: "0 8px",
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.88)",
            color: "white",
            fontWeight: 900,
            fontSize: 12,
            lineHeight: "12px",
            letterSpacing: 0.2,
            border: "2px solid rgba(255,255,255,0.95)",
            boxShadow: "0 6px 14px rgba(0,0,0,0.18)",
            pointerEvents: "none",
          }}
        >
          {visitIndex}
        </div>
      )}

      {!!visitTimeText && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "100%",
            marginTop: 4,
            // Optical centering: the pill can read slightly left under the circle,
            // so we nudge it a couple pixels to the right.
            transform: "translateX(calc(-50% + 3px))",
            background: "rgba(255,255,255,0.96)",
            border: "1px solid rgba(0,0,0,0.12)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
            borderRadius: 9999,
            padding: "6px 10px",
            maxWidth: 160,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontSize: 12,
            fontWeight: 800,
            color: "rgba(0,0,0,0.78)",
            pointerEvents: "none",
            backdropFilter: "blur(6px)",
          }}
          title={visitTimeText}
        >
          {visitTimeText}
        </div>
      )}
    </div>
  );
}

const PLACE_PATH_SOURCE_ID = "place-path-src";
const PLACE_PATH_LAYER_ID = "place-path-layer";

/** ~8–10 m in degrees — nudge markers off the POI so the label stays visible but still close to the route */
const POI_NUDGE_DEG = 0.0001;

/**
 * Compute display position and pixel offset for each place marker so that (1) markers
 * are nudged away from the exact POI so the POI label remains visible, and (2) when
 * multiple markers share the same location they are spread in a circle to avoid overlap.
 */
function computePlaceMarkerLayout(
  placeMarkers: MarkerData[],
  markerSizePx: number,
): Map<string, { lngLat: [number, number]; offset: [number, number] }> {
  const key = (lat: number, lng: number) =>
    `${lat.toFixed(5)},${lng.toFixed(5)}`;
  const groups = new Map<
    string,
    { baseLat: number; baseLng: number; ids: string[] }
  >();
  for (const m of placeMarkers) {
    if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) continue;
    const k = key(m.lat, m.lng);
    const g = groups.get(k);
    if (g) g.ids.push(m.id);
    else groups.set(k, { baseLat: m.lat, baseLng: m.lng, ids: [m.id] });
  }

  const result = new Map<
    string,
    { lngLat: [number, number]; offset: [number, number] }
  >();
  const radiusPx = markerSizePx / 2 + 24;

  for (const g of groups.values()) {
    const displayLng = g.baseLng + POI_NUDGE_DEG;
    const displayLat = g.baseLat + POI_NUDGE_DEG;
    const n = g.ids.length;

    if (n === 1) {
      result.set(g.ids[0], {
        lngLat: [displayLng, displayLat],
        offset: [0, 0],
      });
      continue;
    }

    const step = (2 * Math.PI) / n;
    const start = -Math.PI / 2;
    g.ids.forEach((id, i) => {
      const a = start + i * step;
      result.set(id, {
        lngLat: [displayLng, displayLat],
        offset: [
          Math.round(radiusPx * Math.cos(a)),
          Math.round(radiusPx * Math.sin(a)),
        ],
      });
    });
  }
  return result;
}

export default function MapboxMap({
  countryCode,
  countryStats = [],
  worldview = "US",
  defaultFocusZoom,

  mode,
  focusLatLng,

  markers = [],
  onMarkerClick,
  activeMarkerId,

  placeMarkers = [],
  onPlaceMarkerClick,
  activePlaceMarkerId,

  overlayTopLeft,
  overlayTopRight,
  containerResizeKey,
  showPlacePath = true,
  useSimpleMarkers = false,
  onPoiClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMapType | null>(null);
  const mapboxglRef = useRef<any | null>(null);

  // handles
  const markerHandlesRef = useRef<any[]>([]);

  // refs (latest props/data)
  const markersRef = useRef(markers);
  const placeMarkersRef = useRef(placeMarkers);
  const modeRef = useRef(mode);
  const showPlacePathRef = useRef(showPlacePath);
  const useSimpleMarkersRef = useRef(useSimpleMarkers);
  const activeMarkerIdRef = useRef<Props["activeMarkerId"]>(activeMarkerId);
  const activePlaceMarkerIdRef =
    useRef<Props["activePlaceMarkerId"]>(activePlaceMarkerId);

  const focusLatLngRef = useRef<Props["focusLatLng"]>(focusLatLng);
  const countryCodeRef = useRef<Props["countryCode"]>(countryCode);
  const defaultFocusZoomRef =
    useRef<Props["defaultFocusZoom"]>(defaultFocusZoom);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onPlaceMarkerClickRef = useRef(onPlaceMarkerClick);
  const onPoiClickRef = useRef(onPoiClick);

  const syncMarkersRef = useRef<() => void>(() => {});
  const syncActiveMarkerStylesRef = useRef<() => void>(() => {});
  const syncHighlightLayersRef = useRef<() => void>(() => {});
  const syncMarkersPendingRef = useRef(false); // guard against duplicate once("idle",...) stacking

  // "한 번이라도 entry로 포커스를 준 적 있는지"
  const hasEverFocusedToEntryRef = useRef(false);
  const lastUserInteractionAtRef = useRef<number>(0);
  const lastFocusedLatLngRef = useRef<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [initError, setInitError] = useState<string | null>(() => {
    if (!token) {
      return "Mapbox token is missing. Please set NEXT_PUBLIC_MAPBOX_TOKEN and refresh.";
    }

    return null;
  });
  const [showHelpPopup, setShowHelpPopup] = useState(false);

  // Auto-open the help popup when a WebGL error is detected
  useEffect(() => {
    if (
      initError &&
      initError !==
        "Mapbox token is missing. Please set NEXT_PUBLIC_MAPBOX_TOKEN and refresh."
    ) {
      setShowHelpPopup(true);
    }
  }, [initError]);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  useEffect(() => {
    placeMarkersRef.current = placeMarkers;
  }, [placeMarkers]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    activeMarkerIdRef.current = activeMarkerId;
  }, [activeMarkerId]);

  useEffect(() => {
    activePlaceMarkerIdRef.current = activePlaceMarkerId;
  }, [activePlaceMarkerId]);

  useEffect(() => {
    focusLatLngRef.current = focusLatLng;
  }, [focusLatLng]);

  useEffect(() => {
    countryCodeRef.current = countryCode;
  }, [countryCode]);

  useEffect(() => {
    defaultFocusZoomRef.current = defaultFocusZoom;
  }, [defaultFocusZoom]);

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  useEffect(() => {
    onPlaceMarkerClickRef.current = onPlaceMarkerClick;
  }, [onPlaceMarkerClick]);

  useEffect(() => {
    onPoiClickRef.current = onPoiClick;
  }, [onPoiClick]);

  useEffect(() => {
    showPlacePathRef.current = showPlacePath;
  }, [showPlacePath]);

  useEffect(() => {
    useSimpleMarkersRef.current = useSimpleMarkers;
  }, [useSimpleMarkers]);

  const fallbackCenterByIso2: Record<string, [number, number]> = useMemo(
    () => ({
      US: [-98.5795, 39.8283],
      KR: [127.7669, 35.9078],
      GB: [-3.436, 55.3781],
      CH: [8.2275, 46.8182],
      FR: [2.2137, 46.2276],
    }),
    [],
  );

  //“전체 첫 entry” (첫 유효 마커) — modeRef를 보므로 deps 없이 안전
  const getFirstValidEntryLatLng = useCallback(() => {
    const arr =
      modeRef.current === "place"
        ? placeMarkersRef.current
        : markersRef.current;

    for (const m of arr) {
      if (Number.isFinite(m.lat) && Number.isFinite(m.lng)) {
        return { lat: m.lat, lng: m.lng };
      }
    }
    return null;
  }, []);

  const focusOnLatLng = useCallback((lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map) return;

    const last = lastFocusedLatLngRef.current;
    const isSameLocation =
      last !== null &&
      Math.abs(last.lat - lat) < 1e-6 &&
      Math.abs(last.lng - lng) < 1e-6;

    const nextZoom = isSameLocation && last.zoom === 18 ? 10 : 18;

    const runFocus = () => {
      map.stop();

      map.flyTo({
        center: [lng, lat],
        zoom: nextZoom,
        duration: 650,
      });

      // With globe projection, DOM marker CSS transforms can become stale after
      // a flyTo animation. Force Mapbox to re-project all marker positions once
      // the camera settles so they don't remain invisible until the user pans.
      map.once("moveend", () => map.triggerRepaint());

      lastFocusedLatLngRef.current = { lat, lng, zoom: nextZoom };
      hasEverFocusedToEntryRef.current = true;
    };

    if (map.isStyleLoaded()) runFocus();
    else map.once("idle", runFocus);
  }, []);

  const fitToCurrentMarkersBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map) return false;

    const arr =
      modeRef.current === "place"
        ? placeMarkersRef.current
        : markersRef.current;

    const pts = arr.filter(
      (m) => Number.isFinite(m.lat) && Number.isFinite(m.lng),
    ) as Array<{ lat: number; lng: number }>;

    if (pts.length === 0) return false;

    // One point → keep existing single-focus behavior.
    if (pts.length === 1) {
      focusOnLatLng(pts[0].lat, pts[0].lng);
      return true;
    }

    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;

    for (const p of pts) {
      minLng = Math.min(minLng, p.lng);
      minLat = Math.min(minLat, p.lat);
      maxLng = Math.max(maxLng, p.lng);
      maxLat = Math.max(maxLat, p.lat);
    }

    const run = () => {
      map.stop();
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          padding: 80,
          duration: 650,
          maxZoom: 10,
        },
      );

      hasEverFocusedToEntryRef.current = true;
    };

    if (map.isStyleLoaded()) run();
    else map.once("idle", run);

    return true;
  }, [focusOnLatLng]);

  const clearPlacePath = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.getLayer(PLACE_PATH_LAYER_ID)) map.removeLayer(PLACE_PATH_LAYER_ID);
    if (map.getSource(PLACE_PATH_SOURCE_ID))
      map.removeSource(PLACE_PATH_SOURCE_ID);
  }, []);

  const clearMarkers = useCallback(() => {
    markerHandlesRef.current.forEach((h) => {
      h.marker.remove();
      // Defer React root unmount to avoid "unmount during render" race condition
      if (typeof h.unmount === "function") setTimeout(h.unmount, 0);
      h.el.remove();
    });
    markerHandlesRef.current = [];
    clearPlacePath();
  }, [clearPlacePath]);

  const loadMapboxGL = useCallback(async () => {
    if (mapboxglRef.current) return mapboxglRef.current;
    const mod = await import("mapbox-gl");
    const mb = (mod as any)?.default ?? mod;
    mapboxglRef.current = mb;
    return mb;
  }, []);

  const syncPlacePath = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (!showPlacePathRef.current) {
      clearPlacePath();
      return;
    }

    const coords = placeMarkersRef.current
      .filter((m) => Number.isFinite(m.lng) && Number.isFinite(m.lat))
      .map((m) => [m.lng, m.lat]);

    if (coords.length < 2) {
      clearPlacePath();
      return;
    }

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: coords as any },
        },
      ],
    };

    const existing = map.getSource(PLACE_PATH_SOURCE_ID) as
      | GeoJSONSource
      | undefined;

    if (existing) {
      existing.setData(geojson as any);
    } else {
      map.addSource(PLACE_PATH_SOURCE_ID, {
        type: "geojson",
        data: geojson as any,
      });

      map.addLayer({
        id: PLACE_PATH_LAYER_ID,
        type: "line",
        source: PLACE_PATH_SOURCE_ID,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#F97316",
          "line-width": 2,
          "line-opacity": 0.9,
          "line-dasharray": [2, 2],
        },
      });
    }
  }, [clearPlacePath]);

  const syncMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const mapboxgl = mapboxglRef.current;
    if (!mapboxgl) return;

    if (!map.isStyleLoaded()) {
      if (!syncMarkersPendingRef.current) {
        syncMarkersPendingRef.current = true;
        map.once("idle", () => {
          syncMarkersPendingRef.current = false;
          syncMarkersRef.current();
        });
      }
      return;
    }

    // If a camera animation is currently running, defer until it settles so
    // markers are not created with stale mid-animation transforms.
    if (map.isMoving()) {
      if (!syncMarkersPendingRef.current) {
        syncMarkersPendingRef.current = true;
        map.once("moveend", () => {
          syncMarkersPendingRef.current = false;
          syncMarkersRef.current();
        });
      }
      return;
    }

    clearMarkers();

    const isPlaceMode = modeRef.current === "place";

    if (isPlaceMode) {
      const useSimple = useSimpleMarkersRef.current;
      const simpleSize = 48;
      const markerSizePx = useSimple ? simpleSize : 72;
      const layout = computePlaceMarkerLayout(
        placeMarkersRef.current,
        markerSizePx,
      );

      placeMarkersRef.current.forEach((m) => {
        if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) return;
        const pos = layout.get(m.id);
        if (!pos) return;

        const el = document.createElement("div");
        el.style.cursor = "pointer";

        const handleClick = (e: MouseEvent) => {
          e.stopPropagation();
          onPlaceMarkerClickRef.current?.(m.id);
          // Zoom in to POI level on marker click (use actual POI coords)
          const map = mapRef.current;
          if (map) {
            map.flyTo({ center: [m.lng, m.lat], zoom: 15, duration: 650 });
          }
        };
        el.addEventListener("click", handleClick);

        if (useSimple) {
          el.style.width = `${simpleSize}px`;
          el.style.height = `${simpleSize}px`;
          el.style.position = "relative";
          el.style.borderRadius = "9999px";
          el.style.overflow = "hidden";
          el.style.border = "2px solid rgba(255,255,255,0.9)";
          el.style.boxShadow = "0 8px 20px rgba(0,0,0,0.18)";
          el.style.background = "rgba(0,0,0,0.05)";
          const { src: simpleSrc } = normalizeImageSrc(m.imageUrl);
          const img = document.createElement("img");
          img.src = simpleSrc;
          img.alt = "";
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "cover";
          img.style.display = "block";
          el.appendChild(img);

          const isActiveAtCreate = m.id === activePlaceMarkerIdRef.current;
          el.style.zIndex = isActiveAtCreate ? "10" : "0";
          if (isActiveAtCreate) {
            el.style.border = "3px solid rgba(249, 115, 22, 0.98)";
            el.style.boxShadow =
              "0 8px 20px rgba(0,0,0,0.18), 0 0 0 8px rgba(249, 115, 22, 0.32)";
            el.style.transform = "scale(1.03)";
          }

          const marker = new mapboxgl.Marker({
            element: el,
            anchor: "center",
            offset: pos.offset,
          })
            .setLngLat(pos.lngLat)
            .addTo(map);

          markerHandlesRef.current.push({
            id: m.id,
            kind: "place",
            marker,
            el,
            simple: true,
          });
          return;
        }

        const root = createRoot(el);
        const render = (isActive: boolean) => {
          root.render(
            <PlaceMarker
              imageUrl={m.imageUrl}
              size={72}
              isActive={isActive}
              visitIndex={m.visitIndex}
              visitTimeText={m.externalUrl ? m.label : undefined}
            />,
          );
        };

        const isActiveAtCreate = m.id === activePlaceMarkerIdRef.current;
        render(isActiveAtCreate);
        el.style.zIndex = isActiveAtCreate ? "10" : "0";

        const marker = new mapboxgl.Marker({
          element: el,
          anchor: "center",
          offset: pos.offset,
        })
          .setLngLat(pos.lngLat)
          .addTo(map);

        markerHandlesRef.current.push({
          id: m.id,
          kind: "place",
          marker,
          el,
          render,
          unmount: () => root.unmount(),
        });
      });

      syncPlacePath();
      // Globe projection can leave DOM marker transforms stale after camera
      // movement. Force a repaint now and again on the next frame so all
      // marker positions are re-projected correctly.
      map.triggerRepaint();
      requestAnimationFrame(() => map.triggerRepaint());
      return;
    }

    markersRef.current.forEach((m) => {
      if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) return;

      const el = document.createElement("div");
      el.style.cursor = "pointer";

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onMarkerClickRef.current?.(m.id);
      });

      const root = createRoot(el);
      const render = (isActive: boolean) => {
        root.render(
          <CircleTripMarker
            label={m.label}
            imageUrl={m.imageUrl}
            dateLabel={m.dateLabel}
            isActive={isActive}
            onClick={() => onMarkerClickRef.current?.(m.id)}
          />,
        );
      };

      const isActiveAtCreate = m.id === activeMarkerIdRef.current;
      render(isActiveAtCreate);
      el.style.zIndex = isActiveAtCreate ? "10" : "0";

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([m.lng, m.lat])
        .addTo(map);

      markerHandlesRef.current.push({
        id: m.id,
        kind: "trip",
        marker,
        el,
        render,
        unmount: () => root.unmount(),
      });
    });
    map.triggerRepaint();
    requestAnimationFrame(() => map.triggerRepaint());
  }, [clearMarkers, syncPlacePath]);

  useEffect(() => {
    syncMarkersRef.current = syncMarkers;
  }, [syncMarkers]);

  const syncActiveMarkerStyles = useCallback(() => {
    const activePlaceId = activePlaceMarkerIdRef.current;
    const activeTripId = activeMarkerIdRef.current;

    markerHandlesRef.current.forEach((h) => {
      if (h?.kind === "place") {
        const isActive = h.id === activePlaceId;
        if (h?.simple && h?.el) {
          h.el.style.zIndex = isActive ? "10" : "0";
          h.el.style.border = isActive
            ? "3px solid rgba(249, 115, 22, 0.98)"
            : "2px solid rgba(255,255,255,0.9)";
          h.el.style.boxShadow = isActive
            ? "0 8px 20px rgba(0,0,0,0.18), 0 0 0 8px rgba(249, 115, 22, 0.32)"
            : "0 8px 20px rgba(0,0,0,0.18)";
          h.el.style.transform = isActive ? "scale(1.03)" : "scale(1)";
          if (isActive && h.el.parentElement) {
            h.el.parentElement.appendChild(h.el);
          }
        } else if (typeof h?.render === "function") {
          h.render(isActive);
          if (h?.el) {
            h.el.style.zIndex = isActive ? "10" : "0";
            if (isActive && h.el.parentElement) {
              h.el.parentElement.appendChild(h.el);
            }
          }
        }
      }

      if (h?.kind === "trip" && typeof h?.render === "function") {
        const isActive = !!activeTripId && h.id === activeTripId;
        h.render(isActive);

        if (h?.el) {
          h.el.style.zIndex = isActive ? "10" : "0";
          if (isActive && h.el.parentElement) {
            h.el.parentElement.appendChild(h.el);
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    syncActiveMarkerStylesRef.current = syncActiveMarkerStyles;
  }, [syncActiveMarkerStyles]);

  const syncHighlightLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (!map.getSource("countries")) {
      map.addSource("countries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });
    }

    if (countryStats.length === 0) {
      if (map.getLayer("country-highlight-fill"))
        map.removeLayer("country-highlight-fill");
      return;
    }

    const fillColorExpression: any = ["match", ["get", "iso_3166_1"]];
    countryStats.forEach((stat) => {
      const opacity = Math.min(0.15 + Math.log10(stat.value + 1) * 0.5, 0.9);
      fillColorExpression.push(stat.code);
      fillColorExpression.push(`rgba(249, 115, 22, ${opacity})`);
    });
    fillColorExpression.push("rgba(0, 0, 0, 0)");

    const worldViewFilter = [
      "any",
      ["==", ["get", "worldview"], "all"],
      ["==", ["get", "worldview"], "US"],
      ["has", "iso_3166_1"],
    ];

    if (map.getLayer("country-highlight-fill")) {
      map.setPaintProperty(
        "country-highlight-fill",
        "fill-color",
        fillColorExpression,
      );
      map.setFilter("country-highlight-fill", worldViewFilter);
    } else {
      map.addLayer(
        {
          id: "country-highlight-fill",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          filter: worldViewFilter,
          paint: {
            "fill-color": fillColorExpression,
            "fill-outline-color": "rgba(234, 88, 12, 0.5)",
          },
        },
        "country-label",
      );
    }
  }, [countryStats]);

  useEffect(() => {
    syncHighlightLayersRef.current = syncHighlightLayers;
  }, [syncHighlightLayers]);

  const focusOnCountry = useCallback(
    (iso2: string) => {
      const map = mapRef.current;
      if (!map) return;

      const useWiderZoom = defaultFocusZoomRef.current;
      const targetZoom = useWiderZoom ?? 4;

      const runFocus = () => {
        try {
          const features = map.querySourceFeatures("countries", {
            sourceLayer: "country_boundaries",
            filter: ["==", ["get", "iso_3166_1"], iso2.toUpperCase()] as any,
          });

          if (features?.length > 0) {
            let [minX, minY, maxX, maxY] = [
              Infinity,
              Infinity,
              -Infinity,
              -Infinity,
            ];

            const walk = (arr: any) => {
              if (typeof arr?.[0] === "number") {
                minX = Math.min(minX, arr[0]);
                minY = Math.min(minY, arr[1]);
                maxX = Math.max(maxX, arr[0]);
                maxY = Math.max(maxY, arr[1]);
                return;
              }
              for (const child of arr) walk(child);
            };

            features.forEach((f) => walk((f.geometry as any).coordinates));

            map.stop();
            // When defaultFocusZoom is set (e.g. Travel Stats), center on country at that zoom so other countries stay visible.
            if (useWiderZoom != null) {
              const centerLng = (minX + maxX) / 2;
              const centerLat = (minY + maxY) / 2;
              map.easeTo({
                center: [centerLng, centerLat],
                zoom: useWiderZoom,
                duration: 650,
              });
            } else {
              map.fitBounds(
                [
                  [minX, minY],
                  [maxX, maxY],
                ],
                { padding: 60, duration: 650, maxZoom: 5 },
              );
            }
            return;
          }
        } catch {}

        map.stop();
        map.easeTo({
          center: fallbackCenterByIso2[iso2.toUpperCase()] || [
            -98.5795, 39.8283,
          ],
          zoom: targetZoom,
          duration: 650,
        });
      };

      if (map.isStyleLoaded()) runFocus();
      else map.once("idle", runFocus);
    },
    [fallbackCenterByIso2],
  );

  // 핵심: 지도 생성/cleanup은 “최초 1회만”
  useEffect(() => {
    if (!isMounted || !containerRef.current || mapRef.current || initError)
      return;
    if (!token) return;

    let cancelled = false;
    let map: any;
    let ro: ResizeObserver | null = null;
    let markUserInteraction: (() => void) | null = null;

    (async () => {
      const mapboxgl = await loadMapboxGL();
      if (cancelled) return;

      mapboxgl.accessToken = token;

      // Skip mapboxgl.supported() pre-check — it includes a shader-compile
      // probe that Brave Shields blocks (fingerprinting protection) and that
      // some Chrome GPU-blacklist configs also reject. Instead we attempt to
      // create the map directly and diagnose failures in the catch block.

      try {
        map = new mapboxgl.Map({
          container: containerRef.current!,
          style: MAPBOX_STYLE_URL,
          center: [-98.5795, 39.8283], // 초기값(미국)이어도 OK: 이후 카메라 effect가 자연스럽게 이동시킴
          zoom: 1,
          renderWorldCopies: false,
          antialias: false,
          preserveDrawingBuffer: false,
        });
      } catch (e) {
        console.error("[MapBoxMap] init failed:", e);

        // --- Diagnose why WebGL failed ---
        let diagnosis = "";
        try {
          const c = document.createElement("canvas");
          const gl2 = c.getContext("webgl2");
          if (!gl2) {
            const gl1 = c.getContext("webgl");
            diagnosis = gl1
              ? "WebGL 2 is unavailable (WebGL 1 works but Mapbox GL v3 requires WebGL 2)."
              : "WebGL is completely disabled or unavailable in this browser.";
          } else {
            // Context exists but shader compilation was likely blocked
            diagnosis =
              "WebGL 2 context exists but the browser blocked shader compilation (privacy / fingerprinting protection).";
          }
        } catch {
          diagnosis = "Could not query WebGL support.";
        }

        const isBrave =
          typeof navigator !== "undefined" &&
          typeof (navigator as any).brave?.isBrave === "function";

        const browserTip = isBrave
          ? "Brave's Shields fingerprinting protection blocks WebGL shader compilation that Mapbox needs. " +
            'Click the Shields icon (lion) in the address bar and set "Block fingerprinting" to "Allow" for this site, then reload.'
          : 'Enable "Use hardware acceleration" in your browser settings (Settings → System) and restart. ' +
            "If the problem persists, visit chrome://gpu and verify WebGL2 shows as Hardware accelerated.";

        setInitError(`${diagnosis} ${browserTip}`);
        return;
      }

      mapRef.current = map;

      map.on("load", () => {
        map.setProjection("globe");
        map.setFog({});

        // Built-in POI click handler
        map.on("click", "poi-label", (e: any) => {
          if (!onPoiClickRef.current || !e.features?.length) return;
          const f = e.features[0];
          const coords = f.geometry?.coordinates;
          const props = f.properties ?? {};
          onPoiClickRef.current({
            name: props.name ?? props.name_en ?? "",
            category: props.category_en ?? props.type ?? undefined,
            maki: props.maki ?? undefined,
            lat: coords?.[1] ?? e.lngLat.lat,
            lng: coords?.[0] ?? e.lngLat.lng,
          });
        });

        map.on("mouseenter", "poi-label", () => {
          if (!onPoiClickRef.current) return;
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "poi-label", () => {
          map.getCanvas().style.cursor = "";
        });

        // 최신 함수로
        syncHighlightLayersRef.current();
        syncMarkersRef.current();

        // 초기 포커스는 “최신 props(ref)” 기준
        const fl = focusLatLngRef.current;
        if (fl) {
          focusOnLatLng(fl.lat, fl.lng);
          return;
        }

        // Prefer fitting all markers so the map covers everything.
        if (fitToCurrentMarkersBounds()) {
          return;
        }

        const first = getFirstValidEntryLatLng();
        if (first) {
          focusOnLatLng(first.lat, first.lng);
          return;
        }

        const cc = countryCodeRef.current;
        if (cc) focusOnCountry(cc);
      });

      markUserInteraction = () => {
        lastUserInteractionAtRef.current = Date.now();
      };
      map.on("dragstart", markUserInteraction);
      map.on("zoomstart", markUserInteraction);
      map.on("rotatestart", markUserInteraction);
      map.on("pitchstart", markUserInteraction);

      let resizeScheduled = false;
      const throttledResize = () => {
        if (resizeScheduled) return;
        resizeScheduled = true;
        requestAnimationFrame(() => {
          resizeScheduled = false;
          try {
            map.resize();
          } catch {}
        });
      };
      ro = new ResizeObserver(throttledResize);
      ro.observe(containerRef.current!);
    })();

    return () => {
      cancelled = true;
      if (ro) ro.disconnect();
      if (map && markUserInteraction) {
        map.off("dragstart", markUserInteraction);
        map.off("zoomstart", markUserInteraction);
        map.off("rotatestart", markUserInteraction);
        map.off("pitchstart", markUserInteraction);
      }
      clearMarkers();
      if (map) map.remove();
      mapRef.current = null;
    };
  }, [
    isMounted,
    initError,
    token,
    clearMarkers,
    focusOnLatLng,
    focusOnCountry,
    fitToCurrentMarkersBounds,
    getFirstValidEntryLatLng,
    loadMapboxGL,
  ]);

  // 데이터/모드 변화 시 마커/하이라이트 동기화는 “map 유지”한 채로만
  useEffect(() => {
    if (mapRef.current?.isStyleLoaded()) syncMarkersRef.current();
  }, [markers, placeMarkers, mode]); // modeRef는 업데이트되지만, 이 effect 트리거를 위해 deps에 둠

  // active marker highlighting should NOT recreate markers; just re-render borders
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const run = () => syncActiveMarkerStylesRef.current();
    if (map.isStyleLoaded()) run();
    else map.once("idle", run);
  }, [activePlaceMarkerId, activeMarkerId]);

  // When the host element changes (portal moves) or layout shifts, force a resize.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const raf = window.requestAnimationFrame(() => {
      try {
        map.resize();
      } catch {}
      // iOS/Safari sometimes needs a second tick after layout settles.
      window.setTimeout(() => {
        try {
          map.resize();
        } catch {}
      }, 60);
    });

    return () => window.cancelAnimationFrame(raf);
  }, [containerResizeKey]);

  useEffect(() => {
    if (mapRef.current?.isStyleLoaded()) syncHighlightLayersRef.current();
  }, [countryStats, worldview]);

  //핵심: lat/lng 들어올 때는 cleanup 없이 "카메라만 이동"
  // Debounce so rapid scrolling doesn't cause jarring map movement.
  useEffect(() => {
    if (!mapRef.current) return;

    if (focusLatLng) {
      // On the very first focus (initial load), move immediately.
      if (!hasEverFocusedToEntryRef.current) {
        focusOnLatLng(focusLatLng.lat, focusLatLng.lng);
        return;
      }

      // Otherwise debounce — wait for scrolling to settle.
      const timer = setTimeout(() => {
        focusOnLatLng(focusLatLng.lat, focusLatLng.lng);
      }, 1500);
      return () => clearTimeout(timer);
    }

    // focusLatLng가 없고, 아직 entry 포커스 한 번도 없으면: 첫 entry or country
    if (!hasEverFocusedToEntryRef.current) {
      if (fitToCurrentMarkersBounds()) {
        return;
      }
      const first = getFirstValidEntryLatLng();
      if (first) {
        focusOnLatLng(first.lat, first.lng);
        return;
      }
      if (countryCode) {
        focusOnCountry(countryCode);
      }
    }
  }, [
    focusLatLng,
    countryCode,
    focusOnLatLng,
    focusOnCountry,
    fitToCurrentMarkersBounds,
    getFirstValidEntryLatLng,
  ]);

  // When markers change (e.g. year filter), refit bounds unless the user just interacted.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (mode === "place") return;

    const run = () => {
      const msSinceUser = Date.now() - lastUserInteractionAtRef.current;
      if (msSinceUser < 2000) return;
      fitToCurrentMarkersBounds();
    };

    if (map.isStyleLoaded()) run();
    else map.once("idle", run);
  }, [markers, mode, fitToCurrentMarkersBounds]);

  // Optional: gently bias toward the active trip marker (e.g. top visible list item).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!activeMarkerId) return;
    if (mode === "place") return;

    const m = markersRef.current.find((x) => x.id === activeMarkerId);
    if (!m || !Number.isFinite(m.lat) || !Number.isFinite(m.lng)) return;

    const run = () => {
      const msSinceUser = Date.now() - lastUserInteractionAtRef.current;
      if (msSinceUser < 700) return;

      const currentZoom = map.getZoom();
      const targetZoom = Math.min(Math.max(currentZoom, 4.75), 10);
      map.easeTo({
        center: [m.lng, m.lat],
        zoom: targetZoom,
        duration: 550,
      });
    };

    if (map.isStyleLoaded()) run();
    else map.once("idle", run);
  }, [activeMarkerId, mode]);

  if (initError) {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {/* Placeholder background */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(1200px 600px at 20% 0%, rgba(249,115,22,0.08), transparent 55%), linear-gradient(180deg, rgba(15,23,42,0.02), rgba(15,23,42,0.06))",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              textAlign: "center",
              color: "rgba(0,0,0,0.35)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Map unavailable
          </div>
        </div>

        <WebGLHelpPopup
          open={showHelpPopup}
          onClose={() => setShowHelpPopup(false)}
        />

        {(overlayTopLeft || overlayTopRight) && (
          <div
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            {overlayTopLeft && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  pointerEvents: "auto",
                }}
              >
                {overlayTopLeft}
              </div>
            )}
            {overlayTopRight && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  pointerEvents: "auto",
                }}
              >
                {overlayTopRight}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div
          style={{ width: "100%", height: "100%", backgroundColor: "#f0f0f0" }}
        />

        {(overlayTopLeft || overlayTopRight) && (
          <div
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            {overlayTopLeft && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  pointerEvents: "auto",
                }}
              >
                {overlayTopLeft}
              </div>
            )}
            {overlayTopRight && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  pointerEvents: "auto",
                }}
              >
                {overlayTopRight}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {(overlayTopLeft || overlayTopRight) && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {overlayTopLeft && (
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                pointerEvents: "auto",
              }}
            >
              {overlayTopLeft}
            </div>
          )}
          {overlayTopRight && (
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                pointerEvents: "auto",
              }}
            >
              {overlayTopRight}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
