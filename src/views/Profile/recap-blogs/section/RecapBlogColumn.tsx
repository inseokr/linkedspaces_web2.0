"use client";

import * as React from "react";
import AllBlogCard, {
  type AllBlogCardItem,
} from "@/views/Profile/recap-blogs/components/RecapBlogCard";

type Props = {
  items: AllBlogCardItem[];
  className?: string;
  gapClassName?: string; // 예: "gap-6"
  onVisibilityClick?: (item: AllBlogCardItem) => void;
  showVisibilityButton?: boolean;

  onSelect?: (id: string) => void;
};

export default function RecapBlogColumn({
  items,
  className = "",
  gapClassName = "gap-6",
  onVisibilityClick,
  showVisibilityButton = true,
}: Props) {
  return (
    <div className={["w-[380px]", className].join(" ")}>
      <div className={["grid grid-cols-1", gapClassName].join(" ")}>
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
