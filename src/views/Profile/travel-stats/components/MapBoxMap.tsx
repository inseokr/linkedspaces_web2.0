"use client";

import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import CircleTripMarker from "@/views/Profile/recap-blogs/components/CircleTripMarker";

export type MarkerData = {
  id: string;
  lat: number;
  lng: number;
  year: number;
  label: string;
  imageUrl: string;
};

type Props = {
  countryCode?: string;
  highlightIso2?: string[];
  worldview?: string;
  markers?: MarkerData[];
  onMarkerClick?: (markerId: string) => void;
};

export default function MapboxMap({
  countryCode,
  highlightIso2,
  worldview = "US",
  markers = [],
  onMarkerClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerHandlesRef = useRef<any[]>([]);
  const markersRef = useRef(markers);
  const onMarkerClickRef = useRef(onMarkerClick);
  const syncMarkersRef = useRef<() => void>(() => {});

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  const effectiveHighlightIso2 = useMemo(() => {
    return (highlightIso2 ?? []).map((c) => c.toUpperCase());
  }, [highlightIso2]);

  // Moved outside or memoized to avoid dependency warnings
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

  const clearMarkers = useCallback(() => {
    markerHandlesRef.current.forEach((h) => {
      h.marker.remove();
      setTimeout(() => {
        h.unmount();
      }, 0);
      h.el.remove();
    });
    markerHandlesRef.current = [];
  }, []);

  // Fixed Hoisting: Define the function before it's used or use a ref for recursion
  const syncMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!map.isStyleLoaded()) {
      // 변수 이름 대신 Ref를 사용하여 호출함으로써 Hoisting/TDZ 문제 해결
      map.once("idle", () => syncMarkersRef.current());
      return;
    }

    clearMarkers();

    markersRef.current.forEach((m) => {
      if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) return;

      const el = document.createElement("div");
      el.style.cursor = "pointer";
      const handleMarkerClick = (e: MouseEvent) => {
        e.stopPropagation();
        onMarkerClickRef.current?.(m.id);
      };
      el.addEventListener("click", handleMarkerClick);

      const root = createRoot(el);
      root.render(
        <CircleTripMarker
          year={m.year}
          label={m.label}
          imageUrl={m.imageUrl}
        />,
      );

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([m.lng, m.lat])
        .addTo(map);

      markerHandlesRef.current.push({
        id: m.id,
        marker,
        el,
        unmount: () => root.unmount(),
      });
    });
  }, [clearMarkers]);

  useEffect(() => {
    syncMarkersRef.current = syncMarkers;
  }, [syncMarkers]);

  const syncHighlightLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (!map.getSource("countries")) {
      map.addSource("countries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });
    }

    const hasHighlight = effectiveHighlightIso2.length > 0;
    if (!hasHighlight) {
      if (map.getLayer("country-highlight-fill"))
        map.removeLayer("country-highlight-fill");
      if (map.getLayer("country-highlight-outline"))
        map.removeLayer("country-highlight-outline");
      return;
    }

    const countryFilter = [
      "all",
      ["in", ["get", "iso_3166_1"], ["literal", effectiveHighlightIso2]],
      [
        "any",
        ["==", ["get", "worldview"], "all"],
        ["==", ["get", "worldview"], worldview],
      ],
    ];

    if (map.getLayer("country-highlight-fill")) {
      map.setFilter("country-highlight-fill", countryFilter as any);
      map.setFilter("country-highlight-outline", countryFilter as any);
    } else {
      map.addLayer(
        {
          id: "country-highlight-fill",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          filter: countryFilter as any,
          paint: { "fill-color": "#f97316", "fill-opacity": 0.3 },
        },
        "country-label",
      );

      map.addLayer({
        id: "country-highlight-outline",
        type: "line",
        source: "countries",
        "source-layer": "country_boundaries",
        filter: countryFilter as any,
        paint: { "line-color": "#ea580c", "line-width": 2.5 },
      });
    }
  }, [effectiveHighlightIso2, worldview]);

  const focusOnCountry = useCallback(
    (iso2: string) => {
      const map = mapRef.current;
      if (!map) return;
      const target = iso2.toUpperCase();

      const runFocus = () => {
        try {
          const features = map.querySourceFeatures("countries", {
            sourceLayer: "country_boundaries",
            filter: ["==", ["get", "iso_3166_1"], target] as any,
          });

          if (features && features.length > 0) {
            let minX = Infinity,
              minY = Infinity,
              maxX = -Infinity,
              maxY = -Infinity;
            const walk = (arr: any) => {
              if (
                typeof arr?.[0] === "number" &&
                typeof arr?.[1] === "number"
              ) {
                minX = Math.min(minX, arr[0]);
                minY = Math.min(minY, arr[1]);
                maxX = Math.max(maxX, arr[0]);
                maxY = Math.max(maxY, arr[1]);
                return;
              }
              for (const child of arr) walk(child);
            };
            features.forEach((f) => walk((f.geometry as any).coordinates));

            if (Number.isFinite(minX)) {
              map.fitBounds(
                [
                  [minX, minY],
                  [maxX, maxY],
                ],
                { padding: 60, duration: 650, maxZoom: 5 },
              );
              return;
            }
          }
        } catch (e) {
          /* fallback */
        }

        const center = fallbackCenterByIso2[target] || [-98.5795, 39.8283];
        map.easeTo({ center, zoom: 4, duration: 650 });
      };

      if (map.isStyleLoaded()) runFocus();
      else map.once("idle", runFocus);
    },
    [fallbackCenterByIso2],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-98.5795, 39.8283],
      zoom: 1,
      renderWorldCopies: false,
    });

    mapRef.current = map;

    const handleStyleData = () => {
      syncHighlightLayers();
    };

    map.on("load", () => {
      map.setProjection("globe");
      map.setFog({});
      syncHighlightLayers();
      syncMarkers();
      if (countryCode) focusOnCountry(countryCode);
    });

    map.on("styledata", handleStyleData);

    const elForResize = containerRef.current;
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(elForResize);

    return () => {
      ro.disconnect();
      map.off("styledata", handleStyleData);
      clearMarkers();
      map.remove();
      mapRef.current = null;
    };
  }, [
    countryCode,
    focusOnCountry,
    syncHighlightLayers,
    syncMarkers,
    clearMarkers,
  ]);

  useEffect(() => {
    syncMarkers();
  }, [syncMarkers]);
  useEffect(() => {
    syncHighlightLayers();
  }, [syncHighlightLayers]);
  useEffect(() => {
    if (countryCode) focusOnCountry(countryCode);
  }, [countryCode, focusOnCountry]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
