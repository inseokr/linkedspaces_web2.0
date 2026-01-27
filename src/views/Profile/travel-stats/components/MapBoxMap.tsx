"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import CircleTripMarker from "@/views/Profile/recap-blogs/components/CircleTripMarker";

type MarkerData = {
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

  const markerHandlesRef = useRef<
    {
      id: string;
      marker: mapboxgl.Marker;
      unmount: () => void;
      el: HTMLDivElement;
    }[]
  >([]);

  const effectiveHighlightIso2 = useMemo(() => {
    return (highlightIso2 ?? []).map((c) => c.toUpperCase());
  }, [highlightIso2]);

  const fallbackCenterByIso2: Record<string, [number, number]> = {
    US: [-98.5795, 39.8283],
    KR: [127.7669, 35.9078],
    GB: [-3.436, 55.3781],
    CH: [8.2275, 46.8182],
    FR: [2.2137, 46.2276],
  };

  const buildCountryFilter = (iso2List: string[]) => {
    // disputed: false(boolean) / "false"(string) / missing 모두 허용
    const disputedOk: any = [
      "any",
      ["==", ["get", "disputed"], false],
      ["==", ["get", "disputed"], "false"],
      ["!", ["has", "disputed"]],
    ];

    if (!iso2List || iso2List.length === 0) {
      return ["all", disputedOk];
    }

    // iso_3166_1 값이 목록에 포함되는지
    const isoFilter: any = ["in", ["get", "iso_3166_1"], ["literal", iso2List]];

    return ["all", disputedOk, isoFilter];
  };

  const removeHighlightLayers = (map: mapboxgl.Map) => {
    if (map.getLayer("country-highlight-outline")) {
      map.removeLayer("country-highlight-outline");
    }
    if (map.getLayer("country-highlight-fill")) {
      map.removeLayer("country-highlight-fill");
    }
  };

  const syncHighlightLayers = () => {
    const map = mapRef.current;
    if (!map) return;

    // style이 없으면 addLayer 불가
    if (!map.isStyleLoaded()) return;

    // 소스가 없거나 아직 로드 전이면 기다렸다가 이벤트에서 다시 호출
    if (!map.getSource("countries")) return;
    if (!map.isSourceLoaded("countries")) return;

    const hasHighlight = effectiveHighlightIso2.length > 0;

    if (!hasHighlight) {
      removeHighlightLayers(map);
      return;
    }

    const countryFilter = buildCountryFilter(effectiveHighlightIso2);

    // 이미 레이어가 있으면 필터만 갱신
    if (map.getLayer("country-highlight-fill")) {
      map.setFilter("country-highlight-fill", countryFilter as any);
      map.setFilter("country-highlight-outline", countryFilter as any);
      return;
    }

    // 없으면 생성 (fill 먼저, outline 나중)
    map.addLayer({
      id: "country-highlight-fill",
      type: "fill",
      source: "countries",
      "source-layer": "country_boundaries",
      filter: countryFilter as any,
      paint: {
        "fill-color": "#f97316",
        "fill-opacity": 0.4,
      },
    });

    map.addLayer({
      id: "country-highlight-outline",
      type: "line",
      source: "countries",
      "source-layer": "country_boundaries",
      filter: countryFilter as any,
      paint: {
        "line-color": "#ea580c",
        "line-width": 3,
        "line-opacity": 0.8,
      },
    });

    // 디버그: 진짜 매칭되는지 확인 (0이면 iso 코드 불일치 가능성 큼)
    const hits = map.querySourceFeatures("countries", {
      sourceLayer: "country_boundaries",
      filter: countryFilter as any,
    });
    console.log("highlightIso2:", effectiveHighlightIso2, "hits:", hits.length);
  };

  const focusOnCountry = (iso2: string) => {
    const map = mapRef.current;
    if (!map) return;

    const target = iso2.toUpperCase();

    const center = fallbackCenterByIso2[target] ??
      fallbackCenterByIso2[worldview.toUpperCase()] ?? [-98.5795, 39.8283];

    map.easeTo({ center, zoom: 4, duration: 650 });
  };

  const syncMarkers = () => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.isStyleLoaded()) return;

    for (const h of markerHandlesRef.current) {
      h.marker.remove();
      h.unmount();
      h.el.remove();
    }
    markerHandlesRef.current = [];

    for (const m of markers) {
      const el = document.createElement("div");

      if (onMarkerClick) {
        el.style.cursor = "pointer";
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onMarkerClick(m.id);
        });
      }

      const root = createRoot(el);
      root.render(
        <CircleTripMarker
          year={m.year}
          label={m.label}
          imageUrl={m.imageUrl}
        />,
      );

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat([m.lng, m.lat])
        .addTo(map);

      markerHandlesRef.current.push({
        id: m.id,
        marker,
        el,
        unmount: () => root.unmount(),
      });
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) throw new Error("NEXT_PUBLIC_MAPBOX_TOKEN is missing");
    mapboxgl.accessToken = token;

    const initialCenter = (countryCode &&
      fallbackCenterByIso2[countryCode.toUpperCase()]) ||
      fallbackCenterByIso2[worldview.toUpperCase()] || [-98.5795, 39.8283];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenter,
      zoom: 1,
      renderWorldCopies: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.scrollZoom.disable();
    const el = containerRef.current;
    const onEnter = () => map.scrollZoom.enable();
    const onLeave = () => map.scrollZoom.disable();
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el);

    map.on("load", () => {
      map.setProjection("globe");
      map.setFog({});

      if (!map.getSource("countries")) {
        map.addSource("countries", {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });
      }

      // 로드 직후 한 번 시도
      syncHighlightLayers();
      syncMarkers();

      if (countryCode) {
        focusOnCountry(countryCode);
      }
    });

    // 소스 로드/스타일 변화 때마다 재시도 (여기서 타이밍 문제 해결)
    map.on("sourcedata", (e) => {
      if (e.sourceId === "countries" && e.isSourceLoaded) {
        syncHighlightLayers();
      }
    });

    map.on("styledata", () => {
      // 스타일이 바뀌면 레이어가 날아갈 수 있으니 재동기화
      syncHighlightLayers();
    });

    mapRef.current = map;

    return () => {
      ro.disconnect();
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);

      for (const h of markerHandlesRef.current) {
        h.marker.remove();
        h.unmount();
        h.el.remove();
      }
      markerHandlesRef.current = [];

      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 소스/스타일 준비 타이밍을 이벤트가 해결해주지만,
    // props 변경 즉시 한 번 더 시도해주면 반응성 좋아짐
    syncHighlightLayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveHighlightIso2, worldview]);

  useEffect(() => {
    if (!countryCode) return;
    focusOnCountry(countryCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!map.isStyleLoaded()) {
      map.once("load", () => syncMarkers());
      return;
    }
    syncMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, onMarkerClick]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
