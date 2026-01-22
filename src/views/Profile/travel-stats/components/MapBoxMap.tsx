"use client";

//동적 지도, 드래그, 줌인, 줌아웃 가능

import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";

export default function MapboxMap() {
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
      center: [-98.5795, 39.8283], // USA center (lng, lat)
      zoom: 3,
    });

    // 줌/회전 버튼
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // 지도 위에 올렸을 때만 휠 줌 활성화
    map.scrollZoom.disable();
    const el = containerRef.current;
    const onEnter = () => map.scrollZoom.enable();
    const onLeave = () => map.scrollZoom.disable();
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    mapRef.current = map;

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
