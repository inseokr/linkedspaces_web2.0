/**
 * Category pins for Mapbox: orange circle + Google Material Icons.
 * Optional user sentiment badge (green/yellow/red) at top-right for thumbs up / side / down.
 */

const ORANGE = "#f97316";
const WHITE = "#ffffff";
/** Pin size in px (SVG); larger = bigger orange markers and category icons on the map */
const SIZE = 64;

/** User sentiment badge colors (top-right of place marker) */
export const SENTIMENT_COLORS = {
  positive: "#2ecc71",
  neutral: "#f1c40f",
  negative: "#e74c3c",
} as const;

export type UserSentiment = keyof typeof SENTIMENT_COLORS;

/** Thumbs icons: white paths in 24px viewBox (Material-style). */
const THUMB_UP_PATH =
  "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z";
const THUMB_DOWN_PATH =
  "M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z";
/** Hand to side (neutral): palm-down hand / flat hand gesture, 24px viewBox */
const THUMB_SIDE_PATH =
  "M12 2C9.25 2 7 4.25 7 7v4.5c0 .83-.67 1.5-1.5 1.5S4 12.33 4 11.5V7H2v4.5C2 14.43 4.57 17 7.5 17H12c2.21 0 4-1.79 4-4V7c0-2.75-2.25-5-5-5zm0 2c1.66 0 3 1.34 3 3v5c0 1.1-.9 2-2 2H7.5C6.12 17 5 15.88 5 14.5S6.12 12 7.5 12H11V7c0-1.66-1.34-3-3-3z";

const SENTIMENT_PATHS: Record<UserSentiment, string> = {
  positive: THUMB_UP_PATH,
  neutral: THUMB_SIDE_PATH,
  negative: THUMB_DOWN_PATH,
};

/** Material Icons 24px paths (Google Material Design Icons) */
const ICON_PATHS: Record<string, string> = {
  cafe: "M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-1h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm-2 8H6V5h12v6z",
  restaurant:
    "M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z",
  bar: "M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9zM7.43 7L5.66 5h12.69l-1.78 2H7.43z",
  park: "M17 12h3L12 7 4 12h3v-2h2v2h2v-2h2v2z",
  place:
    "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
};

/** Return SVG path d for category icon (24px viewBox). Used by OrangePlaceMarker. */
export function getCategoryIconPath(category: string): string {
  const key = categoryToIconKey(category);
  return ICON_PATHS[key] ?? ICON_PATHS.place;
}

/** Return SVG path d for sentiment icon (24px viewBox). Used by OrangePlaceMarker. */
export function getSentimentIconPath(sentiment: UserSentiment): string {
  return SENTIMENT_PATHS[sentiment];
}

/** Map PlaceCategory (or any string) to icon key used in ICON_PATHS */
export function categoryToIconKey(category: string): string {
  const lower = String(category ?? "")
    .trim()
    .toLowerCase();
  if (lower.includes("cafe") || lower.includes("coffee") || lower === "cafe")
    return "cafe";
  if (
    lower.includes("restaurant") ||
    lower.includes("restaurants") ||
    lower === "restaurant"
  )
    return "restaurant";
  if (lower.includes("bar") || lower.includes("pub")) return "bar";
  if (
    lower.includes("park") ||
    lower.includes("attraction") ||
    lower.includes("sightseeing")
  )
    return "park";
  return "place";
}

/** Image id for Mapbox addImage (e.g. "pin-cafe", "pin-place", or "pin-cafe-positive" with sentiment) */
export function getCategoryPinImageId(
  category: string,
  sentiment?: UserSentiment,
): string {
  const key = categoryToIconKey(category);
  if (sentiment) return `pin-${key}-${sentiment}`;
  return `pin-${key}`;
}

/** All base pin image ids (no sentiment badge) for preloading */
export const CATEGORY_PIN_IDS = [
  "pin-cafe",
  "pin-restaurant",
  "pin-bar",
  "pin-park",
  "pin-place",
] as const;

const CATEGORY_KEYS = ["cafe", "restaurant", "bar", "park", "place"] as const;

