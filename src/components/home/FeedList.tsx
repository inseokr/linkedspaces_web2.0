"use client";

import type { MockFeedPost } from "@/lib/mockNetwork";
import FeedCard from "./FeedCard";

export interface FeedListProps {
  posts: MockFeedPost[];
  onMenuClick?: (postId: string) => void;
}

export default function FeedList({ posts, onMenuClick }: FeedListProps) {
  return (
    <section className="w-full">
      <h2 className="mb-4 text-lg font-semibold text-[var(--card-text)]">
        Feed
      </h2>
      <ul className="flex flex-col gap-6">
        {posts.map((post) => (
          <li key={post.id}>
            <FeedCard post={post} onMenuClick={onMenuClick} />
          </li>
        ))}
      </ul>
    </section>
  );
}
