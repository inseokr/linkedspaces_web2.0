"use client";

/**
 * Single, stable place marker: orange circle + category icon + optional sentiment badge + place name.
 * Used as the custom element for mapboxgl.Marker so the label is always centered under the circle
 * by layout (flex column, align-items center). No drift across hover, selected, zoom, or rerender.
 *
 * Why this structure prevents drift:
 * - One MarkerRoot with display:flex; flex-direction:column; align-items:center. The label is
 *   a block sibling of the circle, so it is centered by the flex container, not by text baseline
 *   or image dimensions. No absolute positioning of the label unless we use left:50%; transform:translateX(-50%).
 * - Circle has fixed width/height; no border or stroke (avoids partial white outline). Selected state
 *   uses box-shadow only so layout never shifts.
 * - PlaceName has explicit line-height and text-align:center; no inline images or baseline alignment.
 */

import {
  getCategoryIconPath,
  SENTIMENT_PNG_PATHS,
} from "../mapbox-category-pins";
import type { UserSentiment } from "../mapbox-category-pins";

const MARKER_SIZE = 44;
const BADGE_SIZE = 26;
const ICON_SIZE = 20;
const LABEL_GAP = 6;
const LABEL_MAX_WIDTH = 140;

export interface OrangePlaceMarkerProps {
  placeName: string;
  category: string;
  sentiment?: UserSentiment | null;
  subtext?: string | null;
  /** When true, show a ring via box-shadow only (no size change). */
  selected?: boolean;
}

export default function OrangePlaceMarker({
  placeName,
  category,
  sentiment,
  subtext,
  selected = false,
}: OrangePlaceMarkerProps) {
  const categoryPath = getCategoryIconPath(category);
  const sentimentPngSrc = sentiment ? SENTIMENT_PNG_PATHS[sentiment] : null;

  return (
    <div
      className="flex flex-col items-center"
      style={
        {
          "--marker-size": `${MARKER_SIZE}px`,
          "--badge-size": `${BADGE_SIZE}px`,
          "--icon-size": `${ICON_SIZE}px`,
          "--label-gap": `${LABEL_GAP}px`,
          "--label-max-width": `${LABEL_MAX_WIDTH}px`,
        } as React.CSSProperties
      }
    >
      {/* MarkerCircle: fixed size, no border/stroke/outline to avoid white ring. Selected = box-shadow only. */}
      <div
        className="relative flex shrink-0 items-center justify-center rounded-full bg-[#f97316]"
        style={{
          width: "var(--marker-size)",
          height: "var(--marker-size)",
          boxShadow: selected
            ? "0 0 0 3px rgba(255,255,255,0.9)"
            : "0 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        {/* SentimentBadge: top-right, absolute; use PNG so neutral shows correct hand-to-side icon. */}
        {sentimentPngSrc && (
          <div
            className="absolute flex items-center justify-center overflow-hidden rounded-full"
            style={{
              width: "var(--badge-size)",
              height: "var(--badge-size)",
              top: -2,
              right: -2,
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            <img
              src={sentimentPngSrc}
              alt=""
              width={BADGE_SIZE}
              height={BADGE_SIZE}
              className="block h-full w-full object-cover"
            />
          </div>
        )}

        {/* CategoryIcon: centered in circle; block display to avoid baseline gap. */}
        <svg
          width={ICON_SIZE}
          height={ICON_SIZE}
          viewBox="0 0 24 24"
          className="block shrink-0"
          aria-hidden
        >
          <path fill="#fff" d={categoryPath} />
        </svg>
      </div>

      {/* PlaceName: block, bold, text-align center. Centered by MarkerRoot align-items:center. */}
      <div
        className="block text-center font-bold"
        style={{
          marginTop: "var(--label-gap)",
          maxWidth: "var(--label-max-width)",
          lineHeight: 1.2,
          fontSize: 12,
          fontWeight: 700,
          paddingLeft: 4,
          paddingRight: 4,
          color: "#fff",
          textShadow: "0 0 2px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.8)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {placeName || "\u00A0"}
      </div>

      {subtext && (
        <div
          className="block text-center"
          style={{
            marginTop: 2,
            maxWidth: "var(--label-max-width)",
            lineHeight: 1.2,
            fontSize: 10,
            paddingLeft: 4,
            paddingRight: 4,
            color: "rgba(255,255,255,0.9)",
            textShadow: "0 0 1px rgba(0,0,0,0.8)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {subtext}
        </div>
      )}
    </div>
  );
}
