"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

type VideoModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  videoSrc: string;
  posterSrc?: string;
};

export default function VideoModal({
  open,
  onClose,
  title = "Join to LinkedSpaces!",
  videoSrc,
  posterSrc,
}: VideoModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const ariaId = useMemo(() => `video-guide-title-${uuidv4()}`, []);

  // ESC to close
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Pause video when closing
  useEffect(() => {
    if (open) return;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [open]);

  // Basic focus management
  useEffect(() => {
    if (!open) return;
    const el = panelRef.current;
    el?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      {/* Dimmed background */}
      <button
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/55"
      />

      {/* Center card */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaId}
          className="relative w-full max-w-[554px] rounded-[28px] bg-white shadow-2xl outline-none"
        >
          {/* Header */}
          <div className="px-10 pt-10 pb-4 text-center">
            <h2 id={ariaId} className="text-2xl font-semibold tracking-tight">
              {title}
            </h2>
          </div>

          {/* Video frame */}
          <div className="px-10 ">
            <div className="mx-auto w-full max-w-[456px] aspect-[456/461] rounded-xl bg-black/10">
              <video
                ref={videoRef}
                className="object-contain"
                src={videoSrc}
                poster={posterSrc}
                controls
                playsInline
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="text-sm pb-4 pt-4 pr-4 font-medium text-blue-600 hover:text-blue-700"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
