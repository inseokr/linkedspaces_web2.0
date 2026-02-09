"use client";

import { useRef } from "react";
import Image from "next/image";
import { Map, ChevronDown, ChevronUp } from "lucide-react";
import ExploreMap from "./ExploreMap";
import type { MockPlace } from "@/lib/mockNetwork";
import type { ExploreMapPlace } from "@/lib/explore/exploreTypes";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";

export interface ExploreMapPanelProps {
  places: MockPlace[];
  radiusMiles: number;
  flyToLngLat: { lng: number; lat: number } | null;
  highlightedPlaceId: string | null;
  /** Small overlay card on map when user selected a place from a card (optional) */
  overlayPlace?: ExploreMapPlace | null;
  onPlaceClick?: (place: MockPlace) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

export default function ExploreMapPanel({
  places,
  radiusMiles,
  flyToLngLat,
  highlightedPlaceId,
  overlayPlace,
  onPlaceClick,
  collapsed = false,
  onCollapsedChange,
  className = "",
}: ExploreMapPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={panelRef}
      className={`flex flex-col border-l border-[var(--card-border)] bg-[var(--card-bg)] ${className}`}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2">
        <span className="text-sm font-medium text-[var(--card-text)]">Map</span>
        <button
          type="button"
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-[var(--card-text-muted)] hover:bg-[var(--color-neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] lg:hidden"
          aria-label={collapsed ? "Show map" : "Collapse map"}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <>
              <Map className="h-4 w-4" />
              <span>Show map</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span>Collapse map</span>
            </>
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="relative min-h-[300px] min-w-0 flex-1 lg:min-h-0">
          <ExploreMap
            places={places}
            radiusMiles={radiusMiles}
            flyToLngLat={flyToLngLat}
            highlightedPlaceId={highlightedPlaceId}
            onPlaceClick={onPlaceClick}
            className="absolute inset-0 h-full w-full"
          />
          {overlayPlace && (
            <div className="absolute bottom-3 left-3 right-3 z-20 max-w-[240px] overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-lg">
              <div className="relative aspect-[16/10] w-full bg-[var(--color-neutral)]">
                {overlayPlace.imageUrl && (
                  <Image
                    src={normalizeImageSrc(overlayPlace.imageUrl).src}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="240px"
                  />
                )}
              </div>
              <div className="p-2">
                <p className="truncate font-semibold text-[var(--card-text)]">
                  {overlayPlace.name}
                </p>
                {(overlayPlace.likes != null ||
                  overlayPlace.saves != null ||
                  overlayPlace.visits != null) && (
                  <p className="text-xs text-[var(--card-text-muted)]">
                    {[
                      overlayPlace.likes != null &&
                        `${overlayPlace.likes} likes`,
                      overlayPlace.saves != null &&
                        `${overlayPlace.saves} saves`,
                      overlayPlace.visits != null &&
                        `${overlayPlace.visits} visits`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
