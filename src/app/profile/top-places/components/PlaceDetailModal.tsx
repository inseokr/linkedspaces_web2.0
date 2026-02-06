"use client";

import * as React from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Link as LinkIcon,
  MoreVertical,
  UtensilsCrossed,
  ThumbsUp,
  Globe,
} from "lucide-react";
import type { TopPlace } from "../mockData";

/** Get mock photo URLs for modal carousel (main + 2 more for thumbnails) */
function getPlacePhotoUrls(place: TopPlace): string[] {
  const base = place.imageUrl.split("?")[0];
  return [
    place.imageUrl,
    `${base}?random=${place.id}-2`,
    `${base}?random=${place.id}-3`,
  ];
}

/** Mock visit date for overlay */
function getMockVisitDate(): string {
  return "06 June 2026 at 00:00";
}

interface PlaceDetailModalProps {
  place: TopPlace | null;
  onClose: () => void;
}

const ACTION_BUTTONS = [
  { icon: Heart, label: "Like" },
  { icon: MessageCircle, label: "Comment" },
  { icon: Bookmark, label: "Bookmark" },
  { icon: Share2, label: "Share" },
  { icon: LinkIcon, label: "Go to link" },
] as const;

export default function PlaceDetailModal({ place, onClose }: PlaceDetailModalProps) {
  const [photoIndex, setPhotoIndex] = React.useState(0);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const moreRef = React.useRef<HTMLDivElement>(null);

  const photos = place ? getPlacePhotoUrls(place) : [];
  const currentPhoto = photos[photoIndex];

  React.useEffect(() => {
    if (!place) return;
    setPhotoIndex(0);
  }, [place?.id]);

  React.useEffect(() => {
    if (place) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [place]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    if (moreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [moreOpen]);

  if (!place) return null;

  const goPrev = () =>
    setPhotoIndex((i) => (i <= 0 ? photos.length - 1 : i - 1));
  const goNext = () =>
    setPhotoIndex((i) => (i >= photos.length - 1 ? 0 : i + 1));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="place-detail-title"
    >
      {/* Backdrop - click to close */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X - top right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/80 text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex min-h-0 flex-1 gap-0 md:gap-4">
          {/* Main photo area */}
          <div className="relative flex-1 min-h-0 flex flex-col">
            <div className="relative aspect-[4/3] w-full min-h-0 bg-gray-900 flex-shrink-0">
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt=""
                  className="h-full w-full object-contain"
                />
              ) : (
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
                  }}
                />
              )}

              {/* Photo nav chevrons */}
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Bottom overlay on photo: icons + title + date */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-12">
                <div className="flex items-center gap-3 text-white/90">
                  <UtensilsCrossed className="h-4 w-4 shrink-0" aria-hidden />
                  <ThumbsUp className="h-4 w-4 shrink-0 text-green-400" aria-hidden />
                  <Globe className="h-4 w-4 shrink-0" aria-hidden />
                </div>
                <h2
                  id="place-detail-title"
                  className="mt-1 text-xl font-semibold text-white"
                >
                  {place.title}
                </h2>
                <p className="text-sm text-white/80">{getMockVisitDate()}</p>
              </div>
            </div>

            {/* Thumbnail carousel */}
            <div className="flex gap-2 overflow-x-auto p-3">
              {photos.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPhotoIndex(i)}
                  className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                  style={{
                    borderColor: i === photoIndex ? "var(--color-main)" : "transparent",
                  }}
                  aria-label={`View photo ${i + 1}`}
                  aria-pressed={i === photoIndex}
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right side - vertical action buttons */}
          <div className="flex shrink-0 flex-col items-center justify-center gap-2 border-t border-gray-200 py-4 md:border-t-0 md:border-l md:py-6 md:pl-2">
            {ACTION_BUTTONS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-700 text-white transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((o) => !o)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-700 text-white transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                aria-label="More menu"
                aria-expanded={moreOpen}
                aria-haspopup="true"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {moreOpen && (
                <div
                  className="absolute bottom-full left-1/2 mb-2 min-w-[140px] -translate-x-1/2 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                  role="menu"
                >
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    role="menuitem"
                  >
                    Copy link
                  </button>
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    role="menuitem"
                  >
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
