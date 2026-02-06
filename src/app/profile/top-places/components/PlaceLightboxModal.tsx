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
  Send,
  ThumbsUp,
  Globe,
} from "lucide-react";

export interface LightboxImage {
  src: string;
  placeName: string;
  dateTime: string;
}

interface PlaceLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: LightboxImage[];
  startIndex?: number;
}

const ACTION_ICONS = [
  { Icon: Heart, label: "Like" },
  { Icon: MessageCircle, label: "Comment" },
  { Icon: Bookmark, label: "Bookmark" },
  { Icon: Share2, label: "Share" },
  { Icon: LinkIcon, label: "Go to link" },
  { Icon: MoreVertical, label: "More" },
] as const;

function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, isActive: boolean) {
  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;
    const root = containerRef.current;
    const focusable = root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    root.addEventListener("keydown", handleKeyDown);
    first?.focus();
    return () => root.removeEventListener("keydown", handleKeyDown);
  }, [isActive, containerRef]);
}

export default function PlaceLightboxModal({
  isOpen,
  onClose,
  images,
  startIndex = 0,
}: PlaceLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const current = images[currentIndex];
  const hasMultiple = images.length > 1;

  React.useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(startIndex, images.length - 1));
    }
  }, [isOpen, startIndex, images.length]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrentIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
      if (e.key === "ArrowRight") setCurrentIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, images.length]);

  useFocusTrap(containerRef, isOpen && images.length > 0);

  if (!isOpen) return null;

  const goPrev = () => setCurrentIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  const goNext = () => setCurrentIndex((i) => (i >= images.length - 1 ? 0 : i + 1));

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Photo lightbox"
    >
      {/* Overlay - dark dim, click to close */}
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div
        ref={containerRef}
        className="relative flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal container: portrait format (phone-style), large scale */}
        <div
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 shadow-2xl"
          style={{
            height: "90vh",
            width: "min(calc(90vh * 3 / 4), calc(100vw - 2rem))",
          }}
        >
          {/* Main image area - fills container, portrait 3:4 */}
          <div className="relative h-full w-full bg-black">
            {current ? (
              <img
                src={current.src}
                alt=""
                className="h-full w-full object-contain"
              />
            ) : (
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  background: "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
                }}
              />
            )}

            {/* Close - top right */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-gray-800/90 text-white/90 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left chevron - vertically centered, slightly outside image feel */}
            {hasMultiple && (
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-gray-800/90 text-white/90 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Right chevron */}
            {hasMultiple && (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-16 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-gray-800/90 text-white/90 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Right side vertical action icons - right edge of modal */}
            <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
              {ACTION_ICONS.map(({ Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/90 text-white/90 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent active:scale-95"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </button>
              ))}
            </div>

            {/* Bottom info overlay - blurred dark gradient, centered text */}
            {current && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/35 to-transparent backdrop-blur-md p-4 pt-14 pb-4">
                <div className="flex justify-center gap-4 text-white/80 mb-2">
                  <Send className="h-3.5 w-3.5" aria-hidden />
                  <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
                  <Globe className="h-3.5 w-3.5" aria-hidden />
                </div>
                <h2 className="text-center text-lg font-semibold text-white">
                  {current.placeName}
                </h2>
                <p className="text-center text-sm text-white/80 mt-0.5">
                  {current.dateTime}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail strip - below modal */}
        {hasMultiple && images.length > 0 && (
          <div className="mt-4 flex justify-center gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 focus:ring-offset-black/75 ${
                  i === currentIndex
                    ? "border-[var(--color-main)] ring-2 ring-[var(--color-main)]/30"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
                aria-label={`View photo ${i + 1}`}
                aria-pressed={i === currentIndex}
              >
                <img
                  src={img.src}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