/** All pin image ids including sentiment variants (for preloading when using sentiment badges) */
export function getAllCategoryPinIdsForPreload(): string[] {
  const ids: string[] = [...CATEGORY_PIN_IDS];
  const sentiments: UserSentiment[] = ["positive", "neutral", "negative"];
  for (const key of CATEGORY_KEYS) {
    for (const s of sentiments) {
      ids.push(`pin-${key}-${s}`);
    }
  }
  return ids;
}

/** Sentiment-only pin ids (composite 84x90); use for icon-offset so label stays under orange circle */
export const SENTIMENT_PIN_IDS: string[] = (() => {
  const ids: string[] = [];
  const sentiments: UserSentiment[] = ["positive", "neutral", "negative"];
  for (const key of CATEGORY_KEYS) {
    for (const s of sentiments) ids.push(`pin-${key}-${s}`);
  }
  return ids;
})();

/** Icon offset for composite (sentiment) pins: orange center is at (32,33) in 84x90 image, so shift icon to align. Values in ems. */
export const SENTIMENT_PIN_ICON_OFFSET: [number, number] = [-10 / 24, -12 / 24];

/**
 * Returns a data URL for an SVG: orange circle + white Material Icon in the center.
 * Icon scaled to fit inside the circle for better recognition.
 */
