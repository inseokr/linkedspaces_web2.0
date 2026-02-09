"use client";

import { useEffect, useMemo, useRef, useState, memo } from "react";
import type { MockFeedPost } from "@/lib/mockNetwork";
import FeedCard from "./FeedCard";
import PlaceLightboxModal from "@/app/profile/top-places/components/PlaceLightboxModal";
import type { LightboxImage } from "@/app/profile/top-places/components/PlaceLightboxModal";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";
import type { FeedSortMode } from "@/app/home/useHomeUIState";

function postToLightboxImages(post: MockFeedPost): LightboxImage[] {
  const { src } = normalizeImageSrc(post.imageUrl);
  return [
    {
      src,
      placeName: post.placeName,
      dateTime: post.timeAgo,
      placeId: post.placeId,
      placeCity: post.cityName,
      visibility: "public",
      sentiment: post.sentiment,
    },
  ];
}

export interface FeedListProps {
  posts: MockFeedPost[];
  onMenuClick?: (postId: string) => void;
  pageSize?: number;
  isLoading?: boolean;
  sortMode?: FeedSortMode;
  onSortChange?: (mode: FeedSortMode) => void;
  selectedFriend?: string | null;
  onClearFriendFilter?: () => void;
  friendUsername?: string;
  lastSeenFeedLength?: number;
}

const SORT_OPTIONS: { value: FeedSortMode; label: string }[] = [
  { value: "Newest", label: "Newest" },
  { value: "Most liked", label: "Most liked" },
  { value: "Most commented", label: "Most commented" },
];

function sortPosts(posts: MockFeedPost[], mode: FeedSortMode): MockFeedPost[] {
  if (mode === "Newest") return [...posts];
  if (mode === "Most liked")
    return [...posts].sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
  if (mode === "Most commented")
    return [...posts].sort(
      (a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0),
    );
  return [...posts];
}

const FeedCardMemo = memo(FeedCard);

export default function FeedList({
  posts,
  onMenuClick,
  pageSize = 20,
  isLoading,
  sortMode = "Newest",
  onSortChange,
  selectedFriend,
  onClearFriendFilter,
  friendUsername,
  lastSeenFeedLength = 0,
}: FeedListProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [modalPost, setModalPost] = useState<MockFeedPost | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const sortedPosts = useMemo(
    () => sortPosts(posts, sortMode),
    [posts, sortMode],
  );

  const canLoadMore = visibleCount < sortedPosts.length;
  const visiblePosts = useMemo(
    () => sortedPosts.slice(0, Math.min(visibleCount, sortedPosts.length)),
    [sortedPosts, visibleCount],
  );

  useEffect(() => {
    if (!canLoadMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        setVisibleCount((c) => Math.min(c + pageSize, posts.length));
      },
      { root: null, rootMargin: "600px 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [canLoadMore, pageSize, posts.length]);

  if (isLoading) {
    return (
      <section className="w-full">
        <h2 className="mb-3 text-xl font-semibold text-[var(--card-text)]">
          Feed
        </h2>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl bg-gray-200"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-[var(--card-text)]">
            Feed
          </h2>
          {friendUsername && (
            <button
              type="button"
              onClick={onClearFriendFilter}
              className="rounded-full bg-[var(--color-main)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--color-main)] hover:bg-[var(--color-main)]/25 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
            >
              {friendUsername} ×
            </button>
          )}
        </div>
        <select
          value={sortMode}
          onChange={(e) => onSortChange?.(e.target.value as FeedSortMode)}
          className="rounded-lg border border-[var(--card-border)] bg-white px-2 py-1.5 text-sm text-[var(--card-text)] focus:border-[var(--color-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
          aria-label="Sort feed"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <ul className="flex flex-col gap-4">
        {visiblePosts.map((post, index) => {
          const newThreshold = Math.max(
            0,
            sortedPosts.length - lastSeenFeedLength,
          );
          return (
            <li key={post.id}>
              <FeedCardMemo
                post={post}
                onMenuClick={onMenuClick}
                onCardClick={setModalPost}
                isNew={lastSeenFeedLength > 0 && index < newThreshold}
              />
            </li>
          );
        })}
      </ul>

      {canLoadMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((c) => Math.min(c + pageSize, posts.length))
            }
            className="rounded-full border border-[var(--card-border)] bg-white px-5 py-2 text-sm font-medium text-[var(--card-text)] shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
          >
            Load more
          </button>
        </div>
      )}

      <div ref={sentinelRef} className="h-1 w-full" />

      <PlaceLightboxModal
        isOpen={!!modalPost}
        onClose={() => setModalPost(null)}
        images={modalPost ? postToLightboxImages(modalPost) : []}
        startIndex={0}
      />
    </section>
  );
}
