/**
 * Admin access control for LinkedSpaces.
 * Only these usernames can access the User Dashboard and other admin features.
 */
const ADMIN_USERNAMES = ["inseo", "yoobin", "admin"] as const;

export function isAdminUsername(username: string | undefined | null): boolean {
  if (!username || typeof username !== "string") return false;
  return ADMIN_USERNAMES.includes(
    username.toLowerCase() as (typeof ADMIN_USERNAMES)[number],
  );
}
