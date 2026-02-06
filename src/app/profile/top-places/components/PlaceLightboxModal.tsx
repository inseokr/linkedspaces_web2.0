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
  ThumbsUp,
  Globe,
  Lock,
  Reply,
  Pencil,
  Coffee,
  UtensilsCrossed,
  Wine,
  TreePine,
  MapPin,
} from "lucide-react";
import SaveForLaterPanel from "./SaveForLaterPanel";

export interface LightboxImage {
  src: string;
  placeName: string;
  dateTime: string;
  /** Stable place id (e.g. from placeVisitHistory._id). Used to key comments per place. */
  placeId?: string;
  /** Optional caption/story shown below the timestamp */
  caption?: string;
  /** Optional city for "Go to link" (Google search: place name + city) */
  placeCity?: string;
  /** Visibility to user's network: "private" (lock) or "public" (world). Default "public". */
  visibility?: "private" | "public";
  /** Place category for category icon: Cafe, Restaurant, Bar, Park, Others, etc. */
  category?: string;
}

/** Category string to Lucide icon for the bottom overlay. */
function getCategoryIcon(category: string | undefined) {
  const key = (category ?? "").trim().toLowerCase();
  if (key.includes("cafe") || key.includes("coffee")) return Coffee;
  if (key.includes("restaurant")) return UtensilsCrossed;
  if (key.includes("bar") || key.includes("pub")) return Wine;
  if (
    key.includes("park") ||
    key.includes("attraction") ||
    key.includes("sightseeing")
  )
    return TreePine;
  return MapPin;
}

interface PlaceLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: LightboxImage[];
  startIndex?: number;
  /** Pre-loaded comments per place id (e.g. from backend). Seeded when opening a place that has no in-session comments yet. */
  initialCommentsByPlaceId?: Record<string, PlaceComment[]>;
  /** When true, the comments panel is open as soon as the modal opens. */
  initialCommentsOpen?: boolean;
  /** When provided, an Edit button is shown (top-left). Call to open edit flow for the current place. */
  onEdit?: () => void;
}

export interface PlaceComment {
  id: string;
  username: string;
  avatarUrl?: string;
  text: string;
  /** If set, this comment is a reply to the comment with this id */
  parentId?: string;
  /** Display name of the user being replied to (optional, for "Replying to @x") */
  replyToUsername?: string;
}

const ACTION_ICONS = [
  { key: "like", Icon: Heart, label: "Like" },
  { key: "comment", Icon: MessageCircle, label: "Comment" },
  { key: "bookmark", Icon: Bookmark, label: "Bookmark" },
  { key: "share", Icon: Share2, label: "Share" },
  { key: "link", Icon: LinkIcon, label: "Go to link" },
] as const;

