"use client";

import type { ActivitySnapshot } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sum(
  snapshots: ActivitySnapshot[],
  key: keyof ActivitySnapshot,
): number {
  return snapshots.reduce((acc, s) => acc + ((s[key] as number) ?? 0), 0);
}

function avg(
  snapshots: ActivitySnapshot[],
  key: keyof ActivitySnapshot,
): number {
  if (!snapshots.length) return 0;
  return sum(snapshots, key) / snapshots.length;
}

function pct(part: number, total: number): string {
  if (!total) return "—";
  return `${((part / total) * 100).toFixed(1)}%`;
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-1">
      <span className="text-xs text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-2xl font-semibold text-gray-900">
        {fmt(Number(value))}
      </span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mt-6 mb-3">
      {title}
    </h3>
  );
}

function RatioRow({
  label,
  part,
  total,
  partLabel,
}: {
  label: string;
  part: number;
  total: number;
  partLabel?: string;
}) {
  const ratio = total > 0 ? part / total : 0;
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700 flex-1">{label}</span>
      <span className="text-sm font-medium w-12 text-right">{fmt(part)}</span>
      <div className="w-24 bg-gray-100 rounded-full h-1.5">
        <div
          className="bg-blue-500 h-1.5 rounded-full"
          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
        />
      </div>
      <span className="text-sm text-gray-500 w-12 text-right">
        {pct(part, total)}
      </span>
      {partLabel && (
        <span className="text-xs text-gray-400 w-20 text-right">
          {partLabel}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props {
  snapshots: ActivitySnapshot[];
  days: number;
}

export function ActivityMetricsDashboard({ snapshots, days }: Props) {
  if (!snapshots.length) {
    return (
      <div className="text-sm text-gray-400 py-8 text-center">
        No activity snapshots available yet. The nightly job generates data for
        the previous day.
      </div>
    );
  }

  const totalScans = sum(snapshots, "blogScans");
  const totalSaves = sum(snapshots, "blogSaves");
  const totalDeletes = sum(snapshots, "blogDeletes");
  const totalSharesPDF = sum(snapshots, "blogSharesPDF");
  const totalSharesNearby = sum(snapshots, "blogSharesNearby");
  const totalShares = totalSharesPDF + totalSharesNearby;
  const totalSlideshows = sum(snapshots, "blogSlideshowPlays");
  const totalSplits = sum(snapshots, "blogSplits");
  const totalMerges = sum(snapshots, "blogMerges");

  const totalPlaceRenames = sum(snapshots, "placeRenames");
  const totalRenamesPoi = sum(snapshots, "placeRenamesPoi");
  const totalRenamesCustom = sum(snapshots, "placeRenamesCustom");
  const totalRenamesAuto = sum(snapshots, "placeRenamesAutoComplete");
  const totalManagePhoto = sum(snapshots, "placeManagePhoto");

  const totalPlaceStories = sum(snapshots, "placeStories");
  const totalPhotoStories = sum(snapshots, "photoStories");
  const totalDayStories = sum(snapshots, "dayStories");
  const totalBlogStories = sum(snapshots, "blogStories");
  const totalAiStories = sum(snapshots, "aiStories");
  const totalSentiments = sum(snapshots, "sentimentAdjustments");
  const totalAllStories =
    totalPlaceStories + totalPhotoStories + totalDayStories + totalBlogStories;

  const totalMMClicks = sum(snapshots, "moreMemoriesClicks");
  const totalMMBlogs = sum(snapshots, "moreMemoriesBlogs");

  const totalInAppOpens = sum(snapshots, "inAppCameraOpens");
  const totalInAppPhotos = sum(snapshots, "inAppPhotosTaken");
  const totalVibeOn = sum(snapshots, "inAppPhotosVibeOn");
  const totalCaption = sum(snapshots, "inAppPhotosCaption");

  const totalAppOpens = sum(snapshots, "appOpens");
  const totalUniqueUsers = Math.round(avg(snapshots, "uniqueUsers"));
  const totalDevices = Math.round(avg(snapshots, "uniqueDevices"));

  return (
    <div className="space-y-2">
      {/* ── Summary ─────────────────────────────────────── */}
      <SectionHeader title={`Activity Summary — Last ${days} Days`} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="App Opens" value={totalAppOpens} />
        <StatCard label="Avg Daily Users" value={totalUniqueUsers} />
        <StatCard label="Avg Daily Devices" value={totalDevices} />
        <StatCard label="Blog Saves" value={totalSaves} />
      </div>

      {/* ── Blog lifecycle ───────────────────────────────── */}
      <SectionHeader title="Blog Lifecycle" />
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 px-4">
        <RatioRow label="Scan → Save" part={totalSaves} total={totalScans} />
        <RatioRow
          label="Save → Delete"
          part={totalDeletes}
          total={totalSaves}
        />
        <RatioRow
          label="Save → Share (any)"
          part={totalShares}
          total={totalSaves}
        />
        <RatioRow
          label="  ↳ PDF share"
          part={totalSharesPDF}
          total={totalShares}
        />
        <RatioRow
          label="  ↳ Nearby share"
          part={totalSharesNearby}
          total={totalShares}
        />
        <RatioRow
          label="Save → Slideshow"
          part={totalSlideshows}
          total={totalSaves}
        />
        <RatioRow label="Split events" part={totalSplits} total={totalSaves} />
        <RatioRow label="Merge events" part={totalMerges} total={totalSaves} />
      </div>

      {/* ── Place actions ────────────────────────────────── */}
      <SectionHeader title="Place Actions" />
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 px-4">
        <RatioRow
          label="Rename (total)"
          part={totalPlaceRenames}
          total={totalSaves}
        />
        <RatioRow
          label="  ↳ POI click"
          part={totalRenamesPoi}
          total={totalPlaceRenames}
        />
        <RatioRow
          label="  ↳ Custom name"
          part={totalRenamesCustom}
          total={totalPlaceRenames}
        />
        <RatioRow
          label="  ↳ AutoComplete"
          part={totalRenamesAuto}
          total={totalPlaceRenames}
        />
        <RatioRow
          label="Manage Photo (unique place)"
          part={totalManagePhoto}
          total={totalSaves}
        />
      </div>

      {/* ── Stories ─────────────────────────────────────── */}
      <SectionHeader title="Stories" />
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 px-4">
        <RatioRow
          label="Blog-level story"
          part={totalBlogStories}
          total={totalSaves}
        />
        <RatioRow
          label="Day-level story"
          part={totalDayStories}
          total={totalSaves}
        />
        <RatioRow
          label="Place-level story"
          part={totalPlaceStories}
          total={totalSaves}
        />
        <RatioRow
          label="Photo-level story"
          part={totalPhotoStories}
          total={totalSaves}
        />
        <RatioRow
          label="AI story (of all stories)"
          part={totalAiStories}
          total={totalAllStories}
        />
        <RatioRow
          label="Sentiment adjustment"
          part={totalSentiments}
          total={totalAllStories}
          partLabel="of stories"
        />
      </div>

      {/* ── MoreMemories ────────────────────────────────── */}
      <SectionHeader title="MoreMemories" />
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 px-4">
        <RatioRow
          label="MoreMemories clicked"
          part={totalMMClicks}
          total={totalSaves}
        />
        <RatioRow
          label="Blog created via MoreMemories"
          part={totalMMBlogs}
          total={totalSaves}
        />
      </div>

      {/* ── In-app camera ───────────────────────────────── */}
      <SectionHeader title="In-App Camera" />
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 px-4">
        <RatioRow
          label="Camera opened"
          part={totalInAppOpens}
          total={totalAppOpens}
        />
        <RatioRow
          label="Photos taken"
          part={totalInAppPhotos}
          total={totalInAppOpens}
        />
        <RatioRow
          label="  ↳ Vibe ON"
          part={totalVibeOn}
          total={totalInAppPhotos}
        />
        <RatioRow
          label="  ↳ Caption added"
          part={totalCaption}
          total={totalInAppPhotos}
        />
      </div>
    </div>
  );
}
