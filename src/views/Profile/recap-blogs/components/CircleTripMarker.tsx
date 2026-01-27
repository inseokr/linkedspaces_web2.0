"use client";

import Image from "next/image";
import React from "react";

type Props = {
  year: number | string;
  label: string;
  imageUrl: string;

  /** 원형 이미지 지름(px) */
  size?: number; // default 56

  /** 링 두께(px) */
  ringWidth?: number; // default 4

  /** 링 컬러 (tailwind class) */
  ringClassName?: string; // default "ring-orange-500"

  /** 텍스트 크기/스타일 커스텀 */
  className?: string;

  /** 클릭 핸들러 (marker 클릭 등에 사용) */
  onClick?: () => void;
};

export default function CircleTripMarker({
  year,
  label,
  imageUrl,
  size = 56,
  ringWidth = 4,
  ringClassName = "ring-orange-500",
  className = "",
  onClick,
}: Props) {
  const ringStyle: React.CSSProperties = {
    width: size,
    height: size,
  };

  // Tailwind의 ring-[n]은 정적일 때만 안정적이라
  // 두께는 inline border로 처리(원하는 경우 ring으로 바꿔도 됨)
  const borderStyle: React.CSSProperties = {
    borderWidth: ringWidth,
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
      aria-label={`${year} ${label}`}
    >
      {/* Year */}
      <div className="mb-1 text-[24px] font-extrabold leading-none text-black drop-shadow-sm">
        {year}
      </div>

      {/* Circle image with ring */}
      <div
        className={[
          "relative overflow-hidden rounded-full",
          "border-solid",
          "shadow-md",
        ].join(" ")}
        style={{ ...ringStyle, ...borderStyle, borderColor: "#f97316" }}
      >
        <Image
          src={imageUrl}
          alt={String(label)}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      </div>

      {/* Label */}
      <div className="mt-1 text-[14px] font-semibold text-black drop-shadow-sm">
        {label}
      </div>
    </button>
  );
}
