// src/api/assets.ts

export const FILE_SERVER_URL =
  process.env.NEXT_PUBLIC_FILE_SERVER_URL ||
  "https://s3-us-west-1.amazonaws.com/linkedspaces.fs";

/**
 * Convert a backend asset path (e.g. "/public/user_resources/...jpg")
 * into a browser-loadable absolute URL on S3.
 */
export function assetUrl(path: string | undefined | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  let normalized = path;

  // 1) "/public/...."  -> FILE_SERVER_URL + "/public/...."
  if (normalized.startsWith("/public/")) {
    return `${FILE_SERVER_URL}${normalized}`;
  }

  // 2) "/user_resources/...." -> FILE_SERVER_URL + "/public/user_resources/...."
  if (normalized.startsWith("/user_resources/")) {
    return `${FILE_SERVER_URL}/public${normalized}`;
  }

  // fallback: treat as root-relative or append as-is
  const separator = normalized.startsWith("/") ? "" : "/";
  return `${FILE_SERVER_URL}${separator}${normalized}`;
}
