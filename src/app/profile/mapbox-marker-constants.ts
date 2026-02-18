/**
 * Single source of truth for Mapbox place marker sizing and layout.
 * One marker design only; selection is shown via a separate overlay ring. No layout shift.
 */

/** Base circle radius (px) for unclustered place markers. Never change on selection. */
export const MARKER_CIRCLE_RADIUS = 22;

/** Stroke width (px) for the base marker circle. Set to 0 to avoid any ghost ring; no stroke on SVG pins. */
export const MARKER_CIRCLE_STROKE_WIDTH = 0;

/** Radius (px) for the selected-place overlay ring only. Base marker size stays MARKER_CIRCLE_RADIUS. */
export const MARKER_SELECTED_RING_RADIUS = 26;

/** Stroke width (px) for the selected overlay ring. */
export const MARKER_SELECTED_RING_STROKE_WIDTH = 3;

/** Mapbox icon-size for the symbol (category pin) layer. Fixed; no state-based change. */
export const MARKER_ICON_SIZE = 1.1;

/**
 * Mapbox text-offset [0, y] for place name label when text-anchor is "center".
 * Label center is placed at (symbolPoint.x, symbolPoint.y + y) so the name is mathematically centered under the marker.
 * Same value in PhotoMap and TopPlacesMapView for consistent alignment.
 */
export const MARKER_LABEL_OFFSET_Y = 2.6;
