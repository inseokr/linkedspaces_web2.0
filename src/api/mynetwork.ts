import { apiFetch } from "@/api/client";

function getAuthToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const t = window.localStorage.getItem("token");
    if (t) return t;
  } catch {
    // ignore
  }
  try {
    return window.sessionStorage.getItem("token") ?? undefined;
  } catch {
    return undefined;
  }
}

type OkResult = { result: "OK" } & Record<string, unknown>;

function assertOkResult<T extends OkResult>(res: T): T {
  const r = (res as any)?.result;
  if (typeof r === "string" && r.toUpperCase() === "OK") return res;
  const msg =
    (res as any)?.reason ??
    (res as any)?.message ??
    (res as any)?.error ??
    `Unexpected result: ${String(r ?? "unknown")}`;
  throw new Error(String(msg));
}

export type ProfileSummary = {
  basicInfo?: Record<string, unknown>;
  stats?: Record<string, unknown>;
  recentTrips?: unknown[];
  recentPlaces?: unknown[];
};

export type MyProfileSummaryResponse = OkResult & {
  profileSummary: ProfileSummary;
};

export async function fetchMyProfileSummary(): Promise<ProfileSummary> {
  const token = getAuthToken();
  const res = await apiFetch<MyProfileSummaryResponse>(
    "/mynetwork/my_profile_summary",
    {
      method: "GET",
      token,
    },
  );
  return assertOkResult(res).profileSummary;
}

export type ProfileSummaryByUsernameResponse = OkResult & {
  profileSummary: ProfileSummary;
};

export async function fetchProfileSummary(
  username: string,
): Promise<ProfileSummary> {
  const token = getAuthToken();
  const encoded = encodeURIComponent(username);
  const res = await apiFetch<ProfileSummaryByUsernameResponse>(
    `/mynetwork/profile_summary/${encoded}`,
    {
      method: "GET",
      token,
    },
  );
  return assertOkResult(res).profileSummary;
}

export type NetworkInfoResponse = OkResult & Record<string, unknown>;

export async function fetchNetworkInfo(): Promise<NetworkInfoResponse> {
  const token = getAuthToken();
  const res = await apiFetch<NetworkInfoResponse>("/mynetwork/networkinfo", {
    method: "GET",
    token,
  });
  return assertOkResult(res);
}

export type FriendListResponse = OkResult & {
  friends?: unknown[];
  friend_list?: unknown[];
  list?: unknown[];
  direct_friends?: unknown[];
};

export async function fetchFriendList(): Promise<unknown[]> {
  const token = getAuthToken();
  const res = await apiFetch<FriendListResponse>("/mynetwork/friend_list", {
    method: "GET",
    token,
  });
  const ok = assertOkResult(res);
  const list =
    ok.friends ?? ok.friend_list ?? ok.list ?? ok.direct_friends ?? [];
  return Array.isArray(list) ? list : [];
}
