"use client";

import type { PerUserMetrics, TopUserRow } from "../types";

type Props = {
  topActiveUsers: TopUserRow[];
  selectedUsername: string | null;
  onSelectUsername: (username: string | null) => void;
  perUserDetail: PerUserMetrics | null;
  perUserLoading: boolean;
  onExport?: (username: string) => void;
};

export default function DashboardPerUser({
  topActiveUsers,
  selectedUsername,
  onSelectUsername,
  perUserDetail,
  perUserLoading,
  onExport,
}: Props) {
  const firstUsername = topActiveUsers[0]?.username ?? null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Per-User Detailed Metrics
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Drill-down by user (from Top Active Users)
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <label className="text-sm font-medium text-gray-600">
          Select user:
        </label>
        <select
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={selectedUsername ?? ""}
          onChange={(e) => onSelectUsername(e.target.value || null)}
        >
          <option value="">—</option>
          {topActiveUsers.map((u) => (
            <option key={u.userId || u.username} value={u.username}>
              {u.username}
            </option>
          ))}
        </select>
        {selectedUsername && (
          <button
            type="button"
            onClick={() => onExport?.(selectedUsername)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Export CSV
          </button>
        )}
      </div>

      {perUserLoading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          Loading user details…
        </div>
      ) : perUserDetail ? (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Places" value={perUserDetail.placesCount} />
            <MetricCard label="Blogs" value={perUserDetail.blogsCount} />
            <MetricCard
              label="Avg places/day"
              value={perUserDetail.avgPlacesPerDay.toFixed(1)}
            />
            <MetricCard label="Friends" value={perUserDetail.friendsCount} />
            <MetricCard label="Comments" value={perUserDetail.commentsCount} />
            <MetricCard
              label="% photos with story"
              value={`${perUserDetail.pctPhotosWithStory}%`}
            />
            <MetricCard
              label="% audio captions"
              value={`${perUserDetail.pctAudioCaptions}%`}
            />
            <MetricCard
              label="Avg story length"
              value={`${perUserDetail.avgStoryLength} chars`}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700">
              Photos per place (min / avg / max)
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {perUserDetail.photosPerPlace.min} /{" "}
              {perUserDetail.photosPerPlace.avg} /{" "}
              {perUserDetail.photosPerPlace.max}
            </p>
          </div>

          {(perUserDetail.poiAccuracy.top3 > 0 ||
            perUserDetail.poiAccuracy.top10 > 0 ||
            perUserDetail.poiAccuracy.top40 > 0) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">
                POI accuracy
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Top3: {perUserDetail.poiAccuracy.top3}% · Top10:{" "}
                {perUserDetail.poiAccuracy.top10}% · Top40:{" "}
                {perUserDetail.poiAccuracy.top40}%
                {perUserDetail.poiAccuracy.googleAutocomplete > 0 &&
                  ` · Google AC: ${perUserDetail.poiAccuracy.googleAutocomplete}%`}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-700">Photo stats</h3>
            <p className="mt-1 text-sm text-gray-600">
              Total photos: {perUserDetail.photoStats.totalPhotos} · Avg per
              place: {perUserDetail.photoStats.avgPhotosPerPlace}
              {perUserDetail.photoStats.avgImageSizeKb > 0 &&
                ` · Avg size: ${perUserDetail.photoStats.avgImageSizeKb} KB`}
            </p>
          </div>

          {perUserDetail.placesByCountry.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">
                Places by country
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                {perUserDetail.placesByCountry.map((c) => (
                  <li key={c.country}>
                    <strong>{c.country}</strong>
                    {c.count != null && `: ${c.count} places`}
                    {c.cities.length > 0 &&
                      ` — ${c.cities.map((x) => `${x.city} (${x.count})`).join(", ")}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {perUserDetail.categoryBreakdown.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">
                Category breakdown
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                {perUserDetail.categoryBreakdown.map((c) => (
                  <li key={c.category}>
                    {c.category}: {c.count} ({c.pct}%)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-500">
          {selectedUsername
            ? "No details available for this user."
            : "Select a user to view details."}
        </p>
      )}
    </section>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}
