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
  maxCardWidth, // optional
  gapClassName = "gap-6",
  renderItem,
  getKey,
}: Props<T>) {
  // const maxPart = maxCardWidth ? `${maxCardWidth}px` : "1fr";

  const min = toCssSize(minCardWidth, "320px");
  const max =
    maxCardWidth !== undefined ? toCssSize(maxCardWidth, "1fr") : "1fr";

  return (
    <div
      className={["grid", gapClassName, className].join(" ")}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}, ${max}))`,
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={getKey ? getKey(item, index) : index}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
    </div>
  );
}
