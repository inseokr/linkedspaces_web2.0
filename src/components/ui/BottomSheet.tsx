"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;

  /** Defaults to `max-w-[720px]` */
  maxWidthClassName?: string;
  /** Defaults to `max-h-[70vh]` */
  contentMaxHeightClassName?: string;
  /** Defaults to `z-[250]` */
  zIndexClassName?: string;
  /** Defaults to showing a Close button */
  showCloseButton?: boolean;
};

const ENTER_MS = 220;
const EXIT_MS = 180;
const DISMISS_DISTANCE_PX = 120;
const DISMISS_VELOCITY_PX_S = 900;

export default function BottomSheet({
  open,
  onClose,
  children,
  maxWidthClassName = "max-w-[720px]",
  contentMaxHeightClassName = "max-h-[70vh]",
  zIndexClassName = "z-[250]",
  showCloseButton = true,
}: Props) {
  const canUseDOM = typeof document !== "undefined";
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const closeRef = useRef(onClose);
  const dragRef = useRef<{
    active: boolean;
    pointerId: number;
    startY: number;
    startAt: number;
  } | null>(null);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  // ESC to close (only while open)
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Lock page scroll while open (mobile UX)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const durationClass = useMemo(() => {
    // Keep this stable and close enough to ENTER/EXIT.
    return "duration-200";
  }, []);

  const backdropOpacity = useMemo(() => {
    // Fade backdrop slightly while dragging down
    const fade = Math.min(Math.max(dragY / 280, 0), 0.65);
    const base = open ? 1 : 0;
    return base * (1 - fade);
  }, [dragY, open]);

  const effectiveDragY = isDragging && open ? Math.max(0, dragY) : 0;
  const sheetTransform = open
    ? `translate3d(0, ${effectiveDragY}px, 0)`
    : "translate3d(0, 100%, 0)";

  if (!canUseDOM) return null;

  return createPortal(
    <div
      className={[
        "fixed inset-0",
        zIndexClassName,
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        className={[
          "absolute inset-0 bg-black/35",
          "transition-opacity",
          durationClass,
          open ? "opacity-100" : "opacity-0",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        style={{ opacity: backdropOpacity }}
        onClick={() => {
          setIsDragging(false);
          setDragY(0);
          onClose();
        }}
      />

      {/* Sheet */}
      <div className="absolute inset-x-0 bottom-0">
        <div className={`mx-auto w-full ${maxWidthClassName}`}>
          <div
            role="dialog"
            aria-modal={open}
            className={[
              "rounded-t-3xl bg-white shadow-[0_-18px_40px_rgba(0,0,0,0.24)]",
              isDragging ? "" : "transition-transform",
              durationClass,
              open ? "pointer-events-auto" : "pointer-events-none",
            ].join(" ")}
            style={{
              transform: sheetTransform,
              transitionDuration: isDragging
                ? "0ms"
                : `${open ? ENTER_MS : EXIT_MS}ms`,
            }}
          >
            {/* Drag handle area (swipe down to dismiss) */}
            <div
              className="flex items-center justify-between px-4 pt-3"
              style={{ touchAction: "none" }}
              onPointerDown={(e) => {
                // Only start dragging on primary pointer/touch
                if (!open) return;
                if (dragRef.current?.active) return;
                if ((e as any).button != null && (e as any).button !== 0)
                  return;

                dragRef.current = {
                  active: true,
                  pointerId: e.pointerId,
                  startY: e.clientY,
                  startAt: performance.now(),
                };
                setIsDragging(true);
                setDragY(0);
                (e.currentTarget as HTMLDivElement).setPointerCapture?.(
                  e.pointerId,
                );
              }}
              onPointerMove={(e) => {
                const s = dragRef.current;
                if (!s?.active) return;
                if (e.pointerId !== s.pointerId) return;
                const dy = e.clientY - s.startY;
                setDragY(Math.max(0, dy));
              }}
              onPointerUp={(e) => {
                const s = dragRef.current;
                if (!s?.active) return;
                if (e.pointerId !== s.pointerId) return;

                const dy = Math.max(0, e.clientY - s.startY);
                const dt = Math.max(1, performance.now() - s.startAt);
                const v = (dy / dt) * 1000; // px/s

                dragRef.current = null;
                setIsDragging(false);

                if (dy >= DISMISS_DISTANCE_PX || v >= DISMISS_VELOCITY_PX_S) {
                  setDragY(0);
                  closeRef.current();
                  return;
                }

                // Snap back
                setDragY(0);
              }}
              onPointerCancel={(e) => {
                const s = dragRef.current;
                if (!s?.active) return;
                if (e.pointerId !== s.pointerId) return;
                dragRef.current = null;
                setIsDragging(false);
                setDragY(0);
              }}
            >
              <div className="mx-auto h-1.5 w-12 rounded-full bg-black/15" />
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-3 shrink-0 rounded-full bg-black/5 px-3 py-1.5 text-[14px] font-bold text-black/70"
                  aria-label="Dismiss"
                >
                  Close
                </button>
              )}
            </div>

            <div
              className={[
                contentMaxHeightClassName,
                "overflow-y-auto px-3 pb-6 pt-3",
              ].join(" ")}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
