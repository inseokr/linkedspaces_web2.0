/**
 * Shared Mapbox visual style for LinkedSpaces: simple, easy to read.
 * Applied to My Places embedded map and Top Spaces full-screen map.
 * Prioritizes readable map text (city names, POIs). Light palette so labels stand out.
 *
 * To use a custom style from Mapbox Studio (studio.mapbox.com or Styles in your account):
 * Set NEXT_PUBLIC_MAPBOX_STYLE in .env.local to your style URL, e.g.:
 *   mapbox://styles/your-username/your-style-id
 * Then restart the dev server. The map will load your style; layer overrides below may still run.
 */

const DEFAULT_MAPBOX_STYLE = "mapbox://styles/mapbox/streets-v12";

/** Map style URL. Use NEXT_PUBLIC_MAPBOX_STYLE to point to a style edited in Mapbox Studio. */
export const MAPBOX_STYLE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_MAPBOX_STYLE) ||
  DEFAULT_MAPBOX_STYLE;

// —— Simple, readable palette: light background, clear labels ——

/** Light neutral background so map text (city names, etc.) is easy to read */
const BACKGROUND_COLOR = "#f5f6f4";
/** Soft blue for water; not too dark so labels stay readable */
const WATER_FILL = "#a8c5e0";
/** Light, muted green for land so text contrasts well */
const LAND_FILL = "#c5d4bc";
/** Slightly richer green for parks; still light for readability */
const PARKS_FILL = "#b8ccae";
/** Light grey for buildings so they don’t compete with labels */
const BUILDING_FILL = "#dde0dc";

/** Roads: clear but not dominant */
const ROAD_MAJOR = "#6b7280";
const ROAD_MINOR = "#9ca3af";
const ROAD_STREET = "#d1d5db";
const ROAD_OPACITY_MINOR = 0.8;

/** Layer IDs we try to override (streets-v12; missing layers are skipped) */
const WATER_LAYER_IDS = ["water", "waterway", "water-shadow"];
const LAND_FILL_LAYER_IDS = [
  "landcover",
  "landuse",
  "landuse-overlay",
  "landuse_overlay",
  "land",
  "landcover-land",
];
const PARKS_LAYER_IDS = [
  "landcover-grass",
  "landcover-wood",
  "national-park",
  "landcover-plant",
];
const ROAD_LAYER_ID_PREFIXES = ["road", "bridge", "tunnel"];

function safeSetPaint(
  map: any,
  layerId: string,
  property: string,
  value: unknown,
): void {
  try {
    if (map.getLayer(layerId)) map.setPaintProperty(layerId, property, value);
  } catch {
    // Layer may not exist in this style version; skip
  }
}

function safeSetLayout(
  map: any,
  layerId: string,
  property: string,
  value: unknown,
): void {
  try {
    if (map.getLayer(layerId)) map.setLayoutProperty(layerId, property, value);
  } catch {
    // skip
  }
}

/**
 * Apply LinkedSpaces map style: simple, light palette, easy-to-read labels.
 * We do not override label/POI opacity so city names and other text stay at full visibility.
 */
export function applyLinkedSpacesMapStyle(map: any): void {
  if (!map || typeof map.getStyle !== "function") return;

  const style = map.getStyle();
  const layers = style?.layers ?? [];

  const waterIds = new Set(WATER_LAYER_IDS);
  const landIds = new Set([...LAND_FILL_LAYER_IDS, ...PARKS_LAYER_IDS]);

  // —— Background: light neutral so labels stand out ——
  safeSetPaint(map, "background", "background-color", BACKGROUND_COLOR);

  // —— Water: soft blue ——
  for (const id of WATER_LAYER_IDS) {
    safeSetPaint(map, id, "fill-color", WATER_FILL);
    safeSetPaint(map, id, "line-color", WATER_FILL);
  }

  // —— Land: light greens (named layers) ——
  for (const id of LAND_FILL_LAYER_IDS) {
    safeSetPaint(map, id, "fill-color", LAND_FILL);
  }
  for (const id of PARKS_LAYER_IDS) {
    safeSetPaint(map, id, "fill-color", PARKS_FILL);
  }

  // —— Catch-all: any other fill layer that looks like land (no more beige) ——
  for (const layer of layers) {
    if (layer.type !== "fill") continue;
    const id = (layer.id ?? "") as string;
    if (waterIds.has(id) || landIds.has(id)) continue;
    const src = (layer as any).source;
    if (src === "composite" || src === "mapbox") {
      const srcLayer = (layer as any)["source-layer"] ?? "";
      if (
        srcLayer.includes("land") ||
        srcLayer.includes("landcover") ||
        srcLayer.includes("landuse") ||
        id.includes("land") ||
        id.includes("landcover") ||
        id.includes("landuse")
      ) {
        safeSetPaint(map, id, "fill-color", LAND_FILL);
      }
    }
  }

  // —— Buildings: soft fill so they don’t compete ——
  for (const layer of layers) {
    const id = (layer.id ?? "") as string;
    if (
      layer.type === "fill" &&
      (id.includes("building") || id.includes("Building"))
    ) {
      safeSetPaint(map, id, "fill-color", BUILDING_FILL);
    }
  }

  // —— Roads: soft colors and lower prominence for minor ——
  for (const layer of layers) {
    const id = layer.id ?? "";
    const isRoad =
      ROAD_LAYER_ID_PREFIXES.some((p) => id.startsWith(p)) ||
      id.includes("road");
    if (!isRoad || layer.type !== "line") continue;
    const paint = layer.paint as Record<string, unknown> | undefined;
    if (paint && "line-color" in paint) {
      if (
        id.includes("motorway") ||
        id.includes("trunk") ||
        id.includes("primary")
      )
        safeSetPaint(map, id, "line-color", ROAD_MAJOR);
      else if (id.includes("secondary") || id.includes("tertiary"))
        safeSetPaint(map, id, "line-color", ROAD_MINOR);
      else safeSetPaint(map, id, "line-color", ROAD_STREET);
    }
    if (id.includes("minor") || id.includes("street"))
      safeSetPaint(map, id, "line-opacity", ROAD_OPACITY_MINOR);
  }

  // Labels & POIs: no opacity overrides — keep style default so city names and text stay easy to read
}
