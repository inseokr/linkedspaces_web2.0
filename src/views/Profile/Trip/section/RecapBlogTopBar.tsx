"use client";

import React from "react";
import RecapDayTabs, {
  type DayTab,
} from "@/views/Profile/Trip/component/RecapDayTabs";
import Image from "next/image";
import updateIcon from "@/assets/icons/update.svg";

type Props = {
  title?: string;
  onGoBack?: () => void;
  shareUrl?: string;

  // optional day tabs (mainly for edit flows)
  dayTabs?: DayTab[];
  activeDayId?: string;
  onDayChange?: (id: string) => void;

  // 추가: 버튼 핸들러
  onEditBlog?: () => void;
  onShare?: () => void;

  onCloseEdit?: () => void;
  onUpdate?: () => void;
  updateDisabled?: boolean;
  onDiscardLocal?: () => void;
  discardDisabled?: boolean;
  mode?: "view" | "edit";
  brand?: "linkedspaces" | "bloggo";

  className?: string;
};

export default function RecapBlogTopBar({
  title = "Recap Blog",
  onGoBack,
  shareUrl,
  dayTabs,
  activeDayId,
  onDayChange,
  onEditBlog,
  onShare,
  mode = "view",
  onCloseEdit,
  onUpdate,
  updateDisabled = false,
  onDiscardLocal,
  discardDisabled = false,
  brand = "linkedspaces",
  className = "",
}: Props) {
  const secondaryButtonClass =
    "h-9 rounded-full px-4 text-sm font-semibold leading-none tracking-[-0.01em] whitespace-nowrap " +
    "border border-black/15 text-black/70 " +
    "hover:bg-black/5 active:scale-[0.99] transition " +
    "inline-flex items-center justify-center gap-2 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20";

  const primaryColor = brand === "bloggo" ? "#0284c7" : "#FF6A00";

  const primaryButtonClass =
    "h-9 rounded-full px-4 text-sm font-semibold leading-none tracking-[-0.01em] whitespace-nowrap " +
    "text-white " +
    "hover:opacity-90 active:scale-[0.99] transition " +
    "inline-flex items-center justify-center gap-2 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20";

  const disabledPrimaryButtonClass =
    "h-9 rounded-full px-4 text-sm font-semibold leading-none tracking-[-0.01em] whitespace-nowrap " +
    "bg-black/10 text-black/40 " +
    "cursor-not-allowed " +
    "inline-flex items-center justify-center gap-2 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10";

  const destructiveButtonClass =
    "h-9 rounded-full px-4 text-sm font-semibold leading-none tracking-[-0.01em] whitespace-nowrap " +
    "bg-red-500/10 text-red-700 " +
    "hover:bg-red-500/15 active:scale-[0.99] transition " +
    "inline-flex items-center justify-center gap-2 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20";

  const disabledDestructiveButtonClass =
    "h-9 rounded-full px-4 text-sm font-semibold leading-none tracking-[-0.01em] whitespace-nowrap " +
    "bg-black/10 text-black/40 " +
    "cursor-not-allowed " +
    "inline-flex items-center justify-center gap-2 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10";

  const handleShare = async () => {
    const url = shareUrl || window.location.href;

    try {
      if (window.navigator.clipboard?.writeText) {
        await window.navigator.clipboard.writeText(url);
        alert("Link copied!");
        return;
      }
    } catch (err) {
      console.error("Error sharing:", err);
      // Fallback for abort or error
    }

    if (!window.navigator.clipboard) {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <header
      className={[
        "sticky top-[0px] z-50", // 필요에 맞게 px 조정
        "w-full bg-white/85 backdrop-blur border-b border-black/10",
        className,
      ].join(" ")}
    >
      <div className="w-full px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Go Back (bloggo) or Title (linkedspaces) */}
          <div className="min-w-0 flex items-center gap-3">
            {brand === "bloggo" && onGoBack ? (
              <button
                type="button"
                onClick={onGoBack}
                className={secondaryButtonClass}
              >
                ← Go Back
              </button>
            ) : (
              <h1 className="min-w-0 truncate text-[16px] sm:text-[18px] font-semibold text-black/70">
                {title}
              </h1>
            )}
          </div>

          {/* Right: Actions (Edit / Share / Go Back for linkedspaces) */}
          <div className="flex items-center gap-2">
            {mode === "edit" ? (
              <>
                <button
                  type="button"
                  onClick={onCloseEdit}
                  className={secondaryButtonClass}
                >
                  Close
                </button>

                {onDiscardLocal && (
                  <button
                    type="button"
                    onClick={discardDisabled ? undefined : onDiscardLocal}
                    disabled={discardDisabled}
                    className={
                      discardDisabled
                        ? disabledDestructiveButtonClass
                        : destructiveButtonClass
                    }
                  >
                    Discard local changes
                  </button>
                )}

                <button
                  type="button"
                  onClick={updateDisabled ? undefined : onUpdate}
                  disabled={updateDisabled}
                  style={{
                    backgroundColor: updateDisabled ? undefined : primaryColor,
                  }}
                  className={
                    updateDisabled
                      ? disabledPrimaryButtonClass
                      : primaryButtonClass
                  }
                >
                  <Image
                    src={updateIcon}
                    alt="Update"
                    width={18}
                    height={18}
                    className={[
                      "block shrink-0",
                      updateDisabled ? "opacity-40" : "opacity-90",
                    ].join(" ")}
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

                {/* Go Back only on the right for non-bloggo brands */}
                {onGoBack && brand !== "bloggo" && (
                  <button
                    type="button"
                    onClick={onGoBack}
                    className={secondaryButtonClass}
                  >
                    Go Back
                  </button>
                )}
              </>
            )}
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
