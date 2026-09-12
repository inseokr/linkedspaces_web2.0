"use client";

import React from "react";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";
import type { TripHighlights } from "@/api/trips";
import type { RecapDay } from "@/views/Profile/Trip/component/RecapBlogPlace";

function formatSteps(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

function findEntryId(
  days: RecapDay[],
  placeKey?: string,
  placeName?: string,
): string | null {
  const entries = days.flatMap((d) => d.entries);
  if (placeKey) {
    const byKey = entries.find((e) => e.placeKey === placeKey);
    if (byKey) return byKey.id;
  }
  const name = placeName?.trim().toLowerCase();
  if (!name) return null;
  return (
    entries.find((e) => e.placeName.trim().toLowerCase() === name)?.id ?? null
  );
}

export function hasTripHighlights(highlights?: TripHighlights | null) {
  if (!highlights) return false;
  const summary = highlights.summary;
  const hasSummary = Boolean(
    (summary?.travelSpanMeters && summary.travelSpanMeters > 0) ||
    summary?.travelSpanLabel ||
    summary?.longestStay?.placeName ||
    (summary?.steps && summary.steps.totalSteps > 0),
  );
  const hasPlaces = (highlights.topPlaces?.length ?? 0) > 0;
  return hasSummary || hasPlaces;
}

export default function RecapTripHighlights({
  highlights,
  days,
  onOpenPlace,
}: {
  highlights?: TripHighlights | null;
  days: RecapDay[];
  onOpenPlace?: (entryId: string) => void;
}) {
  if (!hasTripHighlights(highlights) || !highlights) return null;

  const stats = highlights.stats;
  const summary = highlights.summary;
  const topPlaces = highlights.topPlaces ?? [];

  const chips: { label: string; value: string; detail?: string }[] = [];
  if (summary?.travelSpanLabel || (summary?.travelSpanMeters ?? 0) > 0) {
    chips.push({
      label: "Travel Span",
      value: summary?.travelSpanLabel || "Route",
      detail: "Distance across saved places",
    });
  }
  if (summary?.longestStay?.placeName) {
    chips.push({
      label: "Longest Stay",
      value: summary.longestStay.durationLabel || summary.longestStay.placeName,
      detail: summary.longestStay.placeName,
    });
  }
  if (summary?.steps && summary.steps.totalSteps > 0) {
    chips.push({
      label: "On Foot",
      value: `${formatSteps(summary.steps.totalSteps)} steps`,
      detail:
        summary.steps.flightsClimbed > 0
          ? `${summary.steps.flightsClimbed} floors climbed`
          : "Walking from Health",
    });
  }

  return (
    <section className="rounded-[24px] border border-black/8 bg-white px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/40">
            Trip highlights
          </div>
          <h2 className="mt-1 text-[22px] font-extrabold tracking-tight text-black">
            At a glance
          </h2>
        </div>
        {stats && (stats.dayCount > 0 || stats.placeCount > 0) && (
          <p className="text-[13px] font-medium text-black/50">
            {[
              stats.dayCount > 0
                ? `${stats.dayCount} day${stats.dayCount === 1 ? "" : "s"}`
                : null,
              stats.placeCount > 0
                ? `${stats.placeCount} place${stats.placeCount === 1 ? "" : "s"}`
                : null,
              stats.photoCount > 0
                ? `${stats.photoCount} photo${stats.photoCount === 1 ? "" : "s"}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>

      {chips.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {chips.map((chip) => (
            <div
              key={chip.label}
              className="rounded-2xl border border-black/6 bg-[#F5F5F7] px-4 py-3"
            >
              <div className="text-[11px] font-semibold uppercase tracking-wide text-black/40">
                {chip.label}
              </div>
              <div className="mt-1 text-[16px] font-bold tracking-tight text-black">
                {chip.value}
              </div>
              {chip.detail && (
                <div className="mt-0.5 text-[12px] text-black/50">
                  {chip.detail}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {topPlaces.length > 0 && (
        <div className="mt-5">
          <div className="text-[13px] font-semibold text-black/70">
            Top places
          </div>
          <div className="-mx-1 mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {topPlaces.map((place) => {
              const photo = place.photoUri
                ? normalizeImageSrc(place.photoUri).src
                : null;
              const entryId = findEntryId(
                days,
                place.placeKey,
                place.placeName,
              );
              const clickable = Boolean(entryId && onOpenPlace);
              return (
                <button
                  key={`${place.rank}-${place.placeName}`}
                  type="button"
                  disabled={!clickable}
                  onClick={() => {
                    if (entryId && onOpenPlace) onOpenPlace(entryId);
                  }}
                  className="w-[168px] shrink-0 text-left disabled:cursor-default"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black/5">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo}
                        alt={place.placeName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-xs text-black/30">
                        No photo
                      </div>
                    )}
                    <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-bold text-white">
                      #{place.rank}
                    </div>
                  </div>
                  <div className="mt-2 line-clamp-2 text-[14px] font-semibold leading-snug text-black">
                    {place.placeName}
                  </div>
                  {place.locationLine && (
                    <div className="mt-0.5 line-clamp-1 text-[12px] text-black/45">
                      {place.locationLine}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
