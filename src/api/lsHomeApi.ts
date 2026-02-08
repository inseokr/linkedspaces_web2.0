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

/** Response shape: array, or { list/visits/placeVisitHistory }, or [{ username, placeVisitHistory }] */
export type LsFriendsVisitHistoryRaw =
  | LsFriendsVisitEntry[]
  | {
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
    const data = extractFriendsVisitEntries(r.data);
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
  return request("/placeVisitHistory", { method: "GET", query });
}

// --- Friends trips (for Recap / Blogs) ---

export type LsTripPlaceRef = { placeIndex: number; _id?: string };

export type LsTrip = {
  blogKey: number;
  status?: string;
  startTimeString?: string;
  endTimeString?: string;
  startTimestamp?: string;
  endTimestamp?: string;
  title?: string;
  coverPhotoUri?: string;
  placeList?: LsTripPlaceRef[];
  [key: string]: unknown;
};

/** Response: array of trips or { trips / tripList / data } */
export type LsFriendsTripsRaw =
  | LsTrip[]
  | {
      trips?: LsTrip[];
      tripList?: LsTrip[];
      data?: LsTrip[] | { trips?: LsTrip[] };
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
    const raw = r.data;
    let list: LsTrip[] | undefined;
    if (Array.isArray(raw)) {
      list = raw;
    } else {
      const o = raw as Record<string, unknown>;
      list =
        (o.trips as LsTrip[] | undefined) ??
        (o.tripList as LsTrip[] | undefined);
      if (!list && o.data) {
        const d = o.data as LsTrip[] | { trips?: LsTrip[] };
        list = Array.isArray(d) ? d : d.trips;
      }
    }
    return { success: true, data: Array.isArray(list) ? list : [] };
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
