/**
 * Waitlist API client.
 * POST /LS_API/waitlist                         — join premium waitlist (public)
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

type JoinWaitlistResponse = {
  result: string;
  reason?: string;
};

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Join the premium-service waitlist (public, no auth).
 * Persists email and optional name to the backend so they appear in the admin waitlist.
 */
export async function joinWaitlist(
  email: string,
  userName?: string,
  extras?: { website?: string; formStartedAt?: number },
): Promise<void> {
  const res = await apiFetch<JoinWaitlistResponse>("/waitlist", {
    method: "POST",
    body: {
      email,
      userName: userName || email.split("@")[0] || "Guest",
      website: extras?.website ?? "",
      formStartedAt: extras?.formStartedAt,
    },
  });
  if (res.result !== "OK") {
    throw new Error(res.reason ?? "Failed to join waitlist");
  }
}

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
 * @param userLevel - "freemium" to allow, "normal" to reject/downgrade
 */
export async function updateUserLevel(
  username: string,
  email: string,
  userLevel: "normal" | "freemium" | "premium" | "influencer",
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

type WaitlistMutationResponse = {
  result: string;
  deleted?: number;
  emails?: string[];
  reason?: string;
};

/** Remove specific waitlist rows by email. Admin only. */
export async function removeFromWaitlist(emails: string[]): Promise<number> {
  const token = getAuthToken();
  const res = await apiFetch<WaitlistMutationResponse>(
    "/admin/dashboard/waitlist/remove",
    { method: "POST", token, body: { emails } },
  );
  if (res.result !== "OK") {
    throw new Error(res.reason ?? "Failed to remove waitlist entries");
  }
  return res.deleted ?? 0;
}

/** Delete waitlist rows whose username looks bot-generated. Admin only. */
export async function purgeSpamWaitlist(): Promise<{
  deleted: number;
  emails: string[];
}> {
  const token = getAuthToken();
  const res = await apiFetch<WaitlistMutationResponse>(
    "/admin/dashboard/waitlist/purge-spam",
    { method: "POST", token, body: {} },
  );
  if (res.result !== "OK") {
    throw new Error(res.reason ?? "Failed to purge spam waitlist entries");
  }
  return { deleted: res.deleted ?? 0, emails: res.emails ?? [] };
}
