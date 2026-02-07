/**
 * Category pins for Mapbox: orange circle + Google Material Icons.
 * Used on My Places map for unclustered markers when no thumbnail is available.
 */

const ORANGE = "#f97316";
const WHITE = "#ffffff";
const SIZE = 48;

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

/** Image id for Mapbox addImage (e.g. "pin-cafe", "pin-place") */
export function getCategoryPinImageId(category: string): string {
  return `pin-${categoryToIconKey(category)}`;
}

/** All pin image ids that may be used (for preloading) */
export const CATEGORY_PIN_IDS = [
  "pin-cafe",
  "pin-restaurant",
  "pin-bar",
  "pin-park",
  "pin-place",
] as const;

/**
 * Returns a data URL for an SVG: orange circle + white Material Icon in the center.
 * Size 48x48; icon scaled to fit inside the circle for better recognition.
 */
export function getCategoryPinSvgDataUrl(category: string): string {
  const key = categoryToIconKey(category);
  const path = ICON_PATHS[key] ?? ICON_PATHS.place;
  const iconSize = 20;
  const scale = iconSize / 24;
  const offset = (SIZE - iconSize) / 2;
  const center = SIZE / 2;
  const radius = SIZE / 2 - 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <circle cx="${center}" cy="${center}" r="${radius}" fill="${ORANGE}" stroke="${WHITE}" stroke-width="2"/>
  <g transform="translate(${offset}, ${offset}) scale(${scale})">
    <path fill="${WHITE}" d="${path}"/>
  </g>
</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
