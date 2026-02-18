/**
 * Shared 3D map config: building extrusion layer and camera.
 * Used by My Places PhotoMap and Top Places MapView.
 * 3D buildings only render at zoom >= ZOOM_THRESHOLD_3D for performance.
 */

 

export const BUILDINGS_3D_LAYER_ID = "linkedspaces-3d-buildings";
/** Zoom level at which 3D buildings start rendering (performance) */
export const ZOOM_THRESHOLD_3D = 13;
export const PITCH_3D = 60;
export const BEARING_3D = 20;

const STORAGE_KEY = "linkedspaces-map-3d";

/** Persist 3D preference; restore on load */
export function getPersisted3D(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "true";
  } catch {
    return false;
  }
}

export function setPersisted3D(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
  } catch {}
}

/**
 * Add 3D buildings fill-extrusion layer.
 * Insert before the first symbol layer so labels stay on top; our marker layers are added after, so they render above buildings.
 * Requires style to have "composite" source with "building" source-layer (e.g. mapbox://styles/mapbox/streets-v12).
 */
export function add3DBuildingsLayer(map: any): boolean {
  if (!map || !map.getStyle) return false;
  if (map.getLayer(BUILDINGS_3D_LAYER_ID)) return true;

  const style = map.getStyle();
  const sources = style?.sources ?? {};
  if (!sources.composite) {
    if (typeof console !== "undefined") {
      console.warn(
        "[LinkedSpaces 3D] Style has no 'composite' source; 3D buildings disabled. Use mapbox://styles/mapbox/streets-v12 or similar.",
      );
    }
    return false;
  }

  try {
    const layers = style.layers ?? [];
    const firstSymbolId = layers.find(
      (l: any) => l.type === "symbol" && (l.layout || {})["text-field"],
    )?.id;

    map.addLayer(
      {
        id: BUILDINGS_3D_LAYER_ID,
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: ZOOM_THRESHOLD_3D,
        paint: {
          "fill-extrusion-color": "#c5d0be",
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            ZOOM_THRESHOLD_3D,
            0,
            ZOOM_THRESHOLD_3D + 0.05,
            ["get", "height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            ZOOM_THRESHOLD_3D,
            0,
            ZOOM_THRESHOLD_3D + 0.05,
            ["get", "min_height"],
          ],
          "fill-extrusion-opacity": 0.7,
        },
      },
      firstSymbolId ?? undefined,
    );
    return true;
  } catch (e) {
    if (typeof console !== "undefined") {
      console.warn("[LinkedSpaces 3D] Failed to add 3D buildings layer:", e);
    }
    return false;
  }
}

/** Show or hide the 3D buildings layer (e.g. when toggling 2D/3D). */
export function set3DBuildingsVisibility(map: any, visible: boolean): void {
  try {
    if (!map.getLayer(BUILDINGS_3D_LAYER_ID)) return;
    map.setLayoutProperty(
      BUILDINGS_3D_LAYER_ID,
      "visibility",
      visible ? "visible" : "none",
    );
  } catch {
    // ignore
  }
}

/** Update 3D layer visibility based on current zoom and is3D mode. Call on zoomend and when toggling. */
export function update3DBuildingsVisibility(map: any, is3D: boolean): void {
  const zoom = map.getZoom ? map.getZoom() : 0;
  const show = is3D && zoom >= ZOOM_THRESHOLD_3D;
  set3DBuildingsVisibility(map, show);
}
