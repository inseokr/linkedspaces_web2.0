"use client";

import React from "react";
import RecapBlogBreadcrumb, {
  type Crumb,
} from "@/views/Profile/Trip/component/RecapBlogCrumbBread";
import RecapDayTabs, {
  type DayTab,
} from "@/views/Profile/Trip/component/RecapDayTabs";
import Image from "next/image";
import editIcon from "@/assets/icons/edit.svg";
import shareIcon from "@/assets/icons/share.svg";
import updateIcon from "@/assets/icons/update.svg";

type Props = {
  title?: string;
  onGoBack?: () => void;

  breadcrumbItems: Crumb[];

  // optional day tabs (mainly for edit flows)
  dayTabs?: DayTab[];
  activeDayId?: string;
  onDayChange?: (id: string) => void;

  // 추가: 버튼 핸들러
  onEditBlog?: () => void;
  onShare?: () => void;

  onCloseEdit?: () => void;
  onUpdate?: () => void;
  mode?: "view" | "edit";

  className?: string;
};

export default function RecapBlogTopBar({
  title = "Recap Blog",
  onGoBack,
  breadcrumbItems,
  dayTabs,
  activeDayId,
  onDayChange,
  onEditBlog,
  onShare,
  mode = "view",
  onCloseEdit,
  onUpdate,
  className = "",
}: Props) {
  const secondaryButtonClass =
    "h-9 rounded-full px-4 text-sm font-semibold leading-none tracking-[-0.01em] whitespace-nowrap " +
    "border border-black/15 text-black/70 " +
    "hover:bg-black/5 active:scale-[0.99] transition " +
    "inline-flex items-center justify-center gap-2 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20";

  const primaryButtonClass =
    "h-9 rounded-full px-4 text-sm font-semibold leading-none tracking-[-0.01em] whitespace-nowrap " +
    "bg-[#FF6A00] text-white " +
    "hover:opacity-90 active:scale-[0.99] transition " +
    "inline-flex items-center justify-center gap-2 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20";

  const handleShare = async () => {
    const url = window.location.href;

    if (typeof window.navigator.share === "function") {
      await window.navigator.share({ title, url });
      return;
    }

    if (window.navigator.clipboard?.writeText) {
      await window.navigator.clipboard.writeText(url);
      console.log("Link copied:", url);
      return;
    }

    window.prompt("Copy this link:", url);
  };

  return (
    <header
      className={[
        "sticky top-[0px] z-50", // 필요에 맞게 px 조정
        "w-full bg-white/85 backdrop-blur border-b border-black/10",
        className,
      ].join(" ")}
    >
      <div className="mx-auto max-w-[1200px] px-6 py-4">
        {/* 2행 2열 그리드 */}
        <div className="grid grid-cols-[1fr_auto] grid-rows-2 gap-x-4 gap-y-2 items-start">
          {/* Row 1, Col 1: Title + breadcrumb (desktop) */}
          <div className="min-w-0 flex items-center gap-4">
            <h1 className="text-[18px] font-semibold text-black/70">{title}</h1>
            <RecapBlogBreadcrumb
              items={breadcrumbItems}
              className="hidden sm:flex"
            />
          </div>

          {/* Row 1, Col 2: Actions (Edit / Share) */}
          <div className="justify-self-end flex items-center gap-2">
            {mode === "edit" ? (
              <>
                <button
                  type="button"
                  onClick={onCloseEdit}
                  className={secondaryButtonClass}
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={onUpdate}
                  className={primaryButtonClass}
                >
                  <Image
                    src={updateIcon}
                    alt="Update"
                    width={18}
                    height={18}
                    className="block shrink-0 opacity-90"
                  />
                  Update
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onEditBlog?.()}
                  className={secondaryButtonClass}
                >
                  Edit Blog
                </button>

                <button
                  type="button"
                  onClick={onShare ?? handleShare}
                  className={secondaryButtonClass}
                >
                  Share
                </button>
              </>
            )}
          </div>

          {/* Row 2, Col 1: Go Back + mobile breadcrumb */}
          <div className="min-w-0">
            <button
              type="button"
              onClick={onGoBack}
              className={secondaryButtonClass}
            >
              Go Back
            </button>

            <RecapBlogBreadcrumb
              items={breadcrumbItems}
              className="mt-2 sm:hidden"
            />
          </div>
        </div>

        {mode === "edit" && dayTabs?.length && onDayChange && (
          <div className="mt-4">
            <RecapDayTabs
              tabs={dayTabs}
              activeId={activeDayId ?? dayTabs[0]?.id ?? "day-1"}
              onChange={onDayChange}
            />
          </div>
        )}
      </div>
    </header>
  );
}
