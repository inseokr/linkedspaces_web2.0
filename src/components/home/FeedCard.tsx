"use client";

import Image from "next/image";
import { Heart, MessageCircle, MoreVertical } from "lucide-react";
import type { MockFeedPost } from "@/lib/mockNetwork";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";

export interface FeedCardProps {
  post: MockFeedPost;
  onMenuClick?: (postId: string) => void;
}

export default function FeedCard({ post, onMenuClick }: FeedCardProps) {
  const { src, unoptimized } = normalizeImageSrc(post.imageUrl);
  const avatarInput =
    post.userAvatarUrl ??
    (post.username
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.username)}`
      : undefined);
  const { src: avatarSrc, unoptimized: avatarUnoptimized } =
    normalizeImageSrc(avatarInput);

  return (
    <article className="rounded-2xl border border-[var(--card-border)] bg-white shadow-sm overflow-hidden">
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
            <span className="font-medium text-emerald-700">
              {post.placeName}
            </span>
          </p>
          <p className="text-xs text-[var(--card-text-muted)]">
            {post.timeAgo}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onMenuClick?.(post.id)}
          className="shrink-0 rounded-full p-1.5 text-[var(--card-text-muted)] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
          aria-label="More options"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
      {/* Main image */}
      <div className="relative aspect-[4/3] w-full bg-gray-100">
        <Image
          src={src}
          alt=""
          fill
          unoptimized={unoptimized}
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 600px"
        />
      </div>
      {/* Bottom row: like and comment counts */}
      <div className="flex items-center gap-4 px-3 py-2 text-sm text-[var(--card-text-muted)]">
        <span className="flex items-center gap-1.5">
          <Heart className="h-4 w-4" />
          {post.likeCount}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4" />
          {post.commentCount}
        </span>
      </div>
    </article>
  );
}
