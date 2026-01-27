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

  // ✅ 추가: 지도 위 마커들
  markers?: MarkerData[];

  // (옵션) 마커 클릭
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

  // ✅ 마커 인스턴스/언마운트 핸들 보관
  const markerHandlesRef = useRef<
    {
      id: string;
      marker: mapboxgl.Marker;
      unmount: () => void;
      el: HTMLDivElement;
    }[]
  >([]);

  /** 강조는 highlightIso2로만 결정 */
  const effectiveHighlightIso2 = useMemo(() => {
    return (highlightIso2 ?? []).map((c) => c.toUpperCase());
  }, [highlightIso2]);

  // countryCode를 화면 중앙(가까운 줌)으로 맞추기 위한 간단 fallback center
  const fallbackCenterByIso2: Record<string, [number, number]> = {
    US: [-98.5795, 39.8283],
    KR: [127.7669, 35.9078],
    GB: [-3.436, 55.3781],
    CH: [8.2275, 46.8182],
    FR: [2.2137, 46.2276],
  };

  // 공통 filter 빌더
  const buildCountryFilter = (iso2List: string[], worldviewValue: string) => {
    const baseConditions: any[] = [["==", ["get", "disputed"], "false"]];
    const isoFilter =
      iso2List?.length > 0
        ? ["in", ["get", "iso_3166_1"], ["literal", iso2List]]
        : null;

    return isoFilter
      ? ["all", ...baseConditions, isoFilter]
      : ["all", ...baseConditions];
  };

  /** 하이라이트 레이어 추가/업데이트/제거를 한 곳에서 관리 */
  const syncHighlightLayers = () => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.isStyleLoaded()) return;

    const hasHighlight = effectiveHighlightIso2.length > 0;

    if (!hasHighlight) {
      if (map.getLayer("country-highlight-fill"))
        map.removeLayer("country-highlight-fill");
      if (map.getLayer("country-highlight-outline"))
        map.removeLayer("country-highlight-outline");
      return;
    }

    const countryFilter = buildCountryFilter(effectiveHighlightIso2, worldview);

    if (map.getLayer("country-highlight-fill")) {
      map.setFilter("country-highlight-fill", countryFilter);
      map.setFilter("country-highlight-outline", countryFilter);
      return;
    }

    if (!map.getSource("countries")) return;

    map.addLayer({
      id: "country-highlight-fill",
      type: "fill",
      source: "countries",
      "source-layer": "country_boundaries",
      filter: countryFilter,
      paint: { "fill-color": "#f97316", "fill-opacity": 0.3 },
    });

    map.addLayer({
      id: "country-highlight-outline",
      type: "line",
      source: "countries",
      "source-layer": "country_boundaries",
      filter: countryFilter,
      paint: { "line-color": "#ea580c", "line-width": 2.5 },
    });
  };

  // “선택 국가”로 카메라 맞추기: 가능하면 bounds로 fit, 아니면 fallback center
  const focusOnCountry = (iso2: string) => {
    const map = mapRef.current;
    if (!map) return;

    const target = iso2.toUpperCase();

    const run = () => {
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

          for (const f of features) {
            const g: any = f.geometry;
            if (!g) continue;

            const coords: any[] = g.coordinates;

            const walk = (arr: any) => {
              if (typeof arr[0] === "number" && typeof arr[1] === "number") {
                const [x, y] = arr as [number, number];
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
                return;
              }
              for (const child of arr) walk(child);
            };

            walk(coords);
          }

          if (
            Number.isFinite(minX) &&
            Number.isFinite(minY) &&
            Number.isFinite(maxX) &&
            Number.isFinite(maxY)
          ) {
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
      } catch {
        // ignore and fallback
      }

      const center = fallbackCenterByIso2[target] ??
        fallbackCenterByIso2[worldview.toUpperCase()] ?? [-98.5795, 39.8283];

      map.easeTo({ center, zoom: 4, duration: 650 });
    };

    if (!map.isStyleLoaded()) {
      map.once("load", run);
      map.once("styledata", run);
      return;
    }

    run();
  };

  /** ✅ 마커 동기화: 기존 제거 → 새로 생성 */
  const syncMarkers = () => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.isStyleLoaded()) return;

    // 1) 기존 마커 제거 + React 언마운트
    for (const h of markerHandlesRef.current) {
      h.marker.remove();
      h.unmount();
      h.el.remove(); // 안전하게 DOM 제거
    }
    markerHandlesRef.current = [];

    // 2) 새 마커 생성
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

  // 최초 map 생성 (1회)
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

    // hover 시에만 휠 줌
    map.scrollZoom.disable();
    const el = containerRef.current;
    const onEnter = () => map.scrollZoom.enable();
    const onLeave = () => map.scrollZoom.disable();
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    // 컨테이너 크기 변하면 지도 리사이즈
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

      syncHighlightLayers();

      // 초기 마커도 로드 시점에 찍기
      syncMarkers();

      if (countryCode) {
        focusOnCountry(countryCode.toUpperCase());
      }
    });

    mapRef.current = map;

    return () => {
      ro.disconnect();
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);

      // 마커 정리
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
  }, []); // 1회만 생성

  /** highlightIso2/worldview 변경 시: 강조 레이어 동기화 */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    syncHighlightLayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveHighlightIso2, worldview]);

  /** countryCode 바뀌면 이동만 */
  useEffect(() => {
    if (!countryCode) return;
    focusOnCountry(countryCode.toUpperCase());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  /** markers 바뀌면 마커 다시 싱크 */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const run = () => syncMarkers();

    // 아직 load 전이면 로드 후 실행
    if (!map.isStyleLoaded()) {
      map.once("load", run);
      return;
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, onMarkerClick]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
