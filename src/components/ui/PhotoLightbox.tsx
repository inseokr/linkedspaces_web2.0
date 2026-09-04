"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";

import { idbGetBlob } from "@/views/Profile/Trip/edit/utils/imageIdb";

type Props = {
  photos: string[];
  initialIndex?: number;
  title?: string;
  dateTime?: string;
  captions?: string[];
  caption?: string;
  /** When provided, show a "select" action for the active photo. */
  onSelect?: (photo: string, index: number) => void;
  selectLabel?: string;
  onClose: () => void;
};

function PhotoThumb({
  photo,
  active,
  label,
  onClick,
  "data-idx": dataIdx,
}: {
  photo: string;
  active: boolean;
  label: string;
  onClick: () => void;
  "data-idx"?: number;
}) {
  const [resolved, setResolved] = useState<string>(photo);
  const revokeRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (revokeRef.current) {
        URL.revokeObjectURL(revokeRef.current);
        revokeRef.current = null;
      }

      if (!photo) {
        setResolved("");
        return;
      }

      if (!photo.startsWith("idb:")) {
        setResolved(photo);
        return;
      }

      const key = photo.replace(/^idb:/, "");
      const blob = await idbGetBlob(key);
      if (!blob) {
        setResolved("");
        return;
      }

      const url = URL.createObjectURL(blob);
      revokeRef.current = url;
      if (!cancelled) setResolved(url);
    }

    run();
    return () => {
      cancelled = true;
      if (revokeRef.current) {
        URL.revokeObjectURL(revokeRef.current);
        revokeRef.current = null;
      }
    };
  }, [photo]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-idx={dataIdx}
      className={[
        "relative h-14 w-14 flex-none overflow-hidden rounded-lg bg-white/5",
        "ring-1 ring-white/15 hover:ring-white/35",
        active ? "ring-2 ring-white" : "opacity-80",
      ].join(" ")}
    >
      {resolved ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved}
          alt=""
          className="h-full w-full object-cover select-none"
          draggable={false}
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-[10px] text-white/50">
          No image
        </div>
      )}
    </button>
  );
}

