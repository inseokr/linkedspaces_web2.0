export function normalizeExternalUrl(input: string): string | null {
  const raw = String(input ?? "")
    .trim()
    // remove surrounding quotes that sometimes sneak in from APIs
    .replace(/^['"]|['"]$/g, "");
  if (!raw) return null;

  // Disallow dangerous schemes.
  const lowered = raw.toLowerCase();
  if (
    lowered.startsWith("javascript:") ||
    lowered.startsWith("data:") ||
    lowered.startsWith("vbscript:")
  ) {
    return null;
  }

  // If no scheme, assume https.
  const withScheme = /^[a-z]+:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    // Some valid URLs come in with spaces (e.g. Google "place id:" query).
    // Try a best-effort encoding pass.
    try {
      const encoded = encodeURI(withScheme);
      const u = new URL(encoded);
      if (u.protocol !== "http:" && u.protocol !== "https:") return null;
      return u.toString();
    } catch {
      return null;
    }
  }
}

export function isLikelyMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;

  const anyNav = navigator as any;
  const uadMobile = anyNav?.userAgentData?.mobile;
  if (typeof uadMobile === "boolean") return uadMobile;

  const ua = String(navigator.userAgent || "");
  return /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
}

/**
 * Open an external URL in a way that avoids "lost tab" issues on mobile.
 *
 * - Desktop: default to opening a new tab.
 * - Mobile: default to opening in the same tab (so Back returns reliably).
 */
export function openExternalUrl(
  url: string,
  options?: { newTab?: boolean },
): void {
  if (typeof window === "undefined") return;

  const normalized = normalizeExternalUrl(url);
  if (!normalized) return;

  const shouldOpenNewTab = options?.newTab ?? !isLikelyMobileBrowser();

  if (shouldOpenNewTab) {
    window.open(normalized, "_blank", "noopener,noreferrer");
    return;
  }

  // Same-tab navigation on mobile makes "back to origin" reliable.
  window.location.assign(normalized);
}
