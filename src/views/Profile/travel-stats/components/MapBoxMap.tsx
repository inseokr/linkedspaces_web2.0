"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useMemo, useRef } from "react";
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

  // Track marker instances and React roots for proper cleanup
  const markerHandlesRef = useRef<
    {
      id: string;
      marker: mapboxgl.Marker;
      unmount: () => void;
      el: HTMLDivElement;
    }[]
  >([]);

  // Keep latest markers and callbacks in refs to prevent stale closures
  const markersRef = useRef<MarkerData[]>(markers);
  const onMarkerClickRef = useRef<Props["onMarkerClick"]>(onMarkerClick);

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  // Transform highlight ISO codes to uppercase
  const effectiveHighlightIso2 = useMemo(() => {
    return (highlightIso2 ?? []).map((c) => c.toUpperCase());
  }, [highlightIso2]);

  // Hardcoded centers for fallback when geometry query fails
  const fallbackCenterByIso2: Record<string, [number, number]> = {
    US: [-98.5795, 39.8283],
    KR: [127.7669, 35.9078],
    GB: [-3.436, 55.3781],
    CH: [8.2275, 46.8182],
    FR: [2.2137, 46.2276],
  };

  /**
   * Remove all markers and unmount React roots
   */
  const clearMarkers = () => {
    markerHandlesRef.current.forEach((h) => {
      // Remove the Mapbox marker instance immediately
      h.marker.remove();

      // Delay unmounting the React root to avoid the "synchronous unmount" error
      setTimeout(() => {
        h.unmount();
      }, 0);

      h.el.remove();
    });
    markerHandlesRef.current = [];
  };

  /**
   * Synchronize markers based on the current markersRef data
   */
  const syncMarkers = () => {
    const map = mapRef.current;
    if (!map) return;

    if (!map.isStyleLoaded()) {
      map.once("idle", syncMarkers);
      return;
    }

    // Clean up previous markers before adding new ones
    clearMarkers();

    markersRef.current.forEach((m) => {
      if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) return;

      const el = document.createElement("div");
      el.style.cursor = "pointer";

      // Use a stable reference for the click handler
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
        // The fix is here: we wrap the call in the cleanup logic above
        unmount: () => root.unmount(),
      });
    });
  };

  /**
   * Add or update highlight layers for selected countries
   */
  const syncHighlightLayers = () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getSource("countries")) return;

    const disputedOk: any = [
      "any",
      ["==", ["get", "disputed"], false],
      ["==", ["get", "disputed"], "false"],
      ["!", ["has", "disputed"]],
    ];

    const hasHighlight = effectiveHighlightIso2.length > 0;
    const countryFilter = hasHighlight
      ? [
          "all",
          disputedOk,
          ["in", ["get", "iso_3166_1"], ["literal", effectiveHighlightIso2]],
        ]
      : ["all", disputedOk];

    if (map.getLayer("country-highlight-fill")) {
      map.setFilter("country-highlight-fill", countryFilter as any);
      map.setFilter("country-highlight-outline", countryFilter as any);
    } else {
      map.addLayer({
        id: "country-highlight-fill",
        type: "fill",
        source: "countries",
        "source-layer": "country_boundaries",
        filter: countryFilter as any,
        paint: { "fill-color": "#f97316", "fill-opacity": 0.3 },
      });
      map.addLayer({
        id: "country-highlight-outline",
        type: "line",
        source: "countries",
        "source-layer": "country_boundaries",
        filter: countryFilter as any,
        paint: { "line-color": "#ea580c", "line-width": 2.5 },
      });
    }
  };

  /**
   * Focus camera on a specific country using geometry bounds or fallback center
   */
  const focusOnCountry = (iso2: string) => {
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
            if (typeof arr?.[0] === "number" && typeof arr?.[1] === "number") {
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
        /* ignore and use fallback */
      }

      const center = fallbackCenterByIso2[target] || [-98.5795, 39.8283];
      map.easeTo({ center, zoom: 4, duration: 650 });
    };

    if (map.isStyleLoaded()) runFocus();
    else map.once("idle", runFocus);
  };

  // Main Effect: Initialize Mapbox instance
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) throw new Error("NEXT_PUBLIC_MAPBOX_TOKEN is missing");
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-98.5795, 39.8283],
      zoom: 1,
      renderWorldCopies: false,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // UX: Enable scroll zoom only on hover
    map.scrollZoom.disable();
    const el = containerRef.current;
    const onEnter = () => map.scrollZoom.enable();
    const onLeave = () => map.scrollZoom.disable();
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    // Initial load configurations
    map.on("load", () => {
      map.setProjection("globe");
      map.setFog({});
      map.addSource("countries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });

      // Synchronize all visual elements on first load
      syncMarkers();
      syncHighlightLayers();
      if (countryCode) focusOnCountry(countryCode);

      requestAnimationFrame(() => map.resize());
    });

    // Handle style changes and resize
    map.on("styledata", syncHighlightLayers);
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el);

    return () => {
      ro.disconnect();
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      clearMarkers();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Effects for reactive props
  useEffect(() => {
    syncMarkers();
  }, [markers]);
  useEffect(() => {
    syncHighlightLayers();
  }, [effectiveHighlightIso2, worldview]);
  useEffect(() => {
    if (countryCode) focusOnCountry(countryCode);
  }, [countryCode]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
