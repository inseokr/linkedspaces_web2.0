"use client";

// 동적 지도, 드래그, 줌인, 줌아웃 가능
// <MapboxMap highlightIso2=["US","KR"]/> 이렇게 index.tsx에서 강조하고싶은 나라들 넣어주기
// <MapboxMap highlightIso2=["US","KR"] worldview="US"/> 이러면 맵의 중심에 오게 될 나라 설정 가능

"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";

type Props = {
  highlightIso2?: string[];
  worldview?: string;
};

export default function MapboxMap({
  highlightIso2 = ["US"],
  worldview = "US",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

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

    //컨테이너 크기 변하면 지도 리사이즈
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el);

    map.on("load", () => {
      map.setProjection("mercator"); // 2D

      if (!map.getSource("countries")) {
        map.addSource("countries", {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });
      }

      const baseConditions: any[] = [["==", ["get", "disputed"], "false"]];

      const countryFilter: any[] = [
        "all",
        ...baseConditions,
        ["in", ["get", "iso_3166_1"], ["literal", highlightIso2]],
      ];

      if (!map.getLayer("country-highlight-fill")) {
        map.addLayer({
          id: "country-highlight-fill",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          filter: countryFilter,
          paint: { "fill-color": "#f97316", "fill-opacity": 0.3 },
        });
      }

      if (!map.getLayer("country-highlight-outline")) {
        map.addLayer({
          id: "country-highlight-outline",
          type: "line",
          source: "countries",
          "source-layer": "country_boundaries",
          filter: countryFilter,
          paint: { "line-color": "#ea580c", "line-width": 2.5 },
        });
      }
    });

    mapRef.current = map;

    return () => {
      ro.disconnect(); //추가
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

    const baseConditions: any[] = [
      ["==", ["get", "disputed"], "false"],
      [
        "any",
        ["==", ["get", "worldview"], "all"],
        ["in", worldview, ["get", "worldview"]],
      ],
    ];

    const isoFilter = highlightIso2?.length
      ? ["in", ["get", "iso_3166_1"], ["literal", highlightIso2]]
      : null;

    const countryFilter: any[] = isoFilter
      ? ["all", ...baseConditions, isoFilter]
      : ["all", ...baseConditions];

    if (map.getLayer("country-highlight-fill")) {
      map.setFilter("country-highlight-fill", countryFilter);
      map.setFilter("country-highlight-outline", countryFilter);
    }
  }, [highlightIso2, worldview]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
