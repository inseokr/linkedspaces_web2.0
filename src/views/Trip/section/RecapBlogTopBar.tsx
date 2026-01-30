"use client";

import React from "react";
import RecapBlogBreadcrumb, {
  type Crumb,
} from "@/views/Trip/component/RecapBlogCrumbBread";
import RecapDayTabs, { type DayTab } from "@/views/Trip/component/RecapDayTabs";
import Image from "next/image";
import editIcon from "@/assets/icons/edit.svg";
import shareIcon from "@/assets/icons/share.svg";

type Props = {
  title?: string;
  onGoBack?: () => void;

  breadcrumbItems: Crumb[];

  dayTabs: DayTab[];
  activeDayId: string;
  onDayChange: (id: string) => void;

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

          {/* Row 1, Col 2: Day tabs */}
          <div className="justify-self-end">
            <RecapDayTabs
              tabs={dayTabs}
              activeId={activeDayId}
              onChange={onDayChange}
            />
          </div>

          {/* Row 2, Col 1: Go Back + mobile breadcrumb */}
          <div className="min-w-0">
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

            <RecapBlogBreadcrumb
              items={breadcrumbItems}
              className="mt-2 sm:hidden"
            />
          </div>

          {/* Row 2, Col 2: Actions (Edit / Share) */}

          <div className="justify-self-end flex items-center gap-2">
            {mode === "edit" ? (
              <>
                <button
                  type="button"
                  onClick={onCloseEdit}
                  className={[
                    "h-9 rounded-full px-4 text-[14px] font-semibold",
                    "border border-black/20 text-black/70",
                    "hover:bg-black/5 active:scale-[0.99] transition",
                  ].join(" ")}
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={onUpdate}
                  className={[
                    "h-9 rounded-full px-4 text-[14px] font-semibold",
                    "bg-[#FF6A00] text-white",
                    "hover:opacity-90 active:scale-[0.99] transition",
                    "inline-flex items-center gap-2",
                  ].join(" ")}
                >
                  <Image
                    src="/icons/update.png"
                    alt="Update"
                    width={22}
                    height={22}
                    className="opacity-80"
                  />
                  Update
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    console.log("Edit clicked");
                    onEditBlog?.();
                  }}
                  className={[
                    "h-9 rounded-full px-4 text-[14px] font-semibold",
                    "border border-black/20 text-black/70",
                    "hover:bg-black/5 active:scale-[0.99] transition",
                    "inline-flex items-center gap-2",
                  ].join(" ")}
                >
                  <Image
                    src={editIcon}
                    alt="Edit"
                    width={24}
                    height={24}
                    className="opacity-80"
                  />
                  Edit Blog
                </button>

                <button
                  type="button"
                  onClick={onShare ?? handleShare}
                  className={[
                    "h-9 rounded-full px-4 text-[14px] font-semibold",
                    "border border-black/20 text-black/70",
                    "hover:bg-black/5 active:scale-[0.99] transition",
                    "inline-flex items-center gap-2",
                  ].join(" ")}
                >
                  <Image
                    src={shareIcon}
                    alt="Share"
                    width={24}
                    height={24}
                    className="opacity-80"
                  />
                  Share
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
