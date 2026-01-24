// 동적으로 프레임 크기에 따라 카드 개수 조절 가능
//카드 여러개 들어가는 섹션

"use client";

// import CountryRecapCard, {
//   CountryRecapItem,
// } from "@/views/Profile/recap-blogs/components/CountryRecapCard";

// type Props = {
//   items: CountryRecapItem[];
//   className?: string;
//   minCardWidth?: number; // 넓으면 4개 이상도 가능
//   maxCardWidth?: number; // max도 정해주기
// };

// export default function CountryRecapGrid({
//   items,
//   className = "",
//   minCardWidth = 320,
//   maxCardWidth = 350,
// }: Props) {
//   return (
//     <div
//       className={["grid gap-6", className].join(" ")}
//       style={{
//         gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`, // 칼럼 폭 결정
//       }}
//     >
//       {items.map((item) => (
//         <CountryRecapCard key={item.id} item={item} />
//       ))}
//     </div>
//   );
// }

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
