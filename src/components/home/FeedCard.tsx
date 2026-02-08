"use client";

import Image from "next/image";
import {
  Heart,
  MessageCircle,
  MoreVertical,
  Bookmark,
  Share2,
  Link as LinkIcon,
} from "lucide-react";
import type { MockFeedPost } from "@/lib/mockNetwork";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";

function googleSearchUrl(post: MockFeedPost): string {
  const query = post.cityName
    ? `${post.placeName}, ${post.cityName}`
    : post.placeName;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export interface FeedCardProps {
  post: MockFeedPost;
  onMenuClick?: (postId: string) => void;
  onCardClick?: (post: MockFeedPost) => void;
  isNew?: boolean;
  compact?: boolean;
}

export default function FeedCard({
  post,
  onMenuClick,
  onCardClick,
  isNew,
  compact,
}: FeedCardProps) {
  const { src, unoptimized } = normalizeImageSrc(post.imageUrl);
  const avatarInput =
    post.userAvatarUrl ??
    (post.username
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.username)}`
      : undefined);
  const { src: avatarSrc, unoptimized: avatarUnoptimized } =
    normalizeImageSrc(avatarInput);

  return (
    <article
      className={`relative rounded-2xl border border-[var(--card-border)] bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-[var(--color-main)] focus-within:ring-offset-2 ${
        compact ? "rounded-lg cursor-pointer" : ""
      }`}
      {...(compact && onCardClick
        ? {
            role: "button" as const,
            tabIndex: 0,
            "aria-label": `View ${post.placeName}`,
            onClick: () => onCardClick(post),
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCardClick(post);
              }
            },
          }
        : {})}
    >
      {isNew && (
        <span
          className="absolute right-2 top-2 z-10 h-2 w-2 rounded-full bg-[var(--color-main)]"
          aria-hidden
        />
      )}
      {/* Top row: avatar, username + "visited", place name, time, kebab */}
      <div className="flex items-center gap-3 p-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200">
          <Image
            src={avatarSrc}
            alt=""
            fill
            unoptimized={avatarUnoptimized}
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-[var(--card-text)]">
            <span className="font-medium">{post.username}</span>
            <span className="text-[var(--card-text-muted)]"> visited </span>
            <a
              href={googleSearchUrl(post)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-emerald-700 hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-1 rounded"
            >
              {post.placeName}
            </a>
          </p>
          <p className="text-xs text-[var(--card-text-muted)]">
            {post.timeAgo}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMenuClick?.(post.id);
          }}
          className="shrink-0 rounded-full p-1.5 text-[var(--card-text-muted)] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
          aria-label="More options"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
      {/* Main image - clickable for modal (only in non-compact) */}
      <div
        {...(!compact && onCardClick
          ? {
              role: "button" as const,
              tabIndex: 0,
              onClick: () => onCardClick(post),
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onCardClick(post);
                }
              },
            }
          : {})}
        className={`relative w-full bg-gray-100 ${compact ? "hidden" : "aspect-[4/3]"}`}
        aria-label={compact ? undefined : `View ${post.placeName}`}
      >
        <Image
          src={src}
          alt=""
          fill
          unoptimized={unoptimized}
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 600px"
        />
      </div>
      {/* Bottom row: like/comment counts (left) + Bookmark, Share, Link (right) - hide in compact */}
      {!compact && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-[var(--card-text-muted)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              {post.likeCount}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              {post.commentCount}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="rounded-full p-1.5 text-[var(--card-text-muted)] hover:bg-gray-100 hover:text-[var(--card-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
              aria-label="Bookmark"
            >
              <Bookmark className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="rounded-full p-1.5 text-[var(--card-text-muted)] hover:bg-gray-100 hover:text-[var(--card-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <a
              href={googleSearchUrl(post)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="rounded-full p-1.5 text-[var(--card-text-muted)] hover:bg-gray-100 hover:text-[var(--card-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
              aria-label="Open in Google"
            >
              <LinkIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </article>
  );
}
