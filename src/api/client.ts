// src/api/client.ts

/**
 * Small fetch wrapper to standardize API calls.
 * - Adds base URL
 * - Sends JSON by default
 * - Adds Authorization header when token exists
 * - Throws readable errors on non-2xx responses
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pocketverse.herokuapp.com/LS_API";

export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN || "https://pocketverse.herokuapp.com";

export type ApiError = {
  status: number;
  message: string;
  detail?: string;
};

type ApiFetchOptions = Omit<RequestInit, "headers" | "body"> & {
  token?: string;
  headers?: Record<string, string>;
  body?: unknown; // JSON body
};

async function safeText(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, headers, body, ...rest } = options;

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const detail = await safeText(res);
    const err: ApiError = {
      status: res.status,
      message: `API failed: ${res.status}`,
      detail,
    };
    throw err;
  }

  const text = await safeText(res);
  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
