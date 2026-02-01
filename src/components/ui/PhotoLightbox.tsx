"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";

import { idbGetBlob } from "@/views/Profile/Trip/edit/utils/imageIdb";

type Props = {
  photos: string[];
  initialIndex?: number;
  title?: string;
  onClose: () => void;
};

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
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative mx-auto w-[min(1100px,92vw)] rounded-2xl bg-black/25 p-3 backdrop-blur"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-2 pb-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white/90">
              {title ?? "Photo"}
            </div>
            <div className="text-xs text-white/70">
              {total ? `${activeIdx + 1} / ${total}` : ""}
            </div>
          </div>

          <div className="flex items-center gap-2">
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
              if (zoom <= 1) return;
              const stage = stageRef.current;
              if (!stage) return;

              dragRef.current = {
                active: true,
                startX: e.clientX,
                startY: e.clientY,
                startOffX: offset.x,
                startOffY: offset.y,
              };

              stage.setPointerCapture?.(e.pointerId);
            }}
            onPointerMove={(e) => {
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
              dragRef.current.active = false;
              stageRef.current?.releasePointerCapture?.(e.pointerId);
            }}
            onPointerCancel={(e) => {
              dragRef.current.active = false;
              stageRef.current?.releasePointerCapture?.(e.pointerId);
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
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
