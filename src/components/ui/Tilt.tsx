"use client";

import React, { useRef } from "react";

type TiltProps = {
  children: React.ReactNode;
  maxTiltDeg?: number; // 최대 기울기 각도
  perspectivePx?: number; // 원근감
  scale?: number; // 살짝 확대(입체감)
  className?: string;
};

export default function Tilt({
  children,
  maxTiltDeg = 10,
  perspectivePx = 900,
  scale = 1.02,
  className = "",
}: TiltProps) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setTransform = (rx: number, ry: number, withTransition: boolean) => {
    const el = targetRef.current;
    if (!el) return;
    el.style.transition = withTransition
      ? "transform 180ms ease"
      : "transform 0ms";
    el.style.transform = `perspective(${perspectivePx}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const el = targetRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0~1 :contentReference[oaicite:2]{index=2}
    const y = (e.clientY - rect.top) / rect.height; // 0~1 :contentReference[oaicite:3]{index=3}

    const dx = x - 0.5; // -0.5 ~ 0.5
    const dy = y - 0.5;

    const ry = dx * maxTiltDeg * 2; // 좌우 기울기
    const rx = -dy * maxTiltDeg * 2; // 상하 기울기(위로 가면 앞으로 기울게)

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      // mousemove/pointermove는 이벤트가 매우 자주 와서 rAF로 묶는 게 부드러움 :contentReference[oaicite:4]{index=4}
      setTransform(rx, ry, false);
    });
  };

  const onEnter = () => {
    if (prefersReducedMotion) return;
    const el = targetRef.current;
    if (!el) return;
    el.style.willChange = "transform";
  };

  const onLeave = () => {
    if (prefersReducedMotion) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTransform(0, 0, true);
    const el = targetRef.current;
    if (el) el.style.willChange = "auto";
  };

  return (
    <div
      className={className}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div ref={targetRef}>{children}</div>
    </div>
  );
}
