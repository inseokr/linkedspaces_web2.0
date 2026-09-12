"use client";

import type { ActivitySnapshot, EventAnalytics } from "../types";

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
  /** Event counts that can exceed saves (e.g. multiple renames per blog). */
  ratePerUnit,
}: {
  label: string;
  part: number;
  total: number;
  partLabel?: string;
  ratePerUnit?: string;
}) {
  const ratio = total > 0 ? part / total : 0;
  const metricLabel = ratePerUnit
    ? total > 0
      ? `${ratio.toFixed(2)}×`
      : "—"
    : pct(part, total);
  const barPct = Math.min(ratio * 100, 100);
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700 flex-1">{label}</span>
      <span className="text-sm font-medium w-12 text-right">{fmt(part)}</span>
      <div className="w-24 bg-gray-100 rounded-full h-1.5">
        <div
          className="bg-blue-500 h-1.5 rounded-full"
          style={{ width: `${barPct}%` }}
        />
      </div>
      <span
        className="text-sm text-gray-500 text-right"
        title={ratePerUnit ? `per ${ratePerUnit}` : undefined}
      >
        <span className="inline-block w-12">{metricLabel}</span>
        {ratePerUnit && total > 0 && (
          <span className="inline-block w-14 text-[11px] text-gray-400">
            / {ratePerUnit}
          </span>
        )}
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
  behavior?: EventAnalytics["behavior"];
  behaviorDays?: number;
}

