"use client";

import React from "react";
import RecapBlogBreadcrumb, {
  type Crumb,
} from "@/views/Trip/component/RecapBlogCrumbBread";
import RecapDayTabs, { type DayTab } from "@/views/Trip/component/RecapDayTabs";

type Props = {
  title?: string; // "Recap Blog"
  onGoBack?: () => void;

  breadcrumbItems: Crumb[];

  dayTabs: DayTab[];
  activeDayId: string;
  onDayChange: (id: string) => void;

  className?: string;
};

export default function RecapBlogTopBar({
  title = "Recap Blog",
  onGoBack,
  breadcrumbItems,
  dayTabs,
  activeDayId,
  onDayChange,
  className = "",
}: Props) {
  return (
    <header
      className={["w-full bg-white/85 backdrop-blur", className].join(" ")}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-4">
        {/* Left */}
        <div className="min-w-0">
          <div className="flex items-center gap-4">
            <h1 className="text-[18px] font-semibold text-black/70">{title}</h1>

            <RecapBlogBreadcrumb
              items={breadcrumbItems}
              className="hidden sm:flex"
            />
          </div>

          <div className="mt-2">
            <button
              type="button"
              onClick={onGoBack}
              className={[
                "h-9 rounded-full px-4 text-[14px] font-semibold",
                "border border-black/20 text-black/70",
                "hover:bg-black/5 active:scale-[0.99] transition",
              ].join(" ")}
            >
              Go Back
            </button>
          </div>

          {/* 모바일에서는 아래로 breadcrumb */}
          <RecapBlogBreadcrumb
            items={breadcrumbItems}
            className="mt-2 sm:hidden"
          />
        </div>

        {/* Right */}
        <div className="shrink-0">
          <RecapDayTabs
            tabs={dayTabs}
            activeId={activeDayId}
            onChange={onDayChange}
          />
        </div>
      </div>
    </header>
  );
}
