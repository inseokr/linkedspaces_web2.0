"use client";

import { useState, useRef, useEffect } from "react";
import type { LatestActivityPlace } from "../mockData";
import { MessageCircle, MoreVertical } from "lucide-react";
import SentimentIcon from "@/components/ui/SentimentIcon";

interface PlaceCardProps {
  place: LatestActivityPlace;
  /** When set, clicking the card opens the place detail lightbox */
  onPlaceClick?: (placeId: string) => void;
  /** When set, clicking the comment button opens the lightbox with the comments panel open */
  onCommentClick?: (placeId: string) => void;
}

/** Gradient placeholder when imageUrl is missing or fails */
function ImagePlaceholder() {
  return (
    <div
      className="h-full w-full bg-cover bg-center"
      style={{
        background:
          "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
      }}
    />
  );
}

export default function PlaceCard({
  place,
  onPlaceClick,
  onCommentClick,
}: PlaceCardProps) {
  const { id, name, date, category, imageUrl, caption, sentiment } = place;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClick = () => onPlaceClick?.(id);

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCommentClick) onCommentClick(id);
    else onPlaceClick?.(id);
  };

  const handleKebabClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (ev: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(ev.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  return (
    <article
      onClick={onPlaceClick ? handleClick : undefined}
      role={onPlaceClick ? "button" : undefined}
      tabIndex={onPlaceClick ? 0 : undefined}
      onKeyDown={
        onPlaceClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      className={`relative flex shrink-0 w-[320px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-[var(--color-main)] focus-within:ring-offset-2 ${onPlaceClick ? "cursor-pointer" : ""}`}
      aria-label={`Place: ${name}`}
    >
      <div className="relative h-52 w-full overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const placeholder = e.currentTarget.nextElementSibling;
              if (placeholder instanceof HTMLElement)
                placeholder.style.display = "block";
            }}
          />
        ) : null}
        <div
          className={imageUrl ? "absolute inset-0 hidden" : "absolute inset-0"}
          aria-hidden
        >
          <ImagePlaceholder />
        </div>
        {/* Row: inline-flex + items-center so sentiment icon and date pill share the same vertical center; pill uses leading-none to avoid line-height shifting the icon. */}
        <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
          {sentiment && <SentimentIcon sentiment={sentiment} size={32} />}
          <span className="inline-flex items-center rounded-md bg-black/50 px-2 py-1 text-sm font-medium leading-none text-white backdrop-blur-sm">
            {date}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 pb-14">
        <div className="flex items-center gap-2">
          <h3 className="min-w-0 flex-1 truncate text-lg font-semibold text-gray-900">
            {name}
          </h3>
          <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
            {category}
          </span>
        </div>
        <p
          className="mt-2 line-clamp-3 text-sm text-gray-600 leading-snug"
          title={caption}
        >
          {caption}
        </p>
      </div>

      {/* Fixed bottom-right: comment icon + kebab menu */}
      <div className="absolute right-2 bottom-3 z-10 flex items-center gap-1">
        <button
          type="button"
          onClick={handleCommentClick}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm transition-colors hover:bg-white hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 focus:ring-offset-white"
          aria-label="Comments"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={handleKebabClick}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm transition-colors hover:bg-white hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 focus:ring-offset-white"
            aria-label="More options"
            aria-expanded={menuOpen}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 bottom-full z-20 mb-1 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onPlaceClick?.(id);
                }}
              >
                View details
              </button>
              <button
                type="button"
                role="menuitem"
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  const query = encodeURIComponent(name);
                  window.open(
                    `https://www.google.com/search?q=${query}`,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
              >
                Search on Google
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
