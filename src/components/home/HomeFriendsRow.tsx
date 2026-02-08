"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MockFriend, MockFeedPost } from "@/lib/mockNetwork";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";

const FRIENDS_PER_PAGE = 6;

/** Format as "Place Name, City Name", stripping redundant (City) from placeName when cityName exists. */
function formatActivityLine(placeName: string, cityName?: string): string {
  const place = (placeName ?? "").trim();
  const city = (cityName ?? "").trim();
  if (!place) return city || "—";
  if (!city) return place;
  const inParens = place.match(/\(([^)]+)\)\s*$/);
  if (inParens && inParens[1].trim().toLowerCase() === city.toLowerCase()) {
    return `${place.replace(/\s*\([^)]+\)\s*$/, "").trim()}, ${city}`;
  }
  return `${place}, ${city}`;
}

export interface HomeFriendsRowProps {
  friends: MockFriend[];
  onFriendClick?: (friendId: string) => void;
  selectedFriendId?: string | null;
  feedPosts?: MockFeedPost[];
  isEmpty?: boolean;
  loading?: boolean;
}

export default function HomeFriendsRow({
  friends,
  onFriendClick,
  selectedFriendId,
  feedPosts = [],
  isEmpty,
  loading,
}: HomeFriendsRowProps) {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  const maxPage = Math.max(0, Math.ceil(friends.length / FRIENDS_PER_PAGE) - 1);
  const effectivePage = Math.min(page, maxPage);
  const visibleFriends = useMemo(
    () =>
      friends.slice(
        effectivePage * FRIENDS_PER_PAGE,
        effectivePage * FRIENDS_PER_PAGE + FRIENDS_PER_PAGE,
      ),
    [friends, effectivePage],
  );
  const showArrows = friends.length > FRIENDS_PER_PAGE;

  const activitiesByFriend = useMemo(() => {
    const map = new Map<string, MockFeedPost[]>();
    for (const p of feedPosts) {
      const key = (p.username ?? "").trim().toLowerCase();
      if (!key) continue;
      const list = map.get(key) ?? [];
      list.push(p);
      map.set(key, list);
    }
    map.forEach((list) => list.sort((a, b) => 0));
    return map;
  }, [feedPosts]);

  useEffect(() => {
    if (!openPopoverId) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpenPopoverId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openPopoverId]);

  if (loading) {
    return (
      <section className="w-full">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--card-text-muted)]">
          Friends
        </h2>
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-gray-200"
            />
          ))}
        </div>
      </section>
    );
  }

  if (isEmpty || friends.length === 0) {
    return (
      <section className="w-full">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--card-text-muted)]">
          Friends
        </h2>
        <p className="text-sm text-[var(--card-text-muted)]">
          Add friends to see their activity here.
        </p>
      </section>
    );
  }

  return (
    <section className="relative z-20 w-full">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--card-text-muted)]">
          Friends
        </h2>
        <Link
          href="/profile"
          className="text-xs font-medium text-[var(--color-main)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-1 rounded"
        >
          View all
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {showArrows && (
          <button
            type="button"
            onClick={() =>
              setPage((p) => Math.max(0, Math.min(p - 1, maxPage)))
            }
            disabled={effectivePage === 0}
            aria-label="Previous friends"
            className="relative z-30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--card-border)] bg-white text-[var(--card-text)] shadow-sm transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
        )}
        <div className="relative z-0 flex min-w-0 flex-1 gap-4 isolate pb-2">
          {visibleFriends.map((friend) => {
            const isSelected =
              selectedFriendId === friend.id ||
              selectedFriendId === friend.username;
            const key = (friend.username ?? "").toLowerCase();
            const activities = (activitiesByFriend.get(key) ?? []).slice(0, 2);
            const isPopoverOpen = openPopoverId === friend.id;
            const { src, unoptimized } = normalizeImageSrc(friend.avatarUrl);

            return (
              <div
                key={friend.id}
                className="relative z-0 shrink-0"
                ref={isPopoverOpen ? popoverRef : undefined}
              >
                <button
                  type="button"
                  onClick={() => onFriendClick?.(friend.id)}
                  onMouseEnter={() => setOpenPopoverId(friend.id)}
                  onMouseLeave={() => setOpenPopoverId(null)}
                  onFocus={() => setOpenPopoverId(friend.id)}
                  onBlur={() => setOpenPopoverId(null)}
                  className="flex shrink-0 flex-col items-center gap-2 rounded-full focus:outline-none focus-visible:outline-none"
                  aria-label={`Filter by ${friend.username}`}
                  aria-pressed={isSelected}
                >
                  <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 shadow-sm">
                    <Image
                      src={src}
                      alt=""
                      fill
                      unoptimized={unoptimized}
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <span className="max-w-[72px] truncate text-xs text-[var(--card-text-muted)]">
                    {friend.username}
                  </span>
                </button>
                {isPopoverOpen && activities.length > 0 && (
                  <div
                    className="absolute left-1/2 top-full z-50 mt-1 w-56 -translate-x-1/2 rounded-lg border border-[var(--card-border)] bg-white p-3 shadow-lg"
                    role="tooltip"
                  >
                    <p className="mb-2 text-xs font-semibold text-[var(--card-text)]">
                      Last Moments
                    </p>
                    <ul className="space-y-2">
                      {activities.map((p) => (
                        <li
                          key={p.id}
                          className="text-xs text-[var(--card-text-muted)] leading-snug"
                        >
                          {formatActivityLine(p.placeName, p.cityName)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {showArrows && (
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            disabled={effectivePage >= maxPage}
            aria-label="Next friends"
            className="relative z-30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--card-border)] bg-white text-[var(--card-text)] shadow-sm transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        )}
      </div>
    </section>
  );
}
