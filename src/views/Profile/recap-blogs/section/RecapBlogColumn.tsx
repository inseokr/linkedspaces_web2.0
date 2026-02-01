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

  countryLabel?: string;
  showHeader?: boolean;

  // expand / collapse (토글)
  isExpanded?: boolean;
  onToggleExpand?: () => void;

  // (하위 호환용) 열기 전용 콜백을 남겨두고 싶으면 사용
  onExpand?: () => void;

  // layout
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
  showHeader = true,

  isExpanded = false,
  onToggleExpand,
  onExpand,

  layout = "list",
  minCardWidth = 320,
  maxCardWidth,
}: Props) {
  const gridStyle: React.CSSProperties | undefined =
    layout === "grid"
      ? {
          gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}px, ${
            typeof maxCardWidth === "number" ? `${maxCardWidth}px` : "1fr"
          }))`,
        }
      : undefined;

  const handleToggle = onToggleExpand ?? onExpand;

  return (
    <div className={["w-full", className].join(" ")}>
      {showHeader && countryLabel && (
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[#5B5B5B] font-[Inter] text-[16px] font-bold leading-normal">
            {countryLabel}
          </h2>

          {handleToggle && (
            <button
              type="button"
              onClick={handleToggle}
              className="rounded-lg p-2 hover:bg-black/5 active:bg-black/10"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <span className="text-[#5B5B5B] text-[18px] font-bold leading-none">
                {isExpanded ? "<" : ">"}
              </span>
            </button>
          )}
        </div>
      )}

      <div className={["grid", gapClassName].join(" ")} style={gridStyle}>
        {items.map((item) => (
          <div key={item.id} data-recap-blog-id={item.id}>
            <AllBlogCard
              item={item}
              onVisibilityClick={onVisibilityClick}
              showVisibilityButton={showVisibilityButton}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
