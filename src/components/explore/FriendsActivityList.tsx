"use client";

import Image from "next/image";
import type { NetworkFriendActivity } from "@/lib/explore/exploreTypes";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";

const ACTION_LABELS: Record<NetworkFriendActivity["action"], string> = {
  "saved a place": "saved a place",
  "added photos": "added photos",
  "published a recap": "published a recap",
};

export interface FriendsActivityListProps {
  activities: NetworkFriendActivity[];
  onActivityClick?: (activity: NetworkFriendActivity) => void;
  isLoading?: boolean;
}

export default function FriendsActivityList({
  activities,
  onActivityClick,
  isLoading,
}: FriendsActivityListProps) {
  if (isLoading) {
    return (
      <section className="w-full" aria-label="Friends activity">
        <h2 className="mb-3 text-xl font-semibold text-[var(--card-text)]">
          Friends Activity
        </h2>
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-lg bg-[var(--color-neutral)]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (activities.length === 0) return null;

  return (
    <section className="w-full" aria-label="Friends activity">
      <h2 className="mb-3 text-xl font-semibold text-[var(--card-text)]">
        Friends Activity
      </h2>
      <ul className="flex flex-col gap-2">
        {activities.map((activity) => (
          <li key={activity.id}>
            <button
              type="button"
              onClick={() => onActivityClick?.(activity)}
              className="flex w-full items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-3 text-left transition-colors hover:bg-[var(--color-neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[var(--card-border)]">
                {activity.friendAvatarUrl ? (
                  <Image
                    src={normalizeImageSrc(activity.friendAvatarUrl).src}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="h-full w-full bg-[var(--color-neutral)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[var(--card-text)]">
                  <span className="font-medium">{activity.friendName}</span>
                  <span className="text-[var(--card-text-muted)]">
                    {" "}
                    {ACTION_LABELS[activity.action]}
                    {activity.actionDetail ? `: ${activity.actionDetail}` : ""}
                  </span>
                </p>
                <p className="text-xs text-[var(--card-text-muted)]">
                  {activity.timeAgo}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
