/** Shared constants for the HomeWatch site (hyodo.linkedspaces.com). */

export const SITE_NAME = "HomeWatch";
export const TAGLINE = "Know they're OK. Let them know they're loved.";
export const SUPPORT_EMAIL = "yoobin@linkedspaces.com";
export const COMPANY = "LinkedSpaces LLC";

/** Shown at the top of the legal pages. Update when the text changes. */
export const LAST_UPDATED = "November 22, 2026";

/** Store links. Leave null until the listing is live; the badge shows "Coming soon". */
export const APP_STORE_URL: string | null = null;
export const PLAY_STORE_URL: string | null = null;

export const NAV_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/support", label: "Support" },
  { href: "/delete-account", label: "Delete account" },
] as const;
