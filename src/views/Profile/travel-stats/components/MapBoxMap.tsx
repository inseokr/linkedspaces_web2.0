// 나라별로 색을 칠해서 하이라이트
//마커 찍기 (모드 2가지)
// place 모드에서는 마커들을 점선으로 연결
// 특정 국가로 카메라 자동 이동

"use client";

import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import CircleTripMarker from "@/views/Profile/recap-blogs/components/CircleTripMarker";

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

  focusLatLng?: { lat: number; lng: number };

  mode?: "place";

  markers?: MarkerData[];
  onMarkerClick?: (markerId: string) => void;
  activeMarkerId?: string;

  placeMarkers?: MarkerData[];
  onPlaceMarkerClick?: (markerId: string) => void;
  activePlaceMarkerId?: string;
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
        <img
          src={imageUrl}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
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

export default function MapboxMap({
  countryCode,
  countryStats = [],
  worldview = "US",

  mode,
  focusLatLng,

  markers = [],
  onMarkerClick,
  activeMarkerId,

  placeMarkers = [],
  onPlaceMarkerClick,
  activePlaceMarkerId,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // handles
  const markerHandlesRef = useRef<any[]>([]);

  // refs (latest props/data)
  const markersRef = useRef(markers);
  const placeMarkersRef = useRef(placeMarkers);
  const modeRef = useRef(mode);
  const activeMarkerIdRef = useRef<Props["activeMarkerId"]>(activeMarkerId);
  const activePlaceMarkerIdRef =
    useRef<Props["activePlaceMarkerId"]>(activePlaceMarkerId);

  const focusLatLngRef = useRef<Props["focusLatLng"]>(focusLatLng);
  const countryCodeRef = useRef<Props["countryCode"]>(countryCode);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onPlaceMarkerClickRef = useRef(onPlaceMarkerClick);

  const syncMarkersRef = useRef<() => void>(() => {});
  const syncActiveMarkerStylesRef = useRef<() => void>(() => {});
  const syncHighlightLayersRef = useRef<() => void>(() => {});

  // “한 번이라도 entry로 포커스를 준 적 있는지”
  const hasEverFocusedToEntryRef = useRef(false);
  const lastUserInteractionAtRef = useRef<number>(0);

  const [isMounted, setIsMounted] = useState(false);
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
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  useEffect(() => {
    onPlaceMarkerClickRef.current = onPlaceMarkerClick;
  }, [onPlaceMarkerClick]);

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

    const runFocus = () => {
      map.stop();

      const dLat = 0.02;
      const dLng = 0.02;

      map.fitBounds(
        [
          [lng - dLng, lat - dLat],
          [lng + dLng, lat + dLat],
        ],
        { padding: 60, duration: 650, maxZoom: 12 },
      );

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
      setTimeout(() => h.unmount(), 0);
      h.el.remove();
    });
    markerHandlesRef.current = [];
    clearPlacePath();
  }, [clearPlacePath]);

  const syncPlacePath = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

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
      | mapboxgl.GeoJSONSource
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
          "line-width": 6,
          "line-opacity": 0.9,
          "line-dasharray": [2, 2],
        },
      });
    }
  }, [clearPlacePath]);

  const syncMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!map.isStyleLoaded()) {
      map.once("idle", () => syncMarkersRef.current());
      return;
    }

    clearMarkers();

    const isPlaceMode = modeRef.current === "place";

    if (isPlaceMode) {
      placeMarkersRef.current.forEach((m) => {
        if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) return;

        const el = document.createElement("div");
        el.style.cursor = "pointer";

        const handleClick = (e: MouseEvent) => {
          e.stopPropagation();
          onPlaceMarkerClickRef.current?.(m.id);
        };
        el.addEventListener("click", handleClick);

        const root = createRoot(el);
        const render = (isActive: boolean) => {
          root.render(
            <PlaceMarker
              imageUrl={m.imageUrl}
              size={72}
              isActive={isActive}
              visitIndex={m.visitIndex}
              visitTimeText={m.visitTimeText}
            />,
          );
        };

        const isActiveAtCreate = m.id === activePlaceMarkerIdRef.current;
        render(isActiveAtCreate);
        el.style.zIndex = isActiveAtCreate ? "10" : "0";

        const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([m.lng, m.lat])
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
  }, [clearMarkers, syncPlacePath]);

  useEffect(() => {
    syncMarkersRef.current = syncMarkers;
  }, [syncMarkers]);

  const syncActiveMarkerStyles = useCallback(() => {
    const activePlaceId = activePlaceMarkerIdRef.current;
    const activeTripId = activeMarkerIdRef.current;

    markerHandlesRef.current.forEach((h) => {
      if (h?.kind === "place" && typeof h?.render === "function") {
        const isActive = h.id === activePlaceId;
        h.render(isActive);

        // Ensure highlighted marker is visually on top
        if (h?.el) {
          h.el.style.zIndex = isActive ? "10" : "0";
          if (isActive && h.el.parentElement) {
            h.el.parentElement.appendChild(h.el);
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
  }, [countryStats, worldview]);

  useEffect(() => {
    syncHighlightLayersRef.current = syncHighlightLayers;
  }, [syncHighlightLayers]);

  const focusOnCountry = useCallback(
    (iso2: string) => {
      const map = mapRef.current;
      if (!map) return;

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
            map.fitBounds(
              [
                [minX, minY],
                [maxX, maxY],
              ],
              { padding: 60, duration: 650, maxZoom: 5 },
            );
            return;
          }
        } catch {}

        map.stop();
        map.easeTo({
          center: fallbackCenterByIso2[iso2.toUpperCase()] || [
            -98.5795, 39.8283,
          ],
          zoom: 4,
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
    if (!isMounted || !containerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("Mapbox token missing!");
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-98.5795, 39.8283], // 초기값(미국)이어도 OK: 이후 카메라 effect가 자연스럽게 이동시킴
      zoom: 1,
      renderWorldCopies: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.setProjection("globe");
      map.setFog({});

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

    const markUserInteraction = () => {
      lastUserInteractionAtRef.current = Date.now();
    };
    map.on("dragstart", markUserInteraction);
    map.on("zoomstart", markUserInteraction);
    map.on("rotatestart", markUserInteraction);
    map.on("pitchstart", markUserInteraction);

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.off("dragstart", markUserInteraction);
      map.off("zoomstart", markUserInteraction);
      map.off("rotatestart", markUserInteraction);
      map.off("pitchstart", markUserInteraction);
      clearMarkers();
      map.remove();
      mapRef.current = null;
    };
  }, [
    isMounted,
    clearMarkers,
    focusOnLatLng,
    focusOnCountry,
    fitToCurrentMarkersBounds,
    getFirstValidEntryLatLng,
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

  useEffect(() => {
    if (mapRef.current?.isStyleLoaded()) syncHighlightLayersRef.current();
  }, [countryStats, worldview]);

  //핵심: lat/lng 들어올 때는 cleanup 없이 “카메라만 이동”
  useEffect(() => {
    if (!mapRef.current) return;

    if (focusLatLng) {
      focusOnLatLng(focusLatLng.lat, focusLatLng.lng);
      return;
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

  if (!isMounted) {
    return (
      <div
        style={{ width: "100%", height: "100%", backgroundColor: "#f0f0f0" }}
      />
    );
  }

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
