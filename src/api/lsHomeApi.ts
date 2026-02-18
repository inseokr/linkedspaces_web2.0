/**
 * LS Home API client for https://pocketverse.herokuapp.com/LS_API
 * JWT (Bearer) support; all methods return normalized { success, data, error }.
 */

import { API_BASE_URL } from "@/api/client";

export type LsApiResult<T> =
  | { success: true; data: T; error?: undefined }
  | { success: false; data?: undefined; error: string };

function getToken(): string | undefined {
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

async function request<T>(
  path: string,
  options: RequestInit & {
    token?: string;
    query?: Record<string, string>;
  } = {},
): Promise<LsApiResult<T>> {
  const { token: optToken, query, ...rest } = options;
  const token = optToken ?? getToken();
  const url = new URL(
    path.startsWith("http") ? path : `${API_BASE_URL}${path}`,
  );
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    });
  }
  try {
    const res = await fetch(url.toString(), {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(rest.headers as Record<string, string>),
      },
    });
    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : undefined;
    } catch {
      if (!res.ok) {
        return { success: false, error: text || `HTTP ${res.status}` };
      }
      return { success: false, error: "Invalid JSON response" };
    }
    if (!res.ok) {
      const msg =
        (json as { message?: string })?.message ??
        (json as { error?: string })?.error ??
        (text || `HTTP ${res.status}`);
      return { success: false, error: String(msg) };
    }
    return { success: true, data: json as T };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { success: false, error: message };
  }
}

// --- Login ---

export type LsLoginPayload = { username: string; password: string };

export type LsLoginSuccess = {
  message: "ok";
  token: string;
  user?: unknown;
};

export function login(
  payload: LsLoginPayload,
): Promise<LsApiResult<LsLoginSuccess>> {
  return request<LsLoginSuccess>("/jwt_login", {
    method: "POST",
    body: JSON.stringify(payload),
    query: undefined,
  });
}

// --- Friends visit history (for Feed) ---

export type LsPlacePhoto = {
  uri?: string;
  selected?: boolean;
  story?: string;
  liked?: Array<{ _id: string; username: string }>;
  comments?: unknown[];
};

export type LsFriendsVisitEntry = {
  _id?: string;
  username: string;
  placeName?: string;
  visitedCity?: string;
  city?: string;
  visitedTime?: string;
  visitedTimeDigitized?: string;
  status?: string;
  placeIndex?: number;
  coordinate?: { latitude: number; longitude: number };
  photoList?: LsPlacePhoto[];
  likes?: number;
  likeCount?: number;
  likesCount?: number;
};

/** Response shape: array, or { visitedHistory/list/visits/placeVisitHistory }, or [{ username, placeVisitHistory }] */
export type LsFriendsVisitHistoryRaw =
  | LsFriendsVisitEntry[]
  | {
      visitedHistory?: LsFriendsVisitEntry[];
      list?: LsFriendsVisitEntry[];
      visits?: LsFriendsVisitEntry[];
      placeVisitHistory?: LsFriendsVisitEntry[];
      data?: LsFriendsVisitEntry[];
    }
  | Array<{ username?: string; placeVisitHistory?: LsFriendsVisitEntry[] }>;

function extractFriendsVisitEntries(
  raw: LsFriendsVisitHistoryRaw,
): LsFriendsVisitEntry[] {
  if (Array.isArray(raw)) {
    const first = raw[0];
    if (
      first &&
      typeof first === "object" &&
      "placeVisitHistory" in first &&
      Array.isArray((first as any).placeVisitHistory)
    ) {
      return (
        raw as Array<{
          username?: string;
          placeVisitHistory?: LsFriendsVisitEntry[];
        }>
      ).flatMap((u) => {
        const un = u.username ?? "unknown";
        return (u.placeVisitHistory ?? []).map((e) => ({
          ...e,
          username: e.username ?? un,
        }));
      });
    }
    return raw as LsFriendsVisitEntry[];
  }
  const o = raw as Record<string, unknown>;
  const list =
    (o.visitedHistory as LsFriendsVisitEntry[] | undefined) ??
    (o.list as LsFriendsVisitEntry[] | undefined) ??
    (o.visits as LsFriendsVisitEntry[] | undefined) ??
    (o.placeVisitHistory as LsFriendsVisitEntry[] | undefined) ??
    (o.data as LsFriendsVisitEntry[] | undefined);
  return Array.isArray(list) ? list : [];
}

export function getFriendsVisitHistory(
  username: string,
): Promise<LsApiResult<LsFriendsVisitEntry[]>> {
  return request<LsFriendsVisitHistoryRaw>("/loadFriendsVisitHistory", {
    method: "GET",
    query: { username, userName: username },
  }).then((r) => {
    if (!r.success) return r;
    const me = String(username ?? "")
      .trim()
      .toLowerCase();
    const data = extractFriendsVisitEntries(r.data).filter((e) => {
      // This endpoint is intended to be "friends" only, but some backends
      // include the requesting user in the result. Exclude self to avoid
      // showing my own visit history in the friends feed.
      const un = String(e?.username ?? "")
        .trim()
        .toLowerCase();
      return !(me && un && un === me);
    });
    return { success: true, data };
  });
}

