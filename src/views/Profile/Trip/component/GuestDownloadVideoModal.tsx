"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;

  title?: string;
  videoSrc?: string; // "/videos/download.mp4"
  className?: string;

  loop?: boolean; // 자동재생만이면 loop는 취향
};

export default function DownloadVideoModal({
  open,
  onClose,
  title = "Join to LinkedSpaces!",
  videoSrc = "/videos/download.mp4",
  className = "",
  loop = true,
}: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const v = videoRef.current; // ✅ capture

    const t = window.setTimeout(() => {
      if (!v) return;
      v.muted = true;
      v.playsInline = true;
      v.play().catch(() => {});
    }, 50);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;

      if (v) {
        v.pause();
        v.currentTime = 0;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className={[
        "fixed inset-0 z-[9999]",
        "flex items-center justify-center",
        "bg-black/55 backdrop-blur-[2px]",
        className,
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-label="Download modal"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className={[
          "absolute right-10 top-24",
          "h-12 w-12 rounded-full",
          "text-white/95 hover:text-white",
          "flex items-center justify-center",
        ].join(" ")}
      >
        <span className="text-[44px] leading-none">×</span>
      </button>

      <div
        className={[
          "w-[500px] max-w-[92vw]",
          "rounded-[22px] bg-[var(--card-bg)] text-[var(--card-text)] border border-[var(--card-border)]",
          "shadow-[0_30px_90px_rgba(0,0,0,0.35)]",
          "px-10 py-10",
        ].join(" ")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-center text-[28px] font-extrabold">{title}</h2>

        <div className="mt-6">
          <div className="overflow-hidden rounded-[12px] border border-[var(--card-border)] bg-[var(--input-bg)]">
            <video
              ref={videoRef}
              src={videoSrc}
              className="block w-full h-auto"
              autoPlay
              muted
              playsInline
              loop={loop}
              // controls 없음 = 자동재생만
            />
          </div>
        </div>
      </div>
    </div>
  );
}
