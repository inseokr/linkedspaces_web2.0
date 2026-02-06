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
  Send,
  ThumbsUp,
  Globe,
} from "lucide-react";

export interface LightboxImage {
  src: string;
  placeName: string;
  dateTime: string;
  /** Optional caption/story shown below the timestamp */
  caption?: string;
  /** Optional city for "Go to link" (Google search: place name + city) */
  placeCity?: string;
}

interface PlaceLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: LightboxImage[];
  startIndex?: number;
}

export interface PlaceComment {
  id: string;
  username: string;
  avatarUrl?: string;
  text: string;
}

const ACTION_ICONS = [
  { key: "like", Icon: Heart, label: "Like" },
  { key: "comment", Icon: MessageCircle, label: "Comment" },
  { key: "bookmark", Icon: Bookmark, label: "Bookmark" },
  { key: "share", Icon: Share2, label: "Share" },
  { key: "link", Icon: LinkIcon, label: "Go to link" },
] as const;

function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  isActive: boolean,
) {
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
  const [liked, setLiked] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(false);
  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const [commentsByPlace, setCommentsByPlace] = React.useState<
    Record<string, PlaceComment[]>
  >({});
  const [newCommentText, setNewCommentText] = React.useState("");
  const commentsListRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const current = images[currentIndex];
  const placeKey = current?.placeName ?? "";
  const placeComments = commentsByPlace[placeKey] ?? [];
  const commentCount = placeComments.length;
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
      if (e.key === "ArrowLeft")
        setCurrentIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
      if (e.key === "ArrowRight")
        setCurrentIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, images.length]);

  useFocusTrap(containerRef, isOpen && images.length > 0);

  const handleShare = React.useCallback(async () => {
    const cur = images[currentIndex];
    if (!cur) return;
    const title = cur.placeName;
    const text = [cur.placeName, cur.placeCity].filter(Boolean).join(", ");
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: title || "Place",
          text: text || title,
          url: url || undefined,
        });
      } else {
        await navigator.clipboard?.writeText(url || text || title);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        try {
          await navigator.clipboard?.writeText(url || text || title);
        } catch {}
      }
    }
  }, [currentIndex, images]);

  const handleLikeToggle = React.useCallback(() => {
    setLiked((prev) => !prev);
  }, []);

  const handleBookmarkToggle = React.useCallback(() => {
    setBookmarked((prev) => !prev);
  }, []);

  const handleOpenLink = React.useCallback(() => {
    const cur = images[currentIndex];
    if (!cur) return;
    const query = [cur.placeName, cur.placeCity].filter(Boolean).join(", ");
    const url = `https://www.google.com/search?q=${encodeURIComponent(query.trim() || cur.placeName)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [currentIndex, images]);

  const handleCommentPanelOpen = React.useCallback(() => {
    setCommentsOpen(true);
    if (!placeKey) return;
    setCommentsByPlace((prev) => {
      const existing = prev[placeKey] ?? [];
      if (existing.length > 0) return prev;
      return {
        ...prev,
        [placeKey]: [{ id: "demo-1", username: "yjdoh0918", text: "Wow~" }],
      };
    });
  }, [placeKey]);

  const handleCommentPanelClose = React.useCallback(() => {
    setCommentsOpen(false);
    setNewCommentText("");
  }, []);

  const handleAddComment = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = newCommentText.trim();
      if (!text || !placeKey) return;
      const comment: PlaceComment = {
        id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        username: "You",
        text,
      };
      setCommentsByPlace((prev) => ({
        ...prev,
        [placeKey]: [...(prev[placeKey] ?? []), comment],
      }));
      setNewCommentText("");
      requestAnimationFrame(() => {
        commentsListRef.current?.scrollTo({
          top: commentsListRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    },
    [newCommentText, placeKey],
  );

  const handleActionClick = React.useCallback(
    (key: string) => {
      if (key === "like") handleLikeToggle();
      else if (key === "comment") handleCommentPanelOpen();
      else if (key === "bookmark") handleBookmarkToggle();
      else if (key === "share") handleShare();
      else if (key === "link") handleOpenLink();
    },
    [
      handleLikeToggle,
      handleCommentPanelOpen,
      handleBookmarkToggle,
      handleShare,
      handleOpenLink,
    ],
  );

  if (!isOpen) return null;

  const goPrev = () =>
    setCurrentIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  const goNext = () =>
    setCurrentIndex((i) => (i >= images.length - 1 ? 0 : i + 1));

  return (
    <div
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-4"
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
                  background:
                    "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
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

            {/* Right side vertical action icons - right edge of modal (skip sixth "more" for now) */}
            <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
              {ACTION_ICONS.map(({ key, Icon, label }) => {
                const isLike = key === "like";
                const isBookmark = key === "bookmark";
                const isComment = key === "comment";
                const isActive =
                  (isLike && liked) || (isBookmark && bookmarked);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleActionClick(key)}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent active:scale-95 ${
                      isActive
                        ? isLike
                          ? "bg-red-500/90 text-white hover:bg-red-500"
                          : "bg-gray-700 text-[var(--color-main)] hover:bg-gray-600"
                        : "bg-gray-800/90 text-white/90 hover:bg-gray-700 hover:text-white"
                    }`}
                    aria-label={
                      commentCount > 0 ? `${label} (${commentCount})` : label
                    }
                    aria-pressed={isActive}
                  >
                    <Icon
                      className={`h-5 w-5 ${isLike && liked ? "fill-current" : ""} ${isBookmark && bookmarked ? "fill-current" : ""}`}
                      strokeWidth={1.5}
                    />
                    {isComment && commentCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-gray-800">
                        {commentCount > 99 ? "99+" : commentCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom info overlay - blurred dark gradient, centered: icons, title, timestamp, caption */}
            {current && (
              <div className="absolute bottom-0 left-0 right-0 min-h-[140px] bg-gradient-to-t from-black/80 via-black/50 to-transparent backdrop-blur-md px-4 pt-10 pb-6 flex flex-col items-center justify-end">
                <div className="flex justify-center gap-4 text-white/80 mb-1.5">
                  <Send className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <ThumbsUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden />
                </div>
                <h2 className="text-center text-lg font-semibold text-white leading-tight">
                  {current.placeName}
                </h2>
                <p className="text-center text-sm text-white/80 mt-0.5">
                  {current.dateTime}
                </p>
                <div className="mt-3 w-full min-h-[2.5rem] flex items-center justify-center px-2">
                  {current.caption ? (
                    <p className="text-center text-sm text-white/95 leading-relaxed max-w-full line-clamp-4">
                      {current.caption}
                    </p>
                  ) : null}
                </div>
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

      {/* Comments panel - slides in from right, dark gray */}
      {commentsOpen && (
        <div
          className="fixed right-0 top-0 z-[120] flex h-full w-full max-w-[380px] flex-col rounded-tl-2xl bg-gray-800 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Comments"
        >
          {/* Header: Comments title + close */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-700 px-4 py-3">
            <h2 className="text-lg font-semibold text-white">Comments</h2>
            <button
              type="button"
              onClick={handleCommentPanelClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-label="Close comments"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable comment list */}
          <div
            ref={commentsListRef}
            className="min-h-0 flex-1 overflow-y-auto px-4 py-3"
          >
            {placeComments.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                No comments yet.
              </p>
            ) : (
              <ul className="list-none space-y-0">
                {placeComments.map((c) => (
                  <li
                    key={c.id}
                    className="border-b border-gray-700 py-3 last:border-b-0"
                  >
                    <div className="flex gap-3">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-600 flex items-center justify-center text-sm font-medium text-white">
                        {c.avatarUrl ? (
                          <img
                            src={c.avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          (c.username.slice(0, 1) || "?").toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">
                          {c.username}
                        </p>
                        <p className="mt-0.5 text-sm text-gray-300">{c.text}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Write comment input */}
          <form
            onSubmit={handleAddComment}
            className="flex shrink-0 items-center gap-3 border-t border-gray-700 bg-gray-800 px-4 py-3"
          >
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-600 flex items-center justify-center text-sm font-medium text-white">
              Y
            </div>
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="min-w-0 flex-1 rounded-xl border border-gray-600 bg-gray-700/80 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[var(--color-main)] focus:outline-none focus:ring-1 focus:ring-[var(--color-main)]"
              aria-label="Write a comment"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="shrink-0 rounded-lg bg-[var(--color-main)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