export function getCategoryPinSvgDataUrl(category: string): string {
  const key = categoryToIconKey(category);
  const path = ICON_PATHS[key] ?? ICON_PATHS.place;
  const iconSize = 26;
  const scale = iconSize / 24;
  const offset = (SIZE - iconSize) / 2;
  const center = SIZE / 2;
  const radius = SIZE / 2 - 2;
  /* No stroke on circle: stroke caused a partial white "ghost ring" where the sentiment badge overlays the pin. */
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <circle cx="${center}" cy="${center}" r="${radius}" fill="${ORANGE}"/>
  <g transform="translate(${offset}, ${offset}) scale(${scale})">
    <path fill="${WHITE}" d="${path}"/>
  </g>
</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

/** Pin placement in composite: same as before so orange circle is at (0, 1) in composite */
const BADGE_OFFSET_UP = 15;
/** Sentiment badge: larger and overlapping the orange pin (top-right); center in pin’s clear of category icon */
const BADGE_CX = 54;
const BADGE_CY = 10;
const BADGE_R = 18;
const BADGE_ICON_SIZE = 22;
/** Composite pin+badge canvas */
const COMPOSITE_WIDTH = 84;
const COMPOSITE_HEIGHT = 90;
const VIEWBOX_MIN_Y = -20;
/** Sentiment badge PNG size; positioned so it does not cover the category icon */
const BADGE_IMAGE_SIZE = 36;
const BADGE_IMAGE_X = BADGE_CX - BADGE_IMAGE_SIZE / 2;
const BADGE_IMAGE_Y = BADGE_CY - BADGE_IMAGE_SIZE / 2;

/** Public URLs for sentiment badge PNGs (fetch and set data URLs before preloading sentiment pins) */
export const SENTIMENT_PNG_PATHS: Record<UserSentiment, string> = {
  positive: "/images/sentiment/positive.png",
  neutral: "/images/sentiment/neutral.png",
  negative: "/images/sentiment/negative.png",
};

let sentimentPngDataUrls: Record<UserSentiment, string> | null = null;

/** Call with fetched PNG data URLs so composite pins use your PNG assets instead of SVG-drawn badges */
export function setSentimentPngDataUrls(
  urls: Record<UserSentiment, string>,
): void {
  sentimentPngDataUrls = urls;
}

/** Fetch the three sentiment PNGs and return data URLs; calls setSentimentPngDataUrls on success. Returns true if all loaded. */
export function fetchAndSetSentimentPngs(): Promise<boolean> {
  const sentiments: UserSentiment[] = ["positive", "neutral", "negative"];
  return Promise.all(
    sentiments.map((s) =>
      fetch(SENTIMENT_PNG_PATHS[s])
        .then((r) =>
          r.ok ? r.blob() : Promise.reject(new Error(r.statusText)),
        )
        .then(
          (blob) =>
            new Promise<string>((resolve, reject) => {
              const r = new FileReader();
              r.onload = () => resolve(r.result as string);
              r.onerror = reject;
              r.readAsDataURL(blob);
            }),
        ),
    ),
  )
    .then((urls) => {
      const record = { positive: urls[0], neutral: urls[1], negative: urls[2] };
      setSentimentPngDataUrls(record);
      return true;
    })
    .catch(() => false);
}

/**
 * Returns a data URL for an SVG: orange category pin + user sentiment badge at top-right.
 * Badge position: 15px up and 15px right of original. Uses PNG when set via setSentimentPngDataUrls.
 */
export function getCategoryPinWithSentimentSvgDataUrl(
  category: string,
  sentiment: UserSentiment,
): string {
  const key = categoryToIconKey(category);
  const catPath = ICON_PATHS[key] ?? ICON_PATHS.place;
  const iconSize = 26;
  const scale = iconSize / 24;
  const offset = (SIZE - iconSize) / 2;
  const center = SIZE / 2;
  const radius = SIZE / 2 - 2;
  const pngDataUrl = sentimentPngDataUrls?.[sentiment];

  if (pngDataUrl) {
    const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <circle cx="${center}" cy="${center}" r="${radius}" fill="${ORANGE}"/>
  <g transform="translate(${offset}, ${offset}) scale(${scale})">
    <path fill="${WHITE}" d="${catPath}"/>
  </g>
</svg>`;
    const pinDataUrl = "data:image/svg+xml," + encodeURIComponent(pinSvg);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COMPOSITE_WIDTH}" height="${COMPOSITE_HEIGHT}" viewBox="0 ${VIEWBOX_MIN_Y} ${COMPOSITE_WIDTH} ${COMPOSITE_HEIGHT}">
  <image href="${pinDataUrl.replace(/"/g, "&quot;")}" x="0" y="${VIEWBOX_MIN_Y + BADGE_OFFSET_UP}" width="${SIZE}" height="${SIZE}"/>
  <image href="${pngDataUrl.replace(/"/g, "&quot;")}" x="${BADGE_IMAGE_X}" y="${BADGE_IMAGE_Y}" width="${BADGE_IMAGE_SIZE}" height="${BADGE_IMAGE_SIZE}"/>
</svg>`;
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }

  const color = SENTIMENT_COLORS[sentiment];
  const thumbPath = SENTIMENT_PATHS[sentiment];
  const thumbScale = BADGE_ICON_SIZE / 24;
  const thumbOffset = BADGE_CX - (BADGE_ICON_SIZE / 2) * thumbScale;
  const thumbY = BADGE_CY - (BADGE_ICON_SIZE / 2) * thumbScale;
  /* No stroke on circles: stroke on the orange circle caused a partial white "ghost ring" (visible where the badge does not cover it). */
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COMPOSITE_WIDTH}" height="${COMPOSITE_HEIGHT}" viewBox="0 ${VIEWBOX_MIN_Y} ${COMPOSITE_WIDTH} ${COMPOSITE_HEIGHT}">
  <g transform="translate(0, ${VIEWBOX_MIN_Y + BADGE_OFFSET_UP})">
    <circle cx="${center}" cy="${center}" r="${radius}" fill="${ORANGE}"/>
    <g transform="translate(${offset}, ${offset}) scale(${scale})">
      <path fill="${WHITE}" d="${catPath}"/>
    </g>
  </g>
  <circle cx="${BADGE_CX}" cy="${BADGE_CY}" r="${BADGE_R}" fill="${color}"/>
  <g transform="translate(${thumbOffset}, ${thumbY}) scale(${thumbScale})">
    <path fill="${WHITE}" d="${thumbPath}"/>
  </g>
</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

/**
 * Returns the data URL for a category pin image id (base or with sentiment).
 * Use when preloading: if id is e.g. "pin-cafe-positive", returns composite SVG.
 * Call setSentimentPngDataUrls with fetched PNG data URLs first to use PNG badges.
 */
export function getCategoryPinDataUrlById(imageId: string): string | null {
  const match = imageId.match(
    /^pin-(cafe|restaurant|bar|park|place)(-(positive|neutral|negative))?$/,
  );
  if (!match) return null;
  const categoryKey = match[1];
  const sentiment = match[2]?.slice(1) as UserSentiment | undefined;
  if (sentiment)
    return getCategoryPinWithSentimentSvgDataUrl(categoryKey, sentiment);
  return getCategoryPinSvgDataUrl(categoryKey);
}
