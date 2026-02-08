"use client";

import { useState, useCallback } from "react";

export type HomeFilterMode = "All" | "Places" | "Blogs";
export type FeedSortMode = "Newest" | "Most liked" | "Most commented";

const LAST_SEEN_HOME_KEY = "linkedspaces_lastSeenHomeAt";
const LAST_SEEN_FEED_LENGTH_KEY = "linkedspaces_lastSeenFeedLength";

export function useHomeUIState() {
  const [activeFilter, setActiveFilter] = useState<HomeFilterMode>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<FeedSortMode>("Newest");

  const clearFriendFilter = useCallback(() => setSelectedFriend(null), []);
  const selectFriend = useCallback((friendId: string | null) => {
    setSelectedFriend(friendId);
  }, []);

  const updateLastSeen = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LAST_SEEN_HOME_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  }, []);

  const getLastSeenAt = useCallback((): number | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(LAST_SEEN_HOME_KEY);
      if (!raw) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  }, []);

  const saveLastSeenFeedLength = useCallback((length: number) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LAST_SEEN_FEED_LENGTH_KEY, String(length));
    } catch {
      // ignore
    }
  }, []);

  const getLastSeenFeedLength = useCallback((): number => {
    if (typeof window === "undefined") return 0;
    try {
      const raw = window.localStorage.getItem(LAST_SEEN_FEED_LENGTH_KEY);
      if (!raw) return 0;
      const n = Number(raw);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    } catch {
      return 0;
    }
  }, []);

  return {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    selectedFriend,
    setSelectedFriend: selectFriend,
    clearFriendFilter,
    sortMode,
    setSortMode,
    updateLastSeen,
    getLastSeenAt,
    saveLastSeenFeedLength,
    getLastSeenFeedLength,
  };
}
