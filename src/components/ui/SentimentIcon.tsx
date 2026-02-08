"use client";

import Image from "next/image";
import {
  SENTIMENT_PNG_PATHS,
  type UserSentiment,
} from "@/app/profile/mapbox-category-pins";

const SENTIMENT_LABELS: Record<UserSentiment, string> = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
};

export interface SentimentIconProps {
  sentiment: UserSentiment;
  /** Size in pixels; default 32. Use for both badge and inline. */
  size?: number;
  className?: string;
  /** If true, render inside a circular badge (e.g. for place cards). */
  badge?: boolean;
}

/**
 * User sentiment icon using the same PNG assets as Mapbox place markers.
 * Use across the site for consistency: Latest activity, My Places list, VIEW ALL places.
 */
export default function SentimentIcon({
  sentiment,
  size = 32,
  className = "",
  badge = false,
}: SentimentIconProps) {
  const src = SENTIMENT_PNG_PATHS[sentiment];
  const label = SENTIMENT_LABELS[sentiment];

  // Block display removes the baseline gap that inline <img> gets, so the icon
  // aligns vertically with adjacent pill text when the row uses flex items-center.
  const image = (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={
        badge
          ? "h-full w-full object-contain p-0.5"
          : `block ${className}`.trim()
      }
      title={`Sentiment: ${label}`}
      aria-hidden
      unoptimized
    />
  );

  if (badge) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-gray-200 bg-white ${className}`}
        style={{ width: size, height: size }}
        title={`Sentiment: ${label}`}
        aria-label={`Sentiment: ${label}`}
      >
        {image}
      </span>
    );
  }

  // Wrapper: inline-flex + fixed size + flex center so the icon is visually
  // centered and aligns with pill/text in a flex row (no baseline/line-height shift).
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center self-center ${className}`}
      style={{ width: size, height: size }}
      title={`Sentiment: ${label}`}
      aria-label={`Sentiment: ${label}`}
    >
      {image}
    </span>
  );
}
