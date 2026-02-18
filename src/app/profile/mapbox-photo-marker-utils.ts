/**
 * Helpers for photo-based map markers: circular thumb with border and shadow.
 * Used so markers feel native and polished in 2D and 3D.
 */

const MARKER_SIZE = 80;
const BORDER_WIDTH = 3;
const SHADOW_OFFSET = 2;
const SHADOW_BLUR = 4;

/**
 * Draw image as a circle with border and light shadow into a canvas.
 * Returns the canvas (or the original image if canvas drawing fails).
 * Mapbox addImage accepts HTMLImageElement, ImageBitmap, or { width, height, data }.
 */
export function drawCircularThumb(
  img: HTMLImageElement | ImageBitmap,
  size: number = MARKER_SIZE,
): HTMLCanvasElement | HTMLImageElement {
  const s = Math.max(32, Math.min(128, size));
  const dpr = 2;
  const w = s * dpr;
  const h = s * dpr;
  const r = (s / 2) * dpr;
  let canvas: HTMLCanvasElement;
  try {
    canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return img instanceof HTMLImageElement ? img : drawFallback(img);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    // Shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowOffsetX = SHADOW_OFFSET;
    ctx.shadowOffsetY = SHADOW_OFFSET;
    ctx.shadowBlur = SHADOW_BLUR;
    ctx.beginPath();
    ctx.arc(r, r, r - BORDER_WIDTH, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.restore();
    // Clip to circle and draw image
    ctx.save();
    ctx.beginPath();
    ctx.arc(r, r, r - BORDER_WIDTH, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0, w, h);
    ctx.restore();
    // Border ring
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = BORDER_WIDTH * dpr;
    ctx.beginPath();
    ctx.arc(r, r, r - BORDER_WIDTH, 0, Math.PI * 2);
    ctx.stroke();
    return canvas;
  } catch {
    return img instanceof HTMLImageElement ? img : drawFallback(img);
  }
}

function drawFallback(img: ImageBitmap): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.drawImage(img, 0, 0);
  return canvas;
}

/**
 * Create an ImageBitmap or Image from canvas for map.addImage.
 * Mapbox accepts ImageBitmap | HTMLImageElement | ImageData.
 */
export function canvasToImageBitmap(
  canvas: HTMLCanvasElement,
): Promise<ImageBitmap | null> {
  if (typeof createImageBitmap === "undefined") return Promise.resolve(null);
  return createImageBitmap(canvas).catch(() => null);
}
