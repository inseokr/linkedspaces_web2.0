"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MockFeedPost } from "@/lib/mockNetwork";
import FeedCard from "./FeedCard";

export interface FeedListProps {
  posts: MockFeedPost[];
  onMenuClick?: (postId: string) => void;
  pageSize?: number;
}

export default function FeedList({
  posts,
  onMenuClick,
  pageSize = 20,
}: FeedListProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const canLoadMore = visibleCount < posts.length;

  const visiblePosts = useMemo(
    () => posts.slice(0, Math.min(visibleCount, posts.length)),
    [posts, visibleCount],
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

  return (
    <section className="w-full">
      <h2 className="mb-4 text-lg font-semibold text-[var(--card-text)]">
        Feed
      </h2>
      <ul className="flex flex-col gap-6">
        {visiblePosts.map((post) => (
          <li key={post.id}>
            <FeedCard post={post} onMenuClick={onMenuClick} />
          </li>
        ))}
      </ul>

      {canLoadMore ? (
        <div className="mt-6 flex justify-center">
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
      ) : null}

      {/* Auto-load more when scrolling near the bottom */}
      <div ref={sentinelRef} className="h-1 w-full" />
    </section>
  );
}
