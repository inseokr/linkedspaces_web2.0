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
import { getCachedUser } from "@/api/user";
import {
  getHomeFriends,
  getHomeRecapBlogs,
  getHomeFeedPosts,
} from "@/lib/homeNetworkData";
import { getFriendsVisitHistory, getFriendsTrips } from "@/api/lsHomeApi";
import {
  feedPostsFromFriendsVisitHistory,
  recapBlogsFromFriendsTrips,
} from "@/lib/lsHomeMappers";
import type { MockFeedPost, MockRecapBlog } from "@/lib/mockNetwork";

export default function HomePage() {
  const user = getCachedUser();

  const [friendsFeed, setFriendsFeed] = useState<MockFeedPost[] | null>(null);
  const [friendsRecap, setFriendsRecap] = useState<MockRecapBlog[] | null>(
    null,
  );

  useEffect(() => {
    if (!user?.username) return;

    let cancelled = false;

    Promise.all([
      getFriendsVisitHistory(user.username),
      getFriendsTrips(user.username),
    ]).then(([visitRes, tripsRes]) => {
      if (cancelled) return;
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[Home] loadFriendsVisitHistory:",
          visitRes.success
            ? `ok, ${visitRes.data.length} entries`
            : visitRes.error,
        );
        console.log(
          "[Home] loadFriendsTrip:",
          tripsRes.success
            ? `ok, ${tripsRes.data.length} trips`
            : tripsRes.error,
        );
      }
      if (visitRes.success) {
        setFriendsFeed(feedPostsFromFriendsVisitHistory(visitRes.data));
      }
      if (tripsRes.success) {
        setFriendsRecap(recapBlogsFromFriendsTrips(tripsRes.data));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user?.username]);

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

    return {
      friends: realFriends.length > 0 ? realFriends : MOCK_FRIENDS,
      recapBlogs: recapResolved,
      feedPosts: feedResolved,
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
