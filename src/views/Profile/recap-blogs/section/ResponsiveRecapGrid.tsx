// 동적으로 프레임 크기에 따라 카드 개수 조절 가능
//카드 여러개 들어가는 섹션
//ResponsiveRecapGrid.tsx

"use client";

import React from "react";

type Props<T> = {
  items: T[];
  className?: string;
  minCardWidth?: number;
  maxCardWidth?: number; // 필요하면 사용
  gapClassName?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey?: (item: T, index: number) => React.Key;
};

export default function ResponsiveRecapGrid<T>({
  items,
  className = "",
  minCardWidth = 320,
  maxCardWidth, // optional
  gapClassName = "gap-6",
  renderItem,
  getKey,
}: Props<T>) {
  const maxPart = maxCardWidth ? `${maxCardWidth}px` : "1fr";

  return (
    <div
      className={["grid", gapClassName, className].join(" ")}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}px, ${maxPart}))`,
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