/** Group comments into top-level and replies; render with Reply button (top-level only, replies don't show Reply). */
function CommentList({
  comments,
  onReplyClick,
}: {
  comments: PlaceComment[];
  onReplyClick: (comment: PlaceComment) => void;
}) {
  const topLevel = comments.filter((c) => !c.parentId);
  const byParent = React.useMemo(() => {
    const map = new Map<string, PlaceComment[]>();
    for (const c of comments) {
      if (c.parentId) {
        const list = map.get(c.parentId) ?? [];
        list.push(c);
        map.set(c.parentId, list);
      }
    }
    return map;
  }, [comments]);

  return (
    <ul className="list-none space-y-0">
      {topLevel.map((c) => (
        <li
          key={c.id}
          className="border-b border-gray-700/70 py-2.5 last:border-b-0"
        >
          <div className="flex gap-2.5">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-600 flex items-center justify-center text-xs font-medium text-white">
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
              <p className="text-sm font-medium text-white">{c.username}</p>
              <p className="mt-0.5 text-sm text-gray-300">{c.text}</p>
              <button
                type="button"
                onClick={() => onReplyClick(c)}
                className="mt-1 flex items-center gap-1 text-xs text-gray-500 hover:text-[var(--color-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-1 focus:ring-offset-gray-800 rounded"
                aria-label={`Reply to ${c.username}`}
              >
                <Reply className="h-3.5 w-3.5" />
                Reply
              </button>
            </div>
          </div>
          {(byParent.get(c.id) ?? []).map((reply) => (
            <div
              key={reply.id}
              className="ml-10 mt-2 flex gap-2.5 border-l-2 border-gray-600/70 pl-3"
            >
              <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-gray-600 flex items-center justify-center text-[10px] font-medium text-white">
                {reply.avatarUrl ? (
                  <img
                    src={reply.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (reply.username.slice(0, 1) || "?").toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white">
                  {reply.username}
                  {reply.replyToUsername && (
                    <span className="ml-1 font-normal text-gray-500">
                      replying to {reply.replyToUsername}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-sm text-gray-300">{reply.text}</p>
              </div>
            </div>
          ))}
        </li>
      ))}
    </ul>
  );
}

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
  initialCommentsByPlaceId,
  initialCommentsOpen = false,
  onEdit,
}: PlaceLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);
  const [liked, setLiked] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(false);
  const [saveForLaterOpen, setSaveForLaterOpen] = React.useState(false);
  const [commentsOpen, setCommentsOpen] = React.useState(false);
  /** When true, all overlays on the photo are hidden for a clear view; click photo again to show */
  const [overlaysHidden, setOverlaysHidden] = React.useState(false);

  // When modal opens with initialCommentsOpen, show the comments panel immediately.
  React.useEffect(() => {
    if (isOpen && initialCommentsOpen) setCommentsOpen(true);
  }, [isOpen, initialCommentsOpen]);

  // Reset clean view when modal closes so overlays are visible next time.
  React.useEffect(() => {
    if (!isOpen) setOverlaysHidden(false);
  }, [isOpen]);
  const [commentsByPlace, setCommentsByPlace] = React.useState<
    Record<string, PlaceComment[]>
  >({});
  const [newCommentText, setNewCommentText] = React.useState("");
  /** When set, the next submitted comment is a reply to this comment */
  const [replyingTo, setReplyingTo] = React.useState<{
    commentId: string;
    username: string;
  } | null>(null);
  const commentsListRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const current = images[currentIndex];
  /** Key comments by stable place id when available so each place shows its own comments. */
  const placeKey =
    (current?.placeId && current.placeId.trim() !== ""
      ? current.placeId
      : current?.placeName) ?? "";
  const placeComments = commentsByPlace[placeKey] ?? [];

  // Seed comments from backend when opening a place that has initial data and no in-session state yet.
  React.useEffect(() => {
    if (
      !placeKey ||
      !initialCommentsByPlaceId ||
      initialCommentsByPlaceId[placeKey] == null
    )
      return;
    setCommentsByPlace((prev) => {
      if (prev[placeKey] != null) return prev;
      return { ...prev, [placeKey]: initialCommentsByPlaceId[placeKey] ?? [] };
    });
  }, [placeKey, initialCommentsByPlaceId]);
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
    setSaveForLaterOpen(true);
  }, []);

  const handleSaveForLaterClose = React.useCallback(() => {
    setSaveForLaterOpen(false);
  }, []);

  const handleAddToCollection = React.useCallback((_collectionId: string) => {
    setBookmarked(true);
    setSaveForLaterOpen(false);
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
  }, []);

  const handleCommentPanelClose = React.useCallback(() => {
    setCommentsOpen(false);
    setNewCommentText("");
    setReplyingTo(null);
  }, []);

  const handleReplyClick = React.useCallback((comment: PlaceComment) => {
    setReplyingTo({ commentId: comment.id, username: comment.username });
  }, []);

  const handleCancelReply = React.useCallback(() => {
    setReplyingTo(null);
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
        ...(replyingTo && {
          parentId: replyingTo.commentId,
          replyToUsername: replyingTo.username,
        }),
      };
      setCommentsByPlace((prev) => ({
        ...prev,
        [placeKey]: [...(prev[placeKey] ?? []), comment],
      }));
      setNewCommentText("");
      setReplyingTo(null);
      requestAnimationFrame(() => {
        commentsListRef.current?.scrollTo({
          top: commentsListRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    },
    [newCommentText, placeKey, replyingTo],
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
        {/* Modal container: when comments open = two equal panels (photo | comments), else single photo */}
        <div
          className={`relative flex overflow-hidden rounded-3xl border border-white/10 bg-black/20 shadow-2xl ${
            commentsOpen ? "flex-row" : ""
          }`}
          style={{
            height: "90vh",
            width: commentsOpen
              ? "min(calc(90vh * 1.5), calc(100vw - 2rem))"
              : "min(calc(90vh * 3 / 4), calc(100vw - 2rem))",
          }}
        >
          {/* Left panel: photo - same size as right panel when comments open */}
          <div
            className="relative flex-shrink-0 bg-black"
            style={{
              width: commentsOpen ? "50%" : "100%",
              height: "100%",
            }}
          >
            {/* Photo: click to hide overlays for clear view, or (when hidden) click to show again */}
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={() => setOverlaysHidden((prev) => !prev)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOverlaysHidden((prev) => !prev);
                }
              }}
              aria-label={
                overlaysHidden
                  ? "Show controls"
                  : "Hide controls for clear view"
              }
            >
              {current ? (
                <img
                  src={current.src}
                  alt=""
                  className="h-full w-full object-contain pointer-events-none select-none"
                  draggable={false}
                />
              ) : (
                <div
                  className="h-full w-full bg-cover bg-center pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
                  }}
                />
              )}
            </div>

            {/* All overlays hidden when user clicks photo for clear view */}
            {!overlaysHidden && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit?.()}
                  className="absolute left-3 top-3 z-10 flex h-11 items-center gap-2 rounded-full bg-gray-800/90 px-4 text-sm font-medium text-white/90 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none"
                  aria-label="Edit place"
                >
                  <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span>Edit</span>
                </button>

                {/* Close - top right */}
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-gray-800/90 text-white/90 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Top bar: Category, Recommend, Visibility – small and subtle at top of photo */}
                {current &&
                  (() => {
                    const CategoryIcon = getCategoryIcon(current.category);
                    return (
                      <div
                        className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/35 px-3 py-1.5 backdrop-blur-sm"
                        aria-label="Place details"
                      >
                        <div className="flex items-center gap-1.5">
                          <CategoryIcon
                            className="h-3.5 w-3.5 text-white/80"
                            aria-hidden
                          />
                          <span className="text-[11px] text-white/80">
                            {current.category?.trim() || "Place"}
                          </span>
                        </div>
                        <span className="text-white/40">·</span>
                        <div className="flex items-center gap-1.5">
                          <ThumbsUp
                            className="h-3.5 w-3.5 text-white/80"
                            aria-hidden
                          />
                          <span className="text-[11px] text-white/80">
                            Recommend
                          </span>
                        </div>
                        <span className="text-white/40">·</span>
                        <div className="flex items-center gap-1.5">
                          {current.visibility === "private" ? (
                            <Lock
                              className="h-3.5 w-3.5 text-white/80"
                              aria-label="Private"
                            />
                          ) : (
                            <Globe
                              className="h-3.5 w-3.5 text-white/80"
                              aria-label="Public"
                            />
                          )}
                          <span className="text-[11px] text-white/80">
                            {current.visibility === "private"
                              ? "Private"
                              : "Public"}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                {/* Left chevron - vertically centered, slightly outside image feel */}
                {hasMultiple && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-gray-800/90 text-white/90 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}

                {/* Right chevron - offset so it doesn't overlap the vertical action buttons */}
                {hasMultiple && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-16 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-gray-800/90 text-white/90 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}

                {/* Right side: vertical action buttons hugging the right edge of the photo */}
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
                        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors focus:outline-none active:scale-95 ${
                          isActive
                            ? isLike
                              ? "bg-red-500/90 text-white hover:bg-red-500"
                              : "bg-gray-700 text-[var(--color-main)] hover:bg-gray-600"
                            : "bg-gray-800/90 text-white/90 hover:bg-gray-700 hover:text-white"
                        }`}
                        aria-label={
                          commentCount > 0
                            ? `${label} (${commentCount})`
                            : label
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

                {/* Bottom info overlay: place name, timestamp, caption */}
                {current && (
                  <div className="absolute bottom-0 left-0 right-0 min-h-[120px] bg-gradient-to-t from-black/80 via-black/50 to-transparent backdrop-blur-md px-4 pt-8 pb-6 flex flex-col items-center justify-end">
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
              </>
            )}
          </div>

          {/* Right panel: comments - same size as photo, hugging */}
          {commentsOpen && (
            <div className="flex h-full min-w-0 flex-1 flex-col border-l border-gray-700/50 bg-gray-800">
              <div className="flex shrink-0 items-center justify-between border-b border-gray-700 px-3 py-2.5">
                <h2 className="text-base font-semibold text-white">Comments</h2>
                <button
                  type="button"
                  onClick={handleCommentPanelClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 focus:ring-offset-gray-800"
                  aria-label="Close comments"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div
                ref={commentsListRef}
                className="min-h-0 flex-1 overflow-y-auto px-3 py-2"
              >
                {placeComments.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-500">
                    No comments yet.
                  </p>
                ) : (
                  <CommentList
                    comments={placeComments}
                    onReplyClick={handleReplyClick}
                  />
                )}
              </div>
              <form
                onSubmit={handleAddComment}
                className="flex shrink-0 flex-col gap-1.5 border-t border-gray-700 bg-gray-800 px-3 py-2"
              >
                {replyingTo && (
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Replying to {replyingTo.username}</span>
                    <button
                      type="button"
                      onClick={handleCancelReply}
                      className="text-gray-500 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-600 flex items-center justify-center text-xs font-medium text-white">
                    Y
                  </div>
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={
                      replyingTo
                        ? `Reply to ${replyingTo.username}...`
                        : "Write a comment..."
                    }
                    className="min-w-0 flex-1 rounded-lg border border-gray-600 bg-gray-700/80 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[var(--color-main)] focus:outline-none focus:ring-1 focus:ring-[var(--color-main)]"
                    aria-label={
                      replyingTo ? "Write a reply" : "Write a comment"
                    }
                  />
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="shrink-0 rounded-lg bg-[var(--color-main)] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          )}
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
