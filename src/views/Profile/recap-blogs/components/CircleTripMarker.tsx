"use client";

import Image from "next/image";
import React from "react";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";

type Props = {
  label: string;
  imageUrl: string;
  dateLabel?: string; // e.g. "Nov 2024"
  isActive?: boolean;

  /** 원형 이미지 지름(px) */
  size?: number; // default 56

  /** 텍스트 크기/스타일 커스텀 */
  className?: string;

  /** 클릭 핸들러 (marker 클릭 등에 사용) */
  onClick?: () => void;
};

export default function CircleTripMarker({
  label,
  imageUrl,
  dateLabel,
  isActive = false,
  size = 56,
  className = "",
  onClick,
}: Props) {
  const ringStyle: React.CSSProperties = {
    width: size,
    height: size,
  };

  const borderStyle: React.CSSProperties = {
    borderWidth: 2,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative select-none",
        "flex flex-col items-center",
        "focus:outline-none",
        className,
      ].join(" ")}
      style={{ cursor: onClick ? "pointer" : "default" }}
      aria-label={label}
    >
      {/* Circle image with ring */}
      <div className="relative" style={ringStyle}>
        {/* radiation rings */}
        {isActive && (
          <>
            <span className="ls-radar ls-radar-1" />
            <span className="ls-radar ls-radar-2" />
            <span className="ls-radar ls-radar-3" />
          </>
        )}

        <div
          className={[
            "relative overflow-hidden rounded-full",
            "border-solid",
            "shadow-[0_10px_22px_rgba(0,0,0,0.22)]",
          ].join(" ")}
          style={{
            ...ringStyle,
            ...borderStyle,
            // Keep a subtle white edge for contrast (no border highlight).
            borderColor: "rgba(255,255,255,0.95)",
          }}
        >
          <Image
            src={normalizeImageSrc(imageUrl).src}
            alt={String(label)}
            unoptimized={normalizeImageSrc(imageUrl).unoptimized}
            fill
            className="object-cover"
            sizes={`${size}px`}
          />
        </div>
      </div>

      {/* Year/Month */}
      {!!dateLabel && (
        <div
          className={[
            "mt-1",
            "inline-flex items-center justify-center",
            "rounded-full",
            "border border-black/10",
            "bg-white/90 px-2.5 py-1",
            "text-[11px] font-semibold leading-none text-black/70",
            "shadow-[0_10px_24px_rgba(0,0,0,0.16)]",
            "backdrop-blur",
          ].join(" ")}
          title={dateLabel}
        >
          {dateLabel}
        </div>
      )}

      {/* Smoother "radar" animation for active markers */}
      <style jsx>{`
        @keyframes lsRadar {
          0% {
            transform: scale(1);
            opacity: 0.55;
          }
          55% {
            opacity: 0.18;
          }
          100% {
            transform: scale(2.15);
            opacity: 0;
          }
        }

        .ls-radar {
          position: absolute;
          /* extend beyond the image for a nicer glow radius */
          inset: -10px;
          border-radius: 9999px;
          border: 2px solid rgba(249, 115, 22, 0.42);
          filter: blur(0.2px);
          will-change: transform, opacity;
          animation: lsRadar 2.8s cubic-bezier(0.22, 0.02, 0.16, 1) infinite;
          pointer-events: none;
        }

        .ls-radar-1 {
          border-color: rgba(249, 115, 22, 0.52);
        }

        .ls-radar-2 {
          animation-delay: 0.55s;
          border-color: rgba(251, 146, 60, 0.42);
        }

        .ls-radar-3 {
          animation-delay: 1.1s;
          border-color: rgba(253, 186, 116, 0.34);
        }
      `}</style>
    </button>
  );
}
