"use client";

import { useMemo, useState } from "react";
import { getCachedUser, type User } from "@/api/user";
import { mapUserToTravelStatsVM } from "@/views/Profile/travel-stats/mappers/mapToViewModel";

export function useTravelStatsVM() {
  // 1. Use lazy initialization to avoid synchronous setState in useEffect
  const [user] = useState<User | null>(() => getCachedUser());

  // 2. Compute View Model only when user data exists
  const vm = useMemo(() => mapUserToTravelStatsVM(user), [user]);
  return { user, vm };
}
