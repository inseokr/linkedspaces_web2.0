"use client";

/**
 * Hook: get cached user, map to stats input, run buildTravelStats, and expose
 * scope (lifetime | thisYear | last6Months) with currentScopeStats.
 * Memoizes by user reference so we don't recompute on every render.
 * File: src/views/Profile/travel-stats/hooks/useTravelStats.ts
 */

import { useMemo, useState } from "react";
import { getCachedUser, type User } from "@/api/user";
import { buildTravelStats } from "@/views/Profile/travel-stats/lib/buildTravelStats";
import { userToStatsInput } from "@/views/Profile/travel-stats/lib/userToStatsInput";
import type {
  TravelStatsResult,
  ScopeStats,
  TimeScopeKey,
} from "@/views/Profile/travel-stats/statsTypes";

export function useTravelStats(): {
  stats: TravelStatsResult | null;
  scope: TimeScopeKey;
  setScope: (s: TimeScopeKey) => void;
  currentScopeStats: ScopeStats | null;
  hasData: boolean;
  isLoading: boolean;
} {
  const [user] = useState<User | null>(() => getCachedUser());
  const [scope, setScope] = useState<TimeScopeKey>("lifetime");

  const stats = useMemo(() => buildTravelStats(userToStatsInput(user)), [user]);

  const currentScopeStats = useMemo((): ScopeStats | null => {
    if (!stats) return null;
    return stats.timeScopes[scope];
  }, [stats, scope]);

  const hasData =
    currentScopeStats != null &&
    (currentScopeStats.headlineStats.totalPlacesSaved > 0 ||
      currentScopeStats.headlineStats.recapBlogsCreatedCount > 0);

  return {
    stats,
    scope,
    setScope,
    currentScopeStats,
    hasData: !!currentScopeStats && hasData,
    isLoading: false,
  };
}
