// views/Contact/components/SectionOverlay.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  opacity?: number;
  extraBottomPx?: number;
  children: React.ReactNode;
};

export default function SectionOverlayFromRefToDocumentEnd({
  opacity = 0.65,
  extraBottomPx = 200,
  children,
}: Props) {
  const startRef = useRef<HTMLDivElement | null>(null);
  const [topPx, setTopPx] = useState<number | null>(null);
  const [heightPx, setHeightPx] = useState<number | null>(null);

  const recompute = () => {
    const el = startRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const startY = window.scrollY + rect.top;
    const docHeight = document.documentElement.scrollHeight;

    setTopPx(startY);
    setHeightPx(Math.max(0, docHeight - startY + extraBottomPx));
  };

  useEffect(() => {
    recompute();

    window.addEventListener("resize", recompute);
    const ro = new ResizeObserver(() => recompute());
    ro.observe(document.documentElement);

    return () => {
      window.removeEventListener("resize", recompute);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={startRef} className="relative">
      {topPx !== null &&
        heightPx !== null &&
        createPortal(
          <div
            className="pointer-events-none absolute left-0 right-0 z-[9000]"
            style={{
              top: `${topPx}px`,
              height: `${heightPx}px`,
              backgroundColor: `rgba(255, 255, 255, ${opacity})`,
            }}
            aria-hidden="true"
          />,
          document.body,
        )}

      {/* Make sure content is above overlay */}
      <div className="relative z-[9100]">{children}</div>
    </div>
  );
}
