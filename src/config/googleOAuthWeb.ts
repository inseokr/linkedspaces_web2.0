/**
 * Google Sign-In (GIS) Web client IDs. Each must be a "Web application" OAuth
 * client with Authorized JavaScript origins for the host(s) where that brand
 * loads (e.g. linkedspaces.com vs bloggo.linkedspaces.com).
 *
 * Backend: send matching userType on POST /oauth/google and configure audiences
 * (e.g. GOOGLE_CLIENT_IDS / GOOGLE_BLOGGO_WEB_CLIENT_ID on Pocketverse).
 */
const LEGACY_SHARED_CLIENT_ID =
  "365835568807-9s56gicbdaj9vkn3kkbkvs2crt8k764e.apps.googleusercontent.com";

export type GoogleOAuthWebBrand = "linkedspaces" | "bloggo";

export function getGoogleOAuthWebClientId(brand: GoogleOAuthWebBrand): string {
  const bloggo = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_BLOGGO?.trim();
  const linkedspaces =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_LINKEDSPACES?.trim();
  const shared = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

  if (brand === "bloggo") {
    return bloggo || shared || LEGACY_SHARED_CLIENT_ID;
  }
  return linkedspaces || shared || LEGACY_SHARED_CLIENT_ID;
}
