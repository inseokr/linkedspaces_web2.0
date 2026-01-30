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
};

export interface CountryStat {
  code: string;
  value: number;
}

//props = 입력
type Props = {
  countryCode?: string; // 지도 focus 결정
  highlightIso2?: string[];
  countryStats?: CountryStat[]; // 채색할 데이터
  worldview?: string;
  focusLatLng?: { lat: number; lng: number };
  mode?: "place"; //mode 없으면 circle, mode="place"면 place

  // circle markers
  markers?: MarkerData[];
  onMarkerClick?: (markerId: string) => void;

  // place markers
  placeMarkers?: MarkerData[];
  onPlaceMarkerClick?: (markerId: string) => void;
};

// React로 만든 동그란 사진 마커
function PlaceMarker({
  imageUrl,
  size = 72,
}: {
  imageUrl: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        overflow: "hidden",
        border: "3px solid rgba(255,255,255,0.9)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
        background: "rgba(0,0,0,0.05)",
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
  );
}

const PLACE_PATH_SOURCE_ID = "place-path-src";
const PLACE_PATH_LAYER_ID = "place-path-layer";

export default function MapboxMap({
  countryCode,
  countryStats = [],
  worldview = "US",

  mode, //undefined => circle / "place" => place
  focusLatLng,
  markers = [],
  onMarkerClick,

  placeMarkers = [],
  onPlaceMarkerClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // 마커 핸들(기존)
  const markerHandlesRef = useRef<any[]>([]);

  // refs
  const markersRef = useRef(markers);
  const placeMarkersRef = useRef(placeMarkers);
  const modeRef = useRef(mode);

  const focusLatLngRef = useRef<Props["focusLatLng"]>(focusLatLng);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onPlaceMarkerClickRef = useRef(onPlaceMarkerClick);

  const syncMarkersRef = useRef<() => void>(() => {});

  // Ref: 한번 만든 걸 계속 들고 있는 상자
  // 지도 객체는 계속 만들면 부하 많이 걸림
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  useEffect(() => {
    placeMarkersRef.current = placeMarkers;
  }, [placeMarkers]);
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

  // 마커/점선 지우는 함수
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
    //place 모드에서만 쓰지만, 안전하게 항상 제거 시도
    clearPlacePath();
  }, [clearPlacePath]);

  // 점선 경로 그리기
  const syncPlacePath = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const coords = placeMarkersRef.current
      .filter((m) => Number.isFinite(m.lng) && Number.isFinite(m.lat))
      .map((m) => [m.lng, m.lat]);

    // 2개 미만이면 라인 없음
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

    // source 있으면 data만 갱신
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

      //주황 점선
      map.addLayer({
        id: PLACE_PATH_LAYER_ID,
        type: "line",
        source: PLACE_PATH_SOURCE_ID,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#F97316", // 주황
          "line-width": 6,
          "line-opacity": 0.9,
          "line-dasharray": [2, 2], // 점선
        },
      });
    }
  }, [clearPlacePath]);

  // 기존 syncMarkers를 "mode 기준"으로 확장 - UI 컴포넌트 2개 사용하기 위함

  const syncMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.isStyleLoaded()) {
      map.once("idle", () => syncMarkersRef.current());
      return;
    }
    clearMarkers();
    const isPlaceMode = mode === "place";

    if (isPlaceMode) {
      //place markers 렌더
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
        root.render(<PlaceMarker imageUrl={m.imageUrl} size={72} />);

        // circle UI라서 center anchor가 더 자연스러움
        const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([m.lng, m.lat])
          .addTo(map);

        markerHandlesRef.current.push({
          id: m.id,
          marker,
          el,
          unmount: () => root.unmount(),
        });
      });

      //생성 순서대로 점선 연결
      syncPlacePath();
      return;
    }

    //circle markers (기존 그대로)
    markersRef.current.forEach((m) => {
      if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) return;
      const el = document.createElement("div");
      el.style.cursor = "pointer";
      // <<<<<<< HEAD

      //       const handleMarkerClick = (e: MouseEvent) => {
      // =======
      el.addEventListener("click", (e) => {
        // >>>>>>> origin/develop
        e.stopPropagation();
        onMarkerClickRef.current?.(m.id);
      });
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
  }, [clearMarkers, mode, syncPlacePath]);

  useEffect(() => {
    syncMarkersRef.current = syncMarkers;
  }, [syncMarkers]);

  // 나라 채색 하이라이트 레이어
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
      // <<<<<<< HEAD
      fillColorExpression.push(stat.code);
      fillColorExpression.push(`rgba(249, 115, 22, ${opacity})`);
    });

    fillColorExpression.push("rgba(0, 0, 0, 0)");

    // =======
    //       fillColorExpression.push(stat.code, `rgba(249, 115, 22, ${opacity})`);
    //     });
    //     fillColorExpression.push("rgba(0, 0, 0, 0)");
    // >>>>>>> origin/develop
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

  // 특정 국가로 카메라 이동시키는 함수
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
          // <<<<<<< HEAD

          //           if (features && features.length > 0) {
          //             let minX = Infinity,
          //               minY = Infinity,
          //               maxX = -Infinity,
          //               maxY = -Infinity;

          // =======
          if (features?.length > 0) {
            let [minX, minY, maxX, maxY] = [
              Infinity,
              Infinity,
              -Infinity,
              -Infinity,
            ];
            // >>>>>>> origin/develop
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
            map.fitBounds(
              [
                [minX, minY],
                [maxX, maxY],
              ],
              { padding: 60, duration: 650, maxZoom: 5 },
            );
            return;
          }
          // <<<<<<< HEAD
          //         } catch {
          //           /* fallback */
          //         }

          //         const center = fallbackCenterByIso2[target] || [-98.5795, 39.8283];
          //         map.easeTo({ center, zoom: 4, duration: 650 });
          // =======
        } catch (e) {}
        map.easeTo({
          center: fallbackCenterByIso2[iso2.toUpperCase()] || [
            -98.5795, 39.8283,
          ],
          zoom: 4,
          duration: 650,
        });
        // >>>>>>> origin/develop
      };
      if (map.isStyleLoaded()) runFocus();
      else map.once("idle", runFocus);
    },
    [fallbackCenterByIso2],
  );
  // 지도 생성/이벤트/정리 흐름
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
      center: [-98.5795, 39.8283],
      zoom: 1,
      renderWorldCopies: false,
    });

    mapRef.current = map;

    // add 0129
    // const handleStyleData = () => {
    //   syncHighlightLayers();
    //   // style이 바뀌면 커스텀 source/layer가 날아갈 수 있어서,
    //   // 현재 mode에 맞춰 마커/라인도 재동기화
    //   syncMarkersRef.current();
    // };
    map.on("load", () => {
      map.setProjection("globe");
      map.setFog({});
      syncHighlightLayers();
      syncMarkers();
      if (countryCode) focusOnCountry(countryCode);
    });

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      clearMarkers();
      map.remove();
      mapRef.current = null;
    };
  }, [
    isMounted,
    countryCode,
    focusOnCountry,
    syncHighlightLayers,
    syncMarkers,
    clearMarkers,
  ]);

  //데이터/모드 변화 시 동일 함수로 재동기화
  useEffect(() => {
    if (mapRef.current?.isStyleLoaded()) syncMarkers();
  }, [syncMarkers]);

  useEffect(() => {
    if (mapRef.current?.isStyleLoaded()) syncHighlightLayers();
  }, [syncHighlightLayers]);

  useEffect(() => {
    if (countryCode) focusOnCountry(countryCode);
  }, [countryCode, focusOnCountry]);

  // 3. SSR 방지를 위한 마운트 체크 분기
  if (!isMounted) {
    return (
      <div
        style={{ width: "100%", height: "100%", backgroundColor: "#f0f0f0" }}
      />
    );
  }

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
