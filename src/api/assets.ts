// src/api/assets.ts

export const FILE_SERVER_URL =
  process.env.NEXT_PUBLIC_FILE_SERVER_URL ??
  "https://s3-us-west-1.amazonaws.com/linkedspaces.fs";

/**
 * Convert a backend asset path (e.g. "/public/user_resources/...jpg")
 * into a browser-loadable absolute URL on S3.
 */
export function assetUrl(path: string | undefined | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${FILE_SERVER_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
