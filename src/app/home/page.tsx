"use client";

import { useMemo, useEffect, useState } from "react";
import HomeFriendsRow from "@/components/home/HomeFriendsRow";
import PulseCard from "@/components/home/PulseCard";
import RecapBlogsCarousel from "@/components/home/RecapBlogsCarousel";
import FeedList from "@/components/home/FeedList";
import {
  MOCK_FRIENDS,
  MOCK_RECAP_BLOGS,
  MOCK_FEED_POSTS,
} from "@/lib/mockNetwork";
import { getCachedUser, type User } from "@/api/user";
import {
  getHomeFriends,
  getHomeDirectFriendUsernames,
  getHomeRecapBlogs,
  getHomeFeedPosts,
} from "@/lib/homeNetworkData";
import {
  getFriendsVisitHistory,
  getFriendsTrips,
  getUserVisitHistory,
} from "@/api/lsHomeApi";
import {
  feedPostsFromFriendsVisitHistory,
  recapBlogsFromFriendsTrips,
} from "@/lib/lsHomeMappers";
import type { MockFeedPost, MockRecapBlog } from "@/lib/mockNetwork";

export default function HomePage() {
  // IMPORTANT: do NOT read cached user during render (SSR + first client render must match).
  // Otherwise, server renders with `null` while client reads localStorage and immediately
  // renders a different tree, causing hydration mismatches.
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCachedUser());
  }, []);

  const [friendsFeed, setFriendsFeed] = useState<MockFeedPost[] | null>(null);
  const [friendsRecap, setFriendsRecap] = useState<MockRecapBlog[] | null>(
    null,
  );

  useEffect(() => {
    if (!user?.username) {
      if (process.env.NODE_ENV === "development") {
        console.debug(
          "[Home] skip friends network load: missing user.username",
          {
            userIsNull: user == null,
            cachedUsername: user?.username,
          },
        );
      }
      return;
    }

    let cancelled = false;
    const friendUsernames = getHomeDirectFriendUsernames(user);
    console.log("[Home] direct friend usernames:", friendUsernames);
    const normalizedFriendUsernames = friendUsernames
      .map((u) =>
        String(u ?? "")
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean);
    const allowed =
      friendUsernames.length > 0 ? new Set(normalizedFriendUsernames) : null;

    // Preserve original casing for requests while deduping case-insensitively.
    const friendUsernamesUnique = Array.from(
      friendUsernames.reduce((acc, u) => {
        const trimmed = String(u ?? "").trim();
        if (!trimmed) return acc;
        const key = trimmed.toLowerCase();
        if (!acc.has(key)) acc.set(key, trimmed);
        return acc;
      }, new Map<string, string>()),
    ).map(([, v]) => v);

    if (process.env.NODE_ENV === "development") {
      const directFriends = (user as any)?.direct_friends;
      console.debug("[Home] friend usernames (pre-filter)", {
        user: user.username,
        friendsFieldType: Array.isArray((user as any)?.friends)
          ? "array"
          : typeof (user as any)?.friends,
        friendsFieldCount: Array.isArray((user as any)?.friends)
          ? (user as any).friends.length
          : null,
        directFriendsType: Array.isArray(directFriends)
          ? "array"
          : directFriends == null
            ? "nullish"
            : typeof directFriends,
        friendUsernamesCount: friendUsernames.length,
        friendUsernamesSample: friendUsernames.slice(0, 10),
        normalizedCount: normalizedFriendUsernames.length,
        normalizedSample: normalizedFriendUsernames.slice(0, 10),
        allowedIsNull: allowed == null,
        allowedSize: allowed?.size ?? 0,
        allowedSample: allowed ? Array.from(allowed).slice(0, 10) : [],
      });
    }

    if (friendUsernamesUnique.length === 0) {
      // Keep `friendsFeed/friendsRecap` as null so UI falls back to user-based network data.
      return () => {
        cancelled = true;
      };
    }

    const mapWithConcurrency = async <T, R>(
      items: T[],
      limit: number,
      fn: (item: T) => Promise<R>,
    ): Promise<R[]> => {
      const results: R[] = new Array(items.length);
      let idx = 0;
      const workers = new Array(Math.min(limit, items.length))
        .fill(0)
        .map(async () => {
          while (!cancelled) {
            const i = idx++;
            if (i >= items.length) return;
            results[i] = await fn(items[i]);
          }
        });
      await Promise.all(workers);
      return results;
    };

    (async () => {
      // Preferred strategy: iterate friend list and load per friend.
      const perFriend = await mapWithConcurrency(
        friendUsernamesUnique,
        4,
        async (friendUsername) => {
          console.log(
            "[Home] loading visit history and trips for:",
            friendUsername,
          );
          const [visitRes, tripsRes] = await Promise.all([
            getUserVisitHistory(friendUsername, { showAll: true }),
            getFriendsTrips(friendUsername),
          ]);
          // let's print out the length of the visitRes and tripsRes
          console.log("[Home] visit history:", visitRes);
          return { friendUsername, visitRes, tripsRes };
        },
      );

      if (cancelled) return;

      const anySuccess = perFriend.some(
        (r) => r.visitRes.success || r.tripsRes.success,
      );

      // Fallback: if per-friend calls all failed, use the previous bulk endpoints.
      if (!anySuccess) {
        const [visitRes, tripsRes] = await Promise.all([
          getFriendsVisitHistory(user.username),
          getFriendsTrips(user.username),
        ]);
        if (cancelled) return;

        if (process.env.NODE_ENV === "development") {
          console.log(
            "[Home] loadFriendsVisitHistory (bulk fallback):",
            visitRes.success
              ? `ok, ${visitRes.data.length} entries`
              : visitRes.error,
          );
          console.log(
            "[Home] loadFriendsTrip (bulk fallback):",
            tripsRes.success
              ? `ok, ${tripsRes.data.length} trips`
              : tripsRes.error,
          );
        }

        if (visitRes.success) {
          const filtered =
            allowed != null
              ? visitRes.data.filter((e) =>
                  allowed.has(
                    String(e?.username ?? "")
                      .trim()
                      .toLowerCase(),
                  ),
                )
              : visitRes.data;
          setFriendsFeed(feedPostsFromFriendsVisitHistory(filtered));
        }
        if (tripsRes.success) {
          const filtered =
            allowed != null
              ? tripsRes.data.filter((t) => {
                  const owner = String(
                    (t as any)?.username ?? (t as any)?.owner ?? "",
                  )
                    .trim()
                    .toLowerCase();
                  return owner ? allowed.has(owner) : false;
                })
              : tripsRes.data;
          setFriendsRecap(recapBlogsFromFriendsTrips(filtered));
        }
        return;
      }

      const visitEntries = perFriend.flatMap((r) => {
        if (!r.visitRes.success) return [];
        // Ensure username is present/consistent for downstream mapping.
        return r.visitRes.data.map((e) => ({
          ...e,
          username:
            String(e?.username ?? r.friendUsername ?? "unknown") || "unknown",
        }));
      });

      const trips = perFriend.flatMap((r) => {
        if (!r.tripsRes.success) return [];
        return r.tripsRes.data.map((t) => {
          const un = String(
            (t as any)?.username ?? (t as any)?.owner ?? r.friendUsername ?? "",
          ).trim();
          return {
            ...t,
            username: un || (t as any)?.username,
            owner: (t as any)?.owner ?? (un || undefined),
          };
        });
      });

      const visitEntriesFiltered =
        allowed != null
          ? visitEntries.filter((e) =>
              allowed.has(
                String(e?.username ?? "")
                  .trim()
                  .toLowerCase(),
              ),
            )
          : visitEntries;

      const tripsFiltered =
        allowed != null
          ? trips.filter((t) => {
              const owner = String(
                (t as any)?.username ?? (t as any)?.owner ?? "",
              )
                .trim()
                .toLowerCase();
              return owner ? allowed.has(owner) : false;
            })
          : trips;

      if (process.env.NODE_ENV === "development") {
        const okVisits = perFriend.filter((r) => r.visitRes.success).length;
        const okTrips = perFriend.filter((r) => r.tripsRes.success).length;
        console.debug("[Home] per-friend network load", {
          friendsRequested: friendUsernamesUnique.length,
          okVisits,
          okTrips,
          visitEntries: visitEntriesFiltered.length,
          trips: tripsFiltered.length,
        });
      }

      // These setters intentionally accept [] (not null) so Home won't fall back to mocks
      // when friends exist but the network returns no posts/trips.
      setFriendsFeed(feedPostsFromFriendsVisitHistory(visitEntriesFiltered));
      setFriendsRecap(recapBlogsFromFriendsTrips(tripsFiltered));
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const { friends, recapBlogs, feedPosts } = useMemo(() => {
    const realFriends = getHomeFriends(user ?? null);
    const realRecap = getHomeRecapBlogs(user ?? null);
    const realFeed = getHomeFeedPosts(user ?? null);

    const recapResolved =
      friendsRecap !== null
        ? friendsRecap.length > 0
          ? friendsRecap
          : []
        : realRecap.length > 0
          ? realRecap
          : MOCK_RECAP_BLOGS;

    const feedResolved =
      friendsFeed !== null
        ? friendsFeed
        : realFriends.length > 0
          ? realFeed.length > 0
            ? realFeed
            : MOCK_FEED_POSTS
          : realFeed.length > 0
            ? realFeed
            : MOCK_FEED_POSTS;

    const friendsResolved = realFriends.length > 0 ? realFriends : MOCK_FRIENDS;
    const avatarByUsername = new Map(
      friendsResolved
        .map(
          (f) =>
            [
              String(f?.username ?? "")
                .trim()
                .toLowerCase(),
              f?.avatarUrl,
            ] as const,
        )
        .filter(([k, v]) => Boolean(k) && Boolean(v)),
    );

    // Ensure feed posts reuse the same profile picture as the Friends row.
    const feedWithAvatars = feedResolved.map((p) => {
      if (p?.userAvatarUrl) return p;
      const key = String(p?.username ?? "")
        .trim()
        .toLowerCase();
      const avatarUrl = key ? avatarByUsername.get(key) : undefined;
      return avatarUrl ? { ...p, userAvatarUrl: avatarUrl } : p;
    });

    return {
      friends: friendsResolved,
      recapBlogs: recapResolved,
      feedPosts: feedWithAvatars,
    };
  }, [user, friendsFeed, friendsRecap]);

  const handleFriendClick = (friendId: string) => {
    if (typeof window !== "undefined") {
      console.log("[Home] friend clicked:", friendId);
    }
  };

  const handleInviteFriends = () => {
    if (typeof window !== "undefined") {
      console.log("[Home] Invite Friends clicked");
    }
  };

  const handleFeedMenuClick = (postId: string) => {
    if (typeof window !== "undefined") {
      console.log("[Home] feed menu:", postId);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12">
          <HomeFriendsRow friends={friends} onFriendClick={handleFriendClick} />
          <PulseCard onInviteFriends={handleInviteFriends} />
          <RecapBlogsCarousel items={recapBlogs} />
          <FeedList posts={feedPosts} onMenuClick={handleFeedMenuClick} />
        </div>
      </div>
    </div>
  );
}
