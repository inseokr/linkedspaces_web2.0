// src/lib/bloggo.ts
// BlogGo-specific helpers shared across pages and components.

export type BloggoUserAssertResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Enforces the BlogGo product boundary.
 *
 * Returns `{ ok: true }` when the user is a BlogGo account.
 * Returns `{ ok: false, message }` for LinkedSpaces accounts or when the user
 * is not authenticated. The caller is responsible for clearing auth state
 * and/or showing the message when ok is false.
 *
 * @param currentUser - The current user object from the login response or
 *   cached user store. Pass `null` when no user is authenticated.
 */
export function assertBloggoUser(
  currentUser: { userType?: string } | null,
): BloggoUserAssertResult {
  if (!currentUser) {
    return { ok: false, message: "Not authenticated." };
  }

  if (currentUser.userType === "bloggo") {
    return { ok: true };
  }

  // "linkedspaces" or any missing/unknown userType → block
  return {
    ok: false,
    message:
      "This account is for LinkedSpaces. Please sign in through LinkedSpaces.",
  };
}
