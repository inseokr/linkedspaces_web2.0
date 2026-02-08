"use client";

import Image from "next/image";
import type { MockFriend } from "@/lib/mockNetwork";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";

export interface HomeFriendsRowProps {
  friends: MockFriend[];
  onFriendClick?: (friendId: string) => void;
}

export default function HomeFriendsRow({
  friends,
  onFriendClick,
}: HomeFriendsRowProps) {
  return (
    <section className="w-full">
      <h2 className="mb-4 text-lg font-semibold text-[var(--card-text)]">
        Friends
      </h2>
      <div className="flex gap-6 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {friends.map((friend) => {
          const { src, unoptimized } = normalizeImageSrc(friend.avatarUrl);
          return (
            <button
              key={friend.id}
              type="button"
              onClick={() => onFriendClick?.(friend.id)}
              className="flex shrink-0 flex-col items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 rounded-full"
              aria-label={`View ${friend.username}`}
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 ring-2 ring-white shadow-sm">
                <Image
                  src={src}
                  alt=""
                  fill
                  unoptimized={unoptimized}
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <span className="max-w-[80px] truncate text-sm text-[var(--card-text-muted)]">
                {friend.username}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