function clampIndex(idx: number, total: number) {
  if (total <= 0) return 0;
  if (!Number.isFinite(idx)) return 0;
  return Math.min(Math.max(0, idx), total - 1);
}

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export default function PhotoLightbox({
  photos,
  initialIndex = 0,
  title,
  dateTime,
  captions,
  caption,
  onSelect,
  selectLabel = "Use this photo",
  onClose,
}: Props) {
  const total = photos.length;
  const [activeIdx, setActiveIdx] = useState(() =>
    clampIndex(initialIndex, total),
  );

  // ESC / Arrow navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (total <= 1) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, total]);

  // Lock page scroll while mounted.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const activePhoto = photos[activeIdx] ?? "";
  const [resolvedSrc, setResolvedSrc] = useState<string>(activePhoto);
  const revokeRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (revokeRef.current) {
        URL.revokeObjectURL(revokeRef.current);
        revokeRef.current = null;
      }

      if (!activePhoto) {
        setResolvedSrc("");
        return;
      }

      if (!activePhoto.startsWith("idb:")) {
        setResolvedSrc(activePhoto);
        return;
      }

      const key = activePhoto.replace(/^idb:/, "");
      const blob = await idbGetBlob(key);
      if (!blob) {
        setResolvedSrc("");
        return;
      }

      const url = URL.createObjectURL(blob);
      revokeRef.current = url;
      if (!cancelled) setResolvedSrc(url);
    }

    run();
    return () => {
      cancelled = true;
      if (revokeRef.current) {
        URL.revokeObjectURL(revokeRef.current);
        revokeRef.current = null;
      }
    };
  }, [activePhoto]);

  const ZOOM_MIN = 1;
  const ZOOM_MAX = 4;
  const ZOOM_STEP = 0.25;

  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const stageRef = useRef<HTMLDivElement | null>(null);
  const thumbsRef = useRef<HTMLDivElement | null>(null);
  const backdropPointerDownRef = useRef(false);
  const zoomRef = useRef<number>(1);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{
    startDist: number;
    startZoom: number;
    startOffset: { x: number; y: number };
  } | null>(null);
  const swipeRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    startedAt: number;
    pointerType: string;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startedAt: 0,
    pointerType: "",
  });
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startOffX: number;
    startOffY: number;
  }>({ active: false, startX: 0, startY: 0, startOffX: 0, startOffY: 0 });

  const clampOffsetToStage = (
    next: { x: number; y: number },
    nextZoom: number,
  ) => {
    const stage = stageRef.current;
    if (!stage) return next;

    const r = stage.getBoundingClientRect();
    const maxX = Math.max(0, (r.width * nextZoom - r.width) / 2);
    const maxY = Math.max(0, (r.height * nextZoom - r.height) / 2);

    return {
      x: clamp(next.x, -maxX, maxX),
      y: clamp(next.y, -maxY, maxY),
    };
  };

  const getStageCenter = () => {
    const stage = stageRef.current;
    if (!stage) return null;
    const r = stage.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const setZoomWithAnchor = (
    nextZoomRaw: number,
    anchor: { x: number; y: number },
  ) => {
    const center = getStageCenter();
    if (!center) return;

    const z0 = zoomRef.current;
    const off0 = offsetRef.current;
    const z1 = clamp(nextZoomRaw, ZOOM_MIN, ZOOM_MAX);
    if (z0 === z1) return;

    const k = z1 / z0;
    const dx = anchor.x - center.x;
    const dy = anchor.y - center.y;

    const nextOffset = {
      x: dx * (1 - k) + off0.x * k,
      y: dy * (1 - k) + off0.y * k,
    };

    setZoom(z1);
    setOffset(z1 <= 1 ? { x: 0, y: 0 } : clampOffsetToStage(nextOffset, z1));
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const setZoomClamped = (nextZoom: number) => {
    const z = clamp(nextZoom, ZOOM_MIN, ZOOM_MAX);
    setZoom(z);
    setOffset(z <= 1 ? { x: 0, y: 0 } : clampOffsetToStage(offset, z));
  };

  const goPrev = () => {
    if (total <= 1) return;
    setActiveIdx((i) => (i - 1 + total) % total);
    resetView();
  };

  const goNext = () => {
    if (total <= 1) return;
    setActiveIdx((i) => (i + 1) % total);
    resetView();
  };

  useEffect(() => {
    if (total <= 1) return;
    const strip = thumbsRef.current;
    if (!strip) return;
    const activeBtn = strip.querySelector<HTMLButtonElement>(
      `button[data-idx="${activeIdx}"]`,
    );
    activeBtn?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIdx, total]);

  const canUseDOM = typeof document !== "undefined";
  if (!canUseDOM) return null;

  const showNav = total > 1;

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center">
      {/* Backdrop (dims everything) */}
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-[2px] transition-opacity"
        aria-label="Close photo viewer"
        onPointerDown={() => {
          backdropPointerDownRef.current = true;
          onClose();
        }}
        onPointerUp={() => {
          backdropPointerDownRef.current = false;
        }}
        onPointerCancel={() => {
          backdropPointerDownRef.current = false;
        }}
        onClick={() => {
          // Prevent double-close (touch -> pointerdown then click).
          if (backdropPointerDownRef.current) {
            backdropPointerDownRef.current = false;
            return;
          }
          onClose();
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative mx-auto w-[min(1100px,92vw)] rounded-2xl bg-black/25 p-3 backdrop-blur"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-2 pb-2">
          <div className="min-w-0 flex-1"></div>

          <div className="flex items-center gap-2">
            {onSelect && total > 0 && (
              <button
                type="button"
                className="mr-1 inline-flex h-10 items-center justify-center rounded-full bg-white/20 px-4 text-sm font-semibold text-white hover:bg-white/30"
                onClick={() => onSelect(photos[activeIdx]!, activeIdx)}
              >
                {selectLabel}
              </button>
            )}
            <div className="hidden sm:block w-12 text-center text-xs font-semibold text-white/80">
              {Math.round(zoom * 100)}%
            </div>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-40"
              aria-label="Zoom out"
              onClick={() => setZoomClamped(zoom - ZOOM_STEP)}
              disabled={zoom <= ZOOM_MIN}
            >
              <Minus className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-40"
              aria-label="Zoom in"
              onClick={() => setZoomClamped(zoom + ZOOM_STEP)}
              disabled={zoom >= ZOOM_MAX}
            >
              <Plus className="h-5 w-5" />
            </button>

            <button
              type="button"
              className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Close"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Image area */}
        <div className="relative overflow-hidden rounded-xl bg-black">
          <div
            ref={stageRef}
            className={[
              "relative h-[min(78vh,760px)] w-full",
              zoom > 1
                ? "cursor-grab active:cursor-grabbing"
                : "cursor-default",
              "touch-none",
            ].join(" ")}
            onPointerDown={(e) => {
              const stage = stageRef.current;
              if (!stage) return;

              // Prevent stage gesture handling from breaking clicks on controls
              // that live inside the stage (prev/next buttons, etc.).
              const targetEl = e.target as HTMLElement | null;
              if (
                targetEl &&
                targetEl !== e.currentTarget &&
                targetEl.closest("button")
              ) {
                return;
              }

              const isTouchLike =
                e.pointerType === "touch" || e.pointerType === "pen";
              // Pointer capture is great for touch gestures, but on desktop it can
              // interfere with click synthesis for child elements (buttons).
              if (isTouchLike) stage.setPointerCapture?.(e.pointerId);

              pointersRef.current.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY,
              });

              dragRef.current = {
                active: false,
                startX: e.clientX,
                startY: e.clientY,
                startOffX: offset.x,
                startOffY: offset.y,
              };

              const pts = Array.from(pointersRef.current.values());
              if (pts.length === 2) {
                // Begin pinch gesture.
                const [a, b] = pts;
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                pinchRef.current = {
                  startDist: Math.hypot(dx, dy) || 1,
                  startZoom: zoom,
                  startOffset: { ...offset },
                };
                dragRef.current.active = false;
                swipeRef.current.active = false;
                return;
              }

              // Single pointer:
              // - if zoomed in: enable drag-pan
              // - if not zoomed: allow touch swipe to navigate between photos
              if (zoom <= 1) {
                if (isTouchLike && total > 1) {
                  swipeRef.current = {
                    active: true,
                    pointerId: e.pointerId,
                    startX: e.clientX,
                    startY: e.clientY,
                    lastX: e.clientX,
                    lastY: e.clientY,
                    startedAt: performance.now(),
                    pointerType: e.pointerType,
                  };
                }
                return;
              }
              if (pinchRef.current) return;
              dragRef.current.active = true;
              stage.setPointerCapture?.(e.pointerId);
            }}
            onPointerMove={(e) => {
              pointersRef.current.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY,
              });

              // Pinch zoom with 2 pointers (touch).
              if (pinchRef.current && pointersRef.current.size >= 2) {
                const center = getStageCenter();
                if (!center) return;

                const pts = Array.from(pointersRef.current.values());
                const a = pts[0]!;
                const b = pts[1]!;

                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.hypot(dx, dy) || 1;
                const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

                const scale = dist / pinchRef.current.startDist;
                const nextZoom = clamp(
                  pinchRef.current.startZoom * scale,
                  ZOOM_MIN,
                  ZOOM_MAX,
                );

                const k = nextZoom / pinchRef.current.startZoom;
                const mx = mid.x - center.x;
                const my = mid.y - center.y;

                const nextOffset = {
                  x: mx * (1 - k) + pinchRef.current.startOffset.x * k,
                  y: my * (1 - k) + pinchRef.current.startOffset.y * k,
                };

                setZoom(nextZoom);
                setOffset(
                  nextZoom <= 1
                    ? { x: 0, y: 0 }
                    : clampOffsetToStage(nextOffset, nextZoom),
                );
                return;
              }

              // Swipe navigation (only when not zoomed).
              if (
                swipeRef.current.active &&
                swipeRef.current.pointerId === e.pointerId &&
                zoomRef.current <= 1
              ) {
                swipeRef.current.lastX = e.clientX;
                swipeRef.current.lastY = e.clientY;
              }

              if (!dragRef.current.active) return;
              if (zoom <= 1) return;

              const dx = e.clientX - dragRef.current.startX;
              const dy = e.clientY - dragRef.current.startY;

              const next = {
                x: dragRef.current.startOffX + dx,
                y: dragRef.current.startOffY + dy,
              };
              setOffset(clampOffsetToStage(next, zoom));
            }}
            onPointerUp={(e) => {
              const wasPinching = Boolean(pinchRef.current);
              dragRef.current.active = false;
              stageRef.current?.releasePointerCapture?.(e.pointerId);
              pointersRef.current.delete(e.pointerId);
              if (pointersRef.current.size < 2) {
                pinchRef.current = null;
              }

              // Commit swipe if it was active and we are not zoomed.
              if (
                swipeRef.current.active &&
                swipeRef.current.pointerId === e.pointerId &&
                !wasPinching &&
                zoomRef.current <= 1 &&
                total > 1
              ) {
                const dx = swipeRef.current.lastX - swipeRef.current.startX;
                const dy = swipeRef.current.lastY - swipeRef.current.startY;
                const dt = Math.max(
                  1,
                  performance.now() - swipeRef.current.startedAt,
                );

                const absX = Math.abs(dx);
                const absY = Math.abs(dy);

                const minDist = 60; // px
                const minDistFast = 35; // px for quick swipes
                const fast = dt < 220;

                if (
                  absX > absY * 1.4 &&
                  (absX >= minDist || (fast && absX >= minDistFast))
                ) {
                  if (dx < 0) goNext();
                  if (dx > 0) goPrev();
                }
              }

              if (swipeRef.current.pointerId === e.pointerId) {
                swipeRef.current.active = false;
                swipeRef.current.pointerId = null;
              }

              // If we just ended a pinch and one pointer remains down,
              // allow seamless transition into drag-pan.
              if (
                wasPinching &&
                pointersRef.current.size === 1 &&
                zoomRef.current > 1
              ) {
                const remaining = Array.from(pointersRef.current.values())[0]!;
                dragRef.current = {
                  active: true,
                  startX: remaining.x,
                  startY: remaining.y,
                  startOffX: offsetRef.current.x,
                  startOffY: offsetRef.current.y,
                };
              }
            }}
            onPointerCancel={(e) => {
              const wasPinching = Boolean(pinchRef.current);
              dragRef.current.active = false;
              stageRef.current?.releasePointerCapture?.(e.pointerId);
              pointersRef.current.delete(e.pointerId);
              if (pointersRef.current.size < 2) {
                pinchRef.current = null;
              }

              if (swipeRef.current.pointerId === e.pointerId) {
                swipeRef.current.active = false;
                swipeRef.current.pointerId = null;
              }

              if (
                wasPinching &&
                pointersRef.current.size === 1 &&
                zoomRef.current > 1
              ) {
                const remaining = Array.from(pointersRef.current.values())[0]!;
                dragRef.current = {
                  active: true,
                  startX: remaining.x,
                  startY: remaining.y,
                  startOffX: offsetRef.current.x,
                  startOffY: offsetRef.current.y,
                };
              }
            }}
            onWheel={(e) => {
              // Trackpad pinch zoom is typically emitted as ctrl+wheel on macOS.
              if (!e.ctrlKey) return;
              e.preventDefault();

              // Positive deltaY -> zoom out.
              const factor = Math.exp(-e.deltaY * 0.003);
              setZoomWithAnchor(zoomRef.current * factor, {
                x: e.clientX,
                y: e.clientY,
              });
            }}
          >
            {resolvedSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedSrc}
                alt={title ?? "Photo"}
                className="absolute inset-0 h-full w-full object-contain select-none"
                style={{
                  transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                  transformOrigin: "center",
                  willChange: zoom > 1 ? "transform" : undefined,
                }}
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-sm text-white/60">
                No image
              </div>
            )}

            {showNav && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Bottom info overlay: place name, timestamp, caption.
                Keep this light + short so the bottom of the photo stays visible. */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-4 pt-14 pb-5 flex flex-col items-center justify-end z-[50] pointer-events-none">
              <h2 className="text-center text-xl sm:text-2xl font-semibold text-white leading-snug tracking-tight">
                {title ?? "Photo"}
              </h2>
              {dateTime && (
                <p className="text-center text-base text-white/85 mt-1 font-medium">
                  {dateTime}
                </p>
              )}
              {(() => {
                const currentCaption =
                  captions?.[activeIdx] ??
                  (activeIdx === 0 ? caption : null) ??
                  caption;
                if (!currentCaption?.trim()) return null;
                return (
                  <div className="mt-3 w-full min-h-[2.5rem] flex items-center justify-center px-2">
                    <p className="text-center text-base sm:text-lg text-white/95 leading-relaxed max-w-[min(100%,52rem)] line-clamp-4 pointer-events-auto font-medium">
                      {currentCaption}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Thumbnail preview strip */}
        {total > 1 && (
          <div className="mt-3 rounded-xl bg-black/25 px-2 py-2">
            <div
              ref={thumbsRef}
              className={[
                "flex items-center gap-2 overflow-x-auto overscroll-x-contain",
                "py-1",
                "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              ].join(" ")}
            >
              {photos.map((p, idx) => (
                <PhotoThumb
                  key={`thumb-${idx}-${p}`}
                  photo={p}
                  active={idx === activeIdx}
                  label={`View photo ${idx + 1}`}
                  data-idx={idx}
                  onClick={() => {
                    setActiveIdx(idx);
                    resetView();
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
