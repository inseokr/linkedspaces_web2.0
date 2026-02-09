"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import {
  X,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Link as LinkIcon,
} from "lucide-react";
import SentimentIcon from "@/components/ui/SentimentIcon";
import type { MockFeedPost } from "@/lib/mockNetwork";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";

export interface FeedPlaceModalProps {
  post: MockFeedPost | null;
  onClose: () => void;
}

function googleSearchUrl(post: MockFeedPost): string {
  const query = post.cityName
    ? `${post.placeName}, ${post.cityName}`
    : post.placeName;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

const ACTION_ICONS = [
  { key: "like", Icon: Heart, label: "Like" },
  { key: "comment", Icon: MessageCircle, label: "Comment" },
  { key: "bookmark", Icon: Bookmark, label: "Bookmark" },
  { key: "share", Icon: Share2, label: "Share" },
  { key: "link", Icon: LinkIcon, label: "Go to link" },
] as const;

export default function FeedPlaceModal({ post, onClose }: FeedPlaceModalProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  const handleShare = useCallback(async () => {
    if (!post) return;
    const text = post.cityName
      ? `${post.placeName}, ${post.cityName}`
      : post.placeName;
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: post.placeName,
          text,
          url: url || undefined,
        });
      } else {
        await navigator.clipboard?.writeText(url || text);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        try {
          await navigator.clipboard?.writeText(url || text);
        } catch {}
      }
    }
  }, [post]);

  const handleOpenLink = useCallback(() => {
    if (!post) return;
    window.open(googleSearchUrl(post), "_blank", "noopener,noreferrer");
  }, [post]);

  const handleActionClick = useCallback(
    (key: string) => {
      if (key === "like") setLiked((prev) => !prev);
      else if (key === "comment") {
        // Could open a comments panel later
      } else if (key === "bookmark") setBookmarked((prev) => !prev);
      else if (key === "share") handleShare();
      else if (key === "link") handleOpenLink();
    },
    [handleShare, handleOpenLink],
  );

  if (!post) return null;

  const { src, unoptimized } = normalizeImageSrc(post.imageUrl);
  const avatarInput =
    post.userAvatarUrl ??
    (post.username
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.username)}`
      : undefined);
  const { src: avatarSrc, unoptimized: avatarUnoptimized } =
    normalizeImageSrc(avatarInput);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Place detail"
      onKeyDown={handleKeyDown}
    >
      {/* Dark overlay - click to close */}
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* User sentiment - top right (left of Close), consistent with Top Places / View All */}
        {post.sentiment && (
          <div
            className="absolute right-14 top-2 z-20 flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-white"
            aria-label={`User sentiment: ${post.sentiment === "positive" ? "Positive" : post.sentiment === "negative" ? "Negative" : "Neutral"}`}
          >
            <span className="text-[11px] font-medium text-white/90">
              User sentiment
            </span>
            <SentimentIcon
              sentiment={post.sentiment}
              size={28}
              className="shrink-0"
            />
          </div>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Full photo */}
        <div className="relative aspect-[4/3] w-full bg-gray-900">
          <Image
            src={src}
            alt=""
            fill
            unoptimized={unoptimized}
            className="object-contain"
            sizes="(max-width: 512px) 100vw, 512px"
          />

          {/* Right side: vertical action buttons (like PlaceLightboxModal) */}
          <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
            {ACTION_ICONS.map(({ key, Icon, label }) => {
              const isLike = key === "like";
              const isBookmark = key === "bookmark";
              const isLink = key === "link";
              const isActive = (isLike && liked) || (isBookmark && bookmarked);
              if (isLink) {
                return (
                  <a
                    key={key}
                    href={googleSearchUrl(post)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/90 text-white/90 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </a>
                );
              }
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
                    key === "comment" && post.commentCount > 0
                      ? `${label} (${post.commentCount})`
                      : label
                  }
                  aria-pressed={isActive}
                >
                  <Icon
                    className={`h-5 w-5 ${isLike && liked ? "fill-current" : ""} ${isBookmark && bookmarked ? "fill-current" : ""}`}
                    strokeWidth={1.5}
                  />
                  {key === "comment" && post.commentCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-gray-800">
                      {post.commentCount > 99 ? "99+" : post.commentCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom overlay: friend + place name (link) + time */}
          <div className="absolute bottom-0 left-0 right-0 min-h-[100px] bg-gradient-to-t from-black/80 via-black/50 to-transparent px-4 pt-6 pb-4">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/30">
                <Image
                  src={avatarSrc}
                  alt=""
                  fill
                  unoptimized={avatarUnoptimized}
                  className="object-cover"
                  sizes="32px"
                />
              </div>
              <span className="font-medium text-white">{post.username}</span>
              <span className="text-white/60">·</span>
              <span className="text-sm text-white/80">{post.timeAgo}</span>
            </div>
            <h2 className="mt-2">
              <a
                href={googleSearchUrl(post)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-white hover:underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded"
              >
                {post.placeName}
                {post.cityName ? `, ${post.cityName}` : ""}
              </a>
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
