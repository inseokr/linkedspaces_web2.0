// 동적으로 프레임 크기에 따라 카드 개수 조절 가능
//카드 여러개 들어가는 섹션
//ResponsiveRecapGrid.tsx

"use client";

import React from "react";
type CSSSize = number | string;

type Props<T> = {
  items: T[];
  className?: string;
  minCardWidth?: CSSSize;
  maxCardWidth?: CSSSize; // 필요하면 사용
  gapClassName?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey?: (item: T, index: number) => React.Key;
};

function toCssSize(v: CSSSize | undefined, fallback: string) {
  if (v === undefined) return fallback;
  return typeof v === "number" ? `${v}px` : v; // string은 그대로(10vw, clamp, %, px 등)
}

export default function ResponsiveRecapGrid<T>({
  items,
  className = "",
  minCardWidth = 320,
  maxCardWidth,
  gapClassName = "gap-6",
  renderItem,
  getKey,
}: Props<T>) {
  const isSingle = items.length === 1;

  const min = toCssSize(minCardWidth, "320px");
  const max = toCssSize(maxCardWidth, "1fr");

  const containerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isSingle
      ? `minmax(${min}, ${max})`
      : `repeat(auto-fit, minmax(${min}, 1fr))`,
    justifyContent: "center",
  };

  // Enforce 2 columns for multiples by capping the width or using a specific class
  // However, simpler is to just use repeat(auto-fit, minmax(max(300px, 45%), 1fr))
  // to practically force 2 columns on desktop while allowing wrap on mobile.
  if (!isSingle) {
    containerStyle.gridTemplateColumns =
      "repeat(auto-fit, minmax(min(100%, 400px), 1fr))";
    // To ensure it fills the width, we can use 1fr.
    // If there are exactly 2 items, and container is wide, they will grow.
  }

  if (isSingle && maxCardWidth !== undefined) {
    containerStyle.maxWidth =
      typeof maxCardWidth === "number" ? `${maxCardWidth}px` : maxCardWidth;
    containerStyle.margin = "0 auto";
  }

  return (
    <div
      className={["grid", gapClassName, className].join(" ")}
      style={containerStyle}
    >
      {items.map((item, index) => (
        <React.Fragment key={getKey ? getKey(item, index) : index}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
    </div>
  );
}