// --- Place visit history (filtered) ---

export type LsPlaceVisitHistoryParams = {
  targetCoordinate?: { latitude: number; longitude: number };
  maxDistance?: number;
  showAll?: boolean;
  category?: string;
};

export function getPlaceVisitHistory(
  username: string,
  params: LsPlaceVisitHistoryParams = {},
): Promise<LsApiResult<unknown>> {
  const query: Record<string, string> = { username };
  if (params.targetCoordinate) {
    query.latitude = String(params.targetCoordinate.latitude);
    query.longitude = String(params.targetCoordinate.longitude);
  }
  if (params.maxDistance != null)
    query.maxDistance = String(params.maxDistance);
  if (params.showAll != null) query.showAll = String(params.showAll);
  if (params.category) query.category = params.category;
  console.log("[getPlaceVisitHistory] query:", query);
  return request("/placeVisitHistory", { method: "GET", query });
}

// --- Single user visit history (for per-friend Home feed) ---

type LsUserVisitHistoryRaw =
  | LsFriendsVisitEntry[]
  | {
      visitedHistory?: LsFriendsVisitEntry[];
      list?: LsFriendsVisitEntry[];
      visits?: LsFriendsVisitEntry[];
      placeVisitHistory?: LsFriendsVisitEntry[];
      data?: LsFriendsVisitEntry[];
    }
  | {
      visitedHistory?: LsFriendsVisitEntry[];
      placeVisitHistory?: LsFriendsVisitEntry[];
    };

