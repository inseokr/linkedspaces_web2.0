/**
 * Waitlist API client.
 * GET  /LS_API/waitlist                         — fetch waitlist (any logged-in user)
 * GET  /LS_API/admin/dashboard/premium-users    — premium user count (admin only)
 * POST /LS_API/admin/dashboard/user/level       — upgrade / downgrade a user (admin only)
 */

import { apiFetch } from "@/api/client";

function getAuthToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const t = window.localStorage.getItem("token");
    if (t) return t;
  } catch {
    /* ignore */
  }
  try {
    return window.sessionStorage.getItem("token") ?? undefined;
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WaitlistEntry = {
  userName: string;
  email: string;
  registeredAt: string;
};

type WaitlistResponse = {
  result: string;
  waitlist: WaitlistEntry[];
};

type PremiumUsersResponse = {
  result: string;
  total: number;
};

type UpdateUserLevelResponse = {
  result: string;
  username?: string;
  email?: string;
  userLevel?: string;
  reason?: string;
};

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** Fetch the premium-service waitlist (sorted oldest-first by backend). */
export async function fetchWaitlist(): Promise<WaitlistEntry[]> {
  const token = getAuthToken();
  const res = await apiFetch<WaitlistResponse>("/waitlist", {
    method: "GET",
    token,
  });
  if (res.result !== "OK")
    throw new Error((res as any).reason ?? "Failed to fetch waitlist");
  return res.waitlist ?? [];
}

/** Fetch the total number of premium accounts. Admin only. */
export async function fetchPremiumUserCount(): Promise<number> {
  const token = getAuthToken();
  const res = await apiFetch<PremiumUsersResponse>(
    "/admin/dashboard/premium-users",
    { method: "GET", token },
  );
  if (res.result !== "OK")
    throw new Error("Failed to fetch premium user count");
  return res.total ?? 0;
}

/**
 * Update a user's level.
 * @param username - the user's username (from waitlist entry `userName`)
 * @param email    - the user's email
 * @param userLevel - "premium" to allow, "normal" to reject/downgrade
 */
export async function updateUserLevel(
  username: string,
  email: string,
  userLevel: "normal" | "premium" | "influencer",
): Promise<void> {
  const token = getAuthToken();
  const res = await apiFetch<UpdateUserLevelResponse>(
    "/admin/dashboard/user/level",
    {
      method: "POST",
      token,
      body: { username, email, userLevel },
    },
  );
  if (res.result !== "OK") {
    throw new Error(res.reason ?? "Failed to update user level");
  }
}