export function ActivityMetricsDashboard({ snapshots, days, behavior }: Props) {
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
  const totalSharesPhotos = sum(snapshots, "blogSharesPhotos");
  const totalSharesPolaroid = sum(snapshots, "blogSharesPolaroid");
  const totalSharesStudio = sum(snapshots, "blogSharesStudio");
  const totalSharesStitch = sum(snapshots, "blogSharesStitchReels");
  const totalSharesWebLink = sum(snapshots, "blogSharesWebLink");
  const totalSharesTyped = sum(snapshots, "blogShares");
  const totalShares =
    totalSharesTyped ||
    totalSharesPDF +
      totalSharesNearby +
      totalSharesPhotos +
      totalSharesPolaroid +
      totalSharesStudio +
      totalSharesStitch +
      totalSharesWebLink;
  const totalPhotoFull = sum(snapshots, "photoAccessFull");
  const totalPhotoLimited = sum(snapshots, "photoAccessLimited");
  const totalPhotoNone = sum(snapshots, "photoAccessNone");
  const totalSlideshows = sum(snapshots, "blogSlideshowPlays");
  const totalSplits = sum(snapshots, "blogSplits");
  const totalMerges = sum(snapshots, "blogMerges");

  const savedBlogs =
    behavior?.cleanup?.savedBlogs || behavior?.cleanup?.createdBlogs || 0;
  const openedCleanupBlogs = behavior?.cleanup?.openedBlogs ?? 0;
  const cleanedBlogs =
    behavior?.cleanup?.cleanedBlogs ?? behavior?.cleanup?.deletedBlogs ?? 0;
  const sharedBlogs = behavior?.share?.sharedBlogs ?? 0;
  const shareSavedBlogs =
    behavior?.share?.savedBlogs || behavior?.share?.createdBlogs || savedBlogs;

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
  const totalVibePhotos = sum(snapshots, "inAppVibePhotosTaken");
  const totalReels = sum(snapshots, "inAppReelsSaved");
  const totalReelsAuto = sum(snapshots, "inAppReelsSavedAuto");
  const totalReelsManual = sum(snapshots, "inAppReelsSavedManual");
  const totalReelsDur5 = sum(snapshots, "inAppReelsSavedDur5");
  const totalReelsDur10 = sum(snapshots, "inAppReelsSavedDur10");
  const totalReelsDur15 = sum(snapshots, "inAppReelsSavedDur15");
  const totalReelsDur30 = sum(snapshots, "inAppReelsSavedDur30");
  const totalCaptures = totalInAppPhotos + totalVibePhotos + totalReels;
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
      <SectionHeader title="Share (unique blogs)" />
      <p className="mb-2 text-xs text-gray-500">
        Count first, % second. Only blogs created after completed-share tracking
        started
        {behavior?.share?.trackingStartedAt
          ? ` (${new Date(behavior.share.trackingStartedAt).toLocaleDateString()})`
          : ""}
        . Older saved blogs are left out so the % is not pulled down.
      </p>
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 px-4 mb-4">
        <RatioRow
          label="Shared at least once"
          part={sharedBlogs}
          total={shareSavedBlogs}
          partLabel="blogs"
        />
      </div>

      <SectionHeader title="Blog Lifecycle" />
      <p className="mb-2 text-xs text-gray-500">
        Rows below are tap counts vs save counts, not unique blogs.
      </p>
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 px-4">
        <RatioRow label="Scan → Save" part={totalSaves} total={totalScans} />
        <RatioRow
          label="Save → Delete"
          part={totalDeletes}
          total={totalSaves}
        />
        <RatioRow
          label="Share events / saves"
          part={totalShares}
          total={totalSaves}
        />
        <RatioRow
          label="  ↳ Photos"
          part={totalSharesPhotos}
          total={totalShares}
        />
        <RatioRow
          label="  ↳ Polaroid"
          part={totalSharesPolaroid}
          total={totalShares}
        />
        <RatioRow
          label="  ↳ Studio"
          part={totalSharesStudio}
          total={totalShares}
        />
        <RatioRow
          label="  ↳ Stitch Reels"
          part={totalSharesStitch}
          total={totalShares}
        />
        <RatioRow
          label="  ↳ Nearby / QR"
          part={totalSharesNearby}
          total={totalShares}
        />
        <RatioRow label="  ↳ PDF" part={totalSharesPDF} total={totalShares} />
        <RatioRow
          label="  ↳ Web link"
          part={totalSharesWebLink}
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

      <SectionHeader title="Photo permit type (daily volume)" />
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 px-4">
        <RatioRow
          label="Photo-Permission events"
          part={sum(snapshots, "photoPermissions")}
          total={totalAppOpens}
        />
        <RatioRow
          label="Full"
          part={totalPhotoFull}
          total={totalPhotoFull + totalPhotoLimited + totalPhotoNone}
        />
        <RatioRow
          label="Limited"
          part={totalPhotoLimited}
          total={totalPhotoFull + totalPhotoLimited + totalPhotoNone}
        />
        <RatioRow
          label="None"
          part={totalPhotoNone}
          total={totalPhotoFull + totalPhotoLimited + totalPhotoNone}
        />
      </div>

      <SectionHeader title="Smart Cleanup" />
      <p className="mb-2 text-xs text-gray-500">
        Count first, % second. Only blogs created after Smart Cleanup tracking
        started
        {behavior?.cleanup?.trackingStartedAt
          ? ` (${new Date(behavior.cleanup.trackingStartedAt).toLocaleDateString()})`
          : ""}
        . Older saved blogs are left out so the % is not pulled down.
      </p>
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 px-4">
        <RatioRow
          label="Opened cleanup"
          part={openedCleanupBlogs}
          total={savedBlogs}
          partLabel="blogs"
        />
        <RatioRow
          label="Cleaned at least once"
          part={cleanedBlogs}
          total={savedBlogs}
          partLabel="blogs"
        />
      </div>

      {/* ── Place actions ────────────────────────────────── */}
      <SectionHeader title="Place Actions" />
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 px-4">
        <RatioRow
          label="Rename (total)"
          part={totalPlaceRenames}
          total={totalSaves}
          ratePerUnit="save"
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
          label="Plain photo"
          part={totalInAppPhotos}
          total={totalCaptures}
        />
        <RatioRow
          label="Vibe photo"
          part={totalVibePhotos}
          total={totalCaptures}
        />
        <RatioRow label="Reel saved" part={totalReels} total={totalCaptures} />
        <RatioRow
          label="Caption added"
          part={totalCaption}
          total={totalCaptures}
        />
        <RatioRow
          label="  ↳ Reel auto stop"
          part={totalReelsAuto}
          total={totalReels}
        />
        <RatioRow
          label="  ↳ Reel manual stop"
          part={totalReelsManual}
          total={totalReels}
        />
        <RatioRow
          label="  ↳ Reel 5s"
          part={totalReelsDur5}
          total={totalReels}
        />
        <RatioRow
          label="  ↳ Reel 10s"
          part={totalReelsDur10}
          total={totalReels}
        />
        <RatioRow
          label="  ↳ Reel 15s"
          part={totalReelsDur15}
          total={totalReels}
        />
        <RatioRow
          label="  ↳ Reel 30s"
          part={totalReelsDur30}
          total={totalReels}
        />
      </div>
    </div>
  );
}
