"use client";

import * as React from "react";
import AllBlogCard, {
  type AllBlogCardItem,
} from "@/views/Profile/recap-blogs/components/RecapBlogCard";

type Props = {
  items: AllBlogCardItem[];
  className?: string;
  gapClassName?: string;

  onVisibilityClick?: (item: AllBlogCardItem) => void;
  showVisibilityButton?: boolean;

  onExpand?: () => void;
  countryLabel?: string;

  showHeader?: boolean;

  // ✅ 추가
  layout?: "list" | "grid";
  minCardWidth?: number; // grid 모드에서만 사용
  maxCardWidth?: number; // grid 모드에서만 사용
};

export default function RecapBlogColumn({
  items,
  className = "",
  gapClassName = "gap-6",
  onVisibilityClick,
  showVisibilityButton = true,
  countryLabel,
  onExpand,
  showHeader = true,

  layout = "list",
  minCardWidth = 320,
  maxCardWidth,
}: Props) {
  const gridStyle =
    layout === "grid"
      ? {
          gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}px, ${
            typeof maxCardWidth === "number" ? `${maxCardWidth}px` : "1fr"
          }))`,
        }
      : undefined;

  return (
    <div className={["w-full", className].join(" ")}>
      {showHeader && countryLabel && (
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[#5B5B5B] font-[Inter] text-[16px] font-bold leading-normal">
            {countryLabel}
          </h2>

          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              className="rounded-lg p-2 hover:bg-black/5 active:bg-black/10"
              aria-label="Expand over map"
            >
              <span className="text-[#5B5B5B] text-[18px] font-bold leading-none">
                &gt;
              </span>
            </button>
          )}
        </div>
      )}

      <div className={["grid", gapClassName].join(" ")} style={gridStyle}>
        {items.map((item) => (
          <AllBlogCard
            key={item.id}
            item={item}
            onVisibilityClick={onVisibilityClick}
            showVisibilityButton={showVisibilityButton}
          />
        ))}
      </div>
    </div>
  );
}
