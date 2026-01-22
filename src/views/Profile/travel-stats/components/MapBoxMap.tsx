"use client";

// 동적 지도, 드래그, 줌인, 줌아웃 가능
// <MapboxMap highlightIso2=["US","KR"]/> 이렇게 index.tsx에서 강조하고싶은 나라들 넣어주기
"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";

type Props = {
  highlightIso2?: string[]; //여러 alpha-2 코드
  worldview?: string; // 기본 "US"
};

export default function MapboxMap({
  highlightIso2 = ["US"],
  worldview = "US",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // 지도 생성 한 번만
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) throw new Error("NEXT_PUBLIC_MAPBOX_TOKEN is missing");
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-98.5795, 39.8283],
      zoom: 3,
      renderWorldCopies: false, // 무한 맵 안생기게
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // hover 시에만 휠 줌
    map.scrollZoom.disable();
    const el = containerRef.current;
    const onEnter = () => map.scrollZoom.enable();
    const onLeave = () => map.scrollZoom.disable();
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    map.on("load", () => {
      // map.setProjection("mercator"); // 2D 맵으로 받는 코드
      if (!map.getSource("countries")) {
        map.addSource("countries", {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });
      }

      //조건(conditions)만: spread해도 안전
      const baseConditions: any[] = [
        ["==", ["get", "disputed"], "false"],
        [
          "any",
          ["==", ["get", "worldview"], "all"],
          ["in", worldview, ["get", "worldview"]],
        ],
      ];

      //여러 국가 필터: in + literal
      const isoFilter =
        highlightIso2 && highlightIso2.length > 0
          ? ["in", ["get", "iso_3166_1"], ["literal", highlightIso2]]
          : null;

      const countryFilter: any[] = isoFilter
        ? ["all", ...baseConditions, isoFilter]
        : ["all", ...baseConditions];

      if (!map.getLayer("country-highlight-fill")) {
        map.addLayer({
          id: "country-highlight-fill",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          filter: countryFilter,
          paint: {
            "fill-color": "#f97316",
            "fill-opacity": 0.3,
          },
        });
      }

      if (!map.getLayer("country-highlight-outline")) {
        map.addLayer({
          id: "country-highlight-outline",
          type: "line",
          source: "countries",
          "source-layer": "country_boundaries",
          filter: countryFilter,
          paint: {
            "line-color": "#ea580c",
            "line-width": 2.5,
          },
        });
      }
    });

    mapRef.current = map;

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 필터만 업데이트 (국가/월드뷰 바뀔 때)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyFilter = () => {
      if (!map.getLayer("country-highlight-fill")) return;

      const baseConditions: any[] = [
        ["==", ["get", "disputed"], "false"],
        [
          "any",
          ["==", ["get", "worldview"], "all"],
          ["in", worldview, ["get", "worldview"]],
        ],
      ];

      const isoFilter =
        highlightIso2 && highlightIso2.length > 0
          ? ["in", ["get", "iso_3166_1"], ["literal", highlightIso2]]
          : null;

      const countryFilter: any[] = isoFilter
        ? ["all", ...baseConditions, isoFilter]
        : ["all", ...baseConditions];

      map.setFilter("country-highlight-fill", countryFilter);
      map.setFilter("country-highlight-outline", countryFilter);
    };

    if (map.isStyleLoaded()) applyFilter();
    else map.once("load", applyFilter);
  }, [highlightIso2, worldview]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
