"use client";

import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import HomeFriendsRow from "@/components/home/HomeFriendsRow";
import PulseCard from "@/components/home/PulseCard";
import RecapsModule from "@/components/home/RecapsModule";
import FeedList from "@/components/home/FeedList";
import HomeStickyBar from "@/components/home/HomeStickyBar";
import NetworkSnapshotCard from "@/components/home/NetworkSnapshotCard";
import EmptyStateCard from "@/components/home/EmptyStateCard";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { getCachedUser, type User } from "@/api/user";
import {
  getHomeFriends,
  getHomeRecapBlogs,
  getHomeFeedPosts,
} from "@/lib/homeNetworkData";
import {
  feedPostsFromFriendsVisitHistory,
  recapBlogsFromFriendsTrips,
} from "@/lib/lsHomeMappers";
import { useFriendsNetwork } from "@/contexts/FriendsNetworkContext";
import { useHomeUIState } from "./useHomeUIState";
import type { MockFeedPost, MockRecapBlog } from "@/lib/mockNetwork";

function enrichFeedWithAvatars(
  posts: MockFeedPost[],
  avatarByUsername: Map<string, string>,
): MockFeedPost[] {
  return posts.map((p) => {
    if (p?.userAvatarUrl) return p;
    const key = String(p?.username ?? "")
      .trim()
      .toLowerCase();
    const avatarUrl = key ? avatarByUsername.get(key) : undefined;
    return avatarUrl ? { ...p, userAvatarUrl: avatarUrl } : p;
  });
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const feedSectionRef = useRef<HTMLDivElement>(null);
  const { visitEntries, trips, loading } = useFriendsNetwork();
  const {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    selectedFriend,
    setSelectedFriend,
    clearFriendFilter,
    sortMode,
    setSortMode,
    saveLastSeenFeedLength,
    getLastSeenFeedLength,
  } = useHomeUIState();

  useEffect(() => {
    queueMicrotask(() => setUser(getCachedUser()));
  }, []);

  const { friends, recapBlogs, feedPosts } = useMemo(() => {
    const realFriends = getHomeFriends(user ?? null);
    const realRecap = getHomeRecapBlogs(user ?? null);
    const realFeed = getHomeFeedPosts(user ?? null);

    const fromNetwork = visitEntries !== null && trips !== null;
    const recapResolved: MockRecapBlog[] =
      trips !== null ? recapBlogsFromFriendsTrips(trips) : realRecap;
    const feedResolved: MockFeedPost[] =
      visitEntries !== null
        ? feedPostsFromFriendsVisitHistory(visitEntries)
        : realFeed;

    const friendsResolved = realFriends;
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
        .filter(([k, v]) => Boolean(k) && v) as [string, string][],
    );
    const feedWithAvatars = enrichFeedWithAvatars(
      feedResolved,
      avatarByUsername,
    );

    return {
      friends: friendsResolved,
      recapBlogs: recapResolved,
      feedPosts: feedWithAvatars,
    };
  }, [user, visitEntries, trips]);

  const newActivityCount = useMemo(() => {
    const prev = getLastSeenFeedLength();
    const curr = feedPosts.length;
    return Math.max(0, curr - prev);
  }, [feedPosts.length, getLastSeenFeedLength]);

  useEffect(() => {
    return () => {
      saveLastSeenFeedLength(feedPosts.length);
    };
  }, [feedPosts.length, saveLastSeenFeedLength]);

  const q = searchQuery.trim().toLowerCase();
  const filteredFeedPosts = useMemo(() => {
    let list = feedPosts;
    if (selectedFriend) {
      const friendUsername = friends.find(
        (f) => f.id === selectedFriend || f.username === selectedFriend,
      )?.username;
      const match = friendUsername?.toLowerCase();
      if (match)
        list = list.filter((p) => (p.username ?? "").toLowerCase() === match);
    }
    if (activeFilter === "Blogs") return [];
    if (q) {
      list = list.filter(
        (p) =>
          (p.username ?? "").toLowerCase().includes(q) ||
          (p.placeName ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [feedPosts, selectedFriend, friends, activeFilter, q]);

  const filteredRecapBlogs = useMemo(() => {
    if (activeFilter === "Places") return [];
    let list = recapBlogs;
    if (q) {
      list = list.filter(
        (r) =>
          (r.authorUsername ?? "").toLowerCase().includes(q) ||
          (r.title ?? "").toLowerCase().includes(q) ||
          (r.locationLabel ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [recapBlogs, activeFilter, q]);

  const handleFriendClick = useCallback(
    (friendId: string) => {
      setSelectedFriend(friendId);
      setTimeout(() => {
        feedSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    },
    [setSelectedFriend],
  );

  const handleInviteFriends = useCallback(() => {
    // Placeholder: could open share sheet or modal
  }, []);

  const handleFeedMenuClick = useCallback((_postId: string) => {
    // Placeholder: could open menu
  }, []);

  const userPlaceTokens = useMemo(() => {
    const set = new Set<string>();
    const history = user?.placeVisitHistory ?? [];
    for (const p of history) {
      const name = (p as { placeName?: string; city?: string }).placeName ?? "";
      const city = (p as { city?: string }).city ?? "";
      name
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .forEach((t) => {
          if (t.length > 1) set.add(t);
        });
      city
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .forEach((t) => {
          if (t.length > 1) set.add(t);
        });
    }
    return set;
  }, [user?.placeVisitHistory]);

  const showRecaps = activeFilter === "All" || activeFilter === "Blogs";
  const showFeed = activeFilter === "All" || activeFilter === "Places";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] lg:h-[calc(100vh-77px)] lg:overflow-hidden lg:flex lg:flex-col">
      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 lg:min-h-0 lg:px-8">
        <HomeStickyBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          newActivityCount={newActivityCount}
        />

        <div className="mt-6 flex flex-1 flex-col gap-8 lg:min-h-0 lg:flex-row lg:gap-8">
          <div className="min-w-0 flex flex-col gap-8 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
            <HomeFriendsRow
              friends={friends}
              onFriendClick={handleFriendClick}
              selectedFriendId={selectedFriend}
              feedPosts={feedPosts}
              isEmpty={friends.length === 0}
              loading={loading}
            />
            {showRecaps && (
              <>
                {loading ? (
                  <RecapsModule
                    items={[]}
                    isLoading
                    viewMode={activeFilter === "Blogs" ? "grid" : "carousel"}
                  />
                ) : filteredRecapBlogs.length > 0 ? (
                  <RecapsModule
                    items={filteredRecapBlogs}
                    userPlaceTokens={userPlaceTokens}
                    viewMode={activeFilter === "Blogs" ? "grid" : "carousel"}
                  />
                ) : (
                  <EmptyStateCard
                    title="No blogs yet"
                    description="Add friends to see their recap blogs, or create your first blog from your trips."
                    actions={
                      <>
                        <Link href="/profile">
                          <Button variant="neutral" radius="md">
                            My profile
                          </Button>
                        </Link>
                        <Link href="/explore">
                          <Button variant="main" radius="md">
                            Explore map
                          </Button>
                        </Link>
                      </>
                    }
                  />
                )}
              </>
            )}

            {showFeed && (
              <div ref={feedSectionRef}>
                {loading ? (
                  <FeedList
                    posts={[]}
                    onMenuClick={handleFeedMenuClick}
                    isLoading
                    sortMode={sortMode}
                    onSortChange={setSortMode}
                    selectedFriend={selectedFriend}
                    onClearFriendFilter={clearFriendFilter}
                    friendUsername={
                      selectedFriend
                        ? friends.find(
                            (f) =>
                              f.id === selectedFriend ||
                              f.username === selectedFriend,
                          )?.username
                        : undefined
                    }
                  />
                ) : filteredFeedPosts.length > 0 ? (
                  <FeedList
                    posts={filteredFeedPosts}
                    onMenuClick={handleFeedMenuClick}
                    sortMode={sortMode}
                    onSortChange={setSortMode}
                    selectedFriend={selectedFriend}
                    onClearFriendFilter={clearFriendFilter}
                    friendUsername={
                      selectedFriend
                        ? friends.find(
                            (f) =>
                              f.id === selectedFriend ||
                              f.username === selectedFriend,
                          )?.username
                        : undefined
                    }
                    lastSeenFeedLength={getLastSeenFeedLength()}
                  />
                ) : (
                  <EmptyStateCard
                    title="No feed yet"
                    description="Add friends or add places to see activity here."
                    actions={
                      <>
                        <Link href="/explore">
                          <Button variant="main" radius="md">
                            Explore map
                          </Button>
                        </Link>
                      </>
                    }
                  />
                )}
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-6 lg:w-[320px] lg:shrink-0 lg:self-start lg:max-h-full lg:overflow-y-auto lg:gap-8">
            <PulseCard onInviteFriends={handleInviteFriends} />
            <NetworkSnapshotCard
              feedPosts={feedPosts}
              recapBlogs={recapBlogs}
              isLoading={loading}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