function extractUserVisitEntries(raw: unknown): LsFriendsVisitEntry[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as LsFriendsVisitEntry[];
  if (typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  const list =
    (o.visitedHistory as LsFriendsVisitEntry[] | undefined) ??
    (o.list as LsFriendsVisitEntry[] | undefined) ??
    (o.visits as LsFriendsVisitEntry[] | undefined) ??
    (o.placeVisitHistory as LsFriendsVisitEntry[] | undefined) ??
    (o.data as LsFriendsVisitEntry[] | undefined);
  return Array.isArray(list) ? list : [];
}

/**
 * Load a specific user's place visit history (used to build Home feed per direct friend).
 * Note: backend may omit `username` on entries, so we inject it.
 */
export function getUserVisitHistory(
  username: string,
  params: LsPlaceVisitHistoryParams = {},
): Promise<LsApiResult<LsFriendsVisitEntry[]>> {
  return (async () => {
    const r = await getPlaceVisitHistory(username, params);
    if (!r.success) return r as LsApiResult<LsFriendsVisitEntry[]>;
    const entries = extractUserVisitEntries(
      r.data as LsUserVisitHistoryRaw,
    ).map((e) => ({
      ...e,
      username:
        String((e as any)?.username ?? username ?? "unknown") || "unknown",
    }));
    return { success: true, data: entries };
  })();
}

// --- Friends trips (for Recap / Blogs) ---

export type LsTripPlaceRef = { placeIndex: number; _id?: string };

export type LsTrip = {
  blogKey: number;
  username?: string;
  owner?: string;
  status?: string;
  startTimeString?: string;
  endTimeString?: string;
  startTimestamp?: number;
  endTimestamp?: number;
  startingYear?: string;
  title?: string;
  tripHighlight?: string;
  coverPhotoUri?: string;
  coordinate?: { longitude: number; latitude: number };
  visitedPlaceName?: string[];
  country?: string;
  countryCode?: string;
  placeList?: LsTripPlaceRef[];
  privacyControl?: {
    level?: "hidden" | "public" | "private" | "limited" | string;
    allowedUserList?: Array<{
      profile_picture?: string;
      friend_id?: string;
      username?: string;
    }>;
  };
  [key: string]: unknown;
};

/** Response: array of trips or { trips / tripList / data } */
export type LsTripsByUser = {
  username?: string;
  owner?: string;
  trips?: LsTrip[];
  tripList?: LsTrip[];
  [key: string]: unknown;
};

export type LsFriendsTripsRaw =
  | LsTrip[]
  | LsTripsByUser
  | LsTripsByUser[]
  | {
      result?: string;
      message?: string;
      error?: string;
      trips?: LsTrip[] | LsTripsByUser[] | LsTripsByUser;
      tripList?: LsTrip[] | LsTripsByUser[] | LsTripsByUser;
      data?: unknown;
    };

export function getFriendsTrips(
  username: string,
  token?: string,
): Promise<LsApiResult<LsTrip[]>> {
  return request<LsFriendsTripsRaw>("/loadFriendsTrip", {
    method: "GET",
    query: { username, userName: username },
    token: token ?? getToken(),
  }).then((r) => {
    if (!r.success) return r;
    const tripSortKey = (trip: any): number => {
      const a = trip?.endTimestamp ?? trip?.startTimestamp;
      if (typeof a === "number" && Number.isFinite(a)) return a;
      const b = trip?.endTimestamp ?? trip?.startTimestamp;
      const n = typeof b === "string" ? Number(b) : NaN;
      return Number.isFinite(n) ? n : 0;
    };

    const normalizeTrip = (trip: any, owner?: string): LsTrip => {
      const un = owner?.trim();
      return {
        ...(trip as Record<string, unknown>),
        username: (trip as any)?.username ?? (un || undefined),
        owner: (trip as any)?.owner ?? (un || undefined),
      } as LsTrip;
    };

    const flattenMaybeGroupedArray = (arr: any[]): LsTrip[] => {
      const out: LsTrip[] = [];
      for (const item of arr) {
        if (
          item &&
          typeof item === "object" &&
          (Array.isArray((item as any).trips) ||
            Array.isArray((item as any).tripList))
        ) {
          const owner = String(
            (item as any).owner ?? (item as any).username ?? "",
          ).trim();
          const trips =
            (Array.isArray((item as any).trips) && (item as any).trips) ||
            (Array.isArray((item as any).tripList) && (item as any).tripList) ||
            [];
          for (const t of trips) out.push(normalizeTrip(t, owner || undefined));
          continue;
        }
        out.push(normalizeTrip(item, undefined));
      }
      return out;
    };

    const normalize = (raw: unknown): LsTrip[] => {
      if (!raw) return [];
      if (Array.isArray(raw)) return flattenMaybeGroupedArray(raw as any[]);
      if (typeof raw !== "object") return [];

      const o = raw as Record<string, unknown>;
      // Some backends return HTTP 200 even for failures; use `result` when present.
      const result = typeof o.result === "string" ? o.result : undefined;
      if (result && result.toUpperCase() !== "OK") {
        const msg =
          (typeof o.message === "string" && o.message) ||
          (typeof o.error === "string" && o.error) ||
          `Unexpected result: ${result}`;
        throw new Error(msg);
      }

      // Common payload containers.
      const candidate =
        o.trips ??
        o.tripList ??
        (o as any).data ??
        (o as any).trip ??
        undefined;

      // Group wrapper: { username/owner, trips: [...] }
      if (
        (typeof (o as any).username === "string" ||
          typeof (o as any).owner === "string") &&
        (Array.isArray((o as any).trips) || Array.isArray((o as any).tripList))
      ) {
        return flattenMaybeGroupedArray([o as any]);
      }

      // Direct list or grouped list inside container keys.
      return normalize(candidate);
    };

    let list: LsTrip[] = [];
    try {
      list = normalize(r.data);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return { success: false, error: message };
    }

    // De-dupe by (owner, blogKey), keeping the latest timestamp.
    const best = new Map<string, LsTrip>();
    const extras: LsTrip[] = [];
    for (const t of list) {
      const blogKey = (t as any)?.blogKey;
      const owner = String((t as any)?.owner ?? (t as any)?.username ?? "")
        .trim()
        .toLowerCase();
      if (blogKey == null || blogKey === "") {
        extras.push(t);
        continue;
      }
      const key = `${owner}::${String(blogKey)}`;
      const prev = best.get(key);
      if (!prev) {
        best.set(key, t);
        continue;
      }
      if (tripSortKey(t) > tripSortKey(prev)) best.set(key, t);
    }

    return { success: true, data: [...best.values(), ...extras] };
  });
}

// --- Blog (single trip detail) ---

export function getBlog(
  username: string,
  blogKey: string | number,
): Promise<LsApiResult<unknown>> {
  return request("/blog", {
    method: "GET",
    query: { username, blogKey: String(blogKey) },
  });
}

// --- Pulse invited ---

export type LsInvitedPulsesParams = { status?: string };

export function getInvitedPulses(
  params: LsInvitedPulsesParams = {},
  token?: string,
): Promise<LsApiResult<unknown>> {
  const query: Record<string, string> = {};
  if (params.status) query.status = params.status;
  return request("/pulse/invited", {
    method: "GET",
    query: Object.keys(query).length ? query : undefined,
    token: token ?? getToken(),
  });
}

// --- Like photo ---

export type LsLikePhotoPayload = {
  userName: string;
  placeKey: string;
  photoKey: string;
  liked: boolean;
};

export function likePhoto(
  payload: LsLikePhotoPayload,
): Promise<LsApiResult<unknown>> {
  return request("/placeVisitHistory/photo-list/like", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// --- Add comment ---

export type LsAddCommentPayload = {
  userName: string;
  placeKey: string;
  photoKey: string;
  comments: string;
  reply?: string;
  commentOwner?: string;
};

export function addComment(
  payload: LsAddCommentPayload,
): Promise<LsApiResult<unknown>> {
  return request("/placeVisitHistory/photo-list/comment/add", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
