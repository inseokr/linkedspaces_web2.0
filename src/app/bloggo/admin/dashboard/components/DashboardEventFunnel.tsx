"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import type {
  EventAnalytics,
  UserStreamEntry,
  PerUserEventAnalytics,
} from "../types";

// Human-readable labels for each funnel step
const FUNNEL_LABELS: Record<string, string> = {
  app_opened: "App Opened",
  trip_scan_started: "Scan Started",
  trip_scan_completed: "Scan Completed",
  blog_created: "Blog Created",
  blog_saved: "Blog Saved",
  blog_published: "Published",
  "Photo-Permission": "Photo Permission",
  "App-Open": "App Open",
};

const TREND_KEYS = ["App-Open", "Photo-Permission", "blog_created"];
const TREND_COLORS = ["#38bdf8", "#a78bfa", "#34d399"];

const SHARE_TYPE_LABELS: Record<string, string> = {
  photos: "Photos",
  polaroid: "Polaroid",
  studio: "Bloggo Studio",
  stitch_reels: "Stitch Reels",
  nearby: "Nearby / QR",
  pdf: "PDF",
  web_link: "Web link",
};

type SortKey =
  | "anonymousId"
  | "firstSeen"
  | "recentActivity"
  | "eventCount"
  | "username";
type SortDir = "asc" | "desc";

type Props = {
  data: EventAnalytics | null;
  loading: boolean;
  error: string | null;
  days: number;
  onChangeDays: (d: number) => void;
  // Per-user props
  users: UserStreamEntry[];
  usersLoading: boolean;
  selectedUser: UserStreamEntry | null;
  onSelectUser: (user: UserStreamEntry | null) => void;
  perUserData: PerUserEventAnalytics | null;
  perUserLoading: boolean;
  perUserError: string | null;
};

export function DashboardEventFunnel({
  data,
  loading,
  error,
  days,
  onChangeDays,
  users,
  usersLoading,
  selectedUser,
  onSelectUser,
  perUserData,
  perUserLoading,
  perUserError,
}: Props) {
  const [sortKey, setSortKey] = React.useState<SortKey>("recentActivity");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(
        key === "eventCount" || key === "recentActivity" || key === "firstSeen"
          ? "desc"
          : "asc",
      );
    }
  }

  const sortedUsers = React.useMemo(() => {
    return [...users].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "anonymousId") {
        cmp = a.anonymousId.localeCompare(b.anonymousId);
      } else if (sortKey === "firstSeen") {
        cmp = new Date(a.firstSeen).getTime() - new Date(b.firstSeen).getTime();
      } else if (sortKey === "recentActivity") {
        cmp =
          new Date(a.recentActivity).getTime() -
          new Date(b.recentActivity).getTime();
      } else if (sortKey === "eventCount") {
        cmp = a.eventCount - b.eventCount;
      } else if (sortKey === "username") {
        cmp = (a.username ?? "").localeCompare(b.username ?? "");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [users, sortKey, sortDir]);

  const usersEventStats = React.useMemo(() => {
    if (users.length === 0) return null;
    const counts = users.map((u) => u.eventCount);
    const sum = counts.reduce((a, b) => a + b, 0);
    return {
      min: Math.min(...counts),
      max: Math.max(...counts),
      avg: Math.round((sum / counts.length) * 10) / 10,
    };
  }, [users]);

  // Annotate funnel with drop-off %
  const funnel = (data?.funnel ?? []).map((step, i, arr) => {
    const prev = i === 0 ? step.uniqueUsers : arr[i - 1].uniqueUsers;
    const dropoffPct =
      prev > 0 ? Math.round(((prev - step.uniqueUsers) / prev) * 100) : 0;
    return {
      ...step,
      label: FUNNEL_LABELS[step.eventName] ?? step.eventName,
      dropoffPct,
    };
  });

  const topEvents = data?.topEvents ?? [];
  const identity = data?.identity ?? {
    anonymous: 0,
    authenticated: 0,
    uniqueDevices: 0,
  };
  const total = identity.anonymous + identity.authenticated;
  const anonPct =
    total > 0 ? Math.round((identity.anonymous / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-[var(--bloggo-border)] bg-[var(--bloggo-surface)] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--bloggo-text-primary)]">
            Event Stream Analytics
          </h2>
          <p className="text-sm text-[var(--bloggo-text-secondary)]">
            Real-time events collected from the iOS app
          </p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => onChangeDays(d)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                days === d
                  ? "bg-sky-500 text-white"
                  : "border border-[var(--bloggo-border)] text-[var(--bloggo-text-secondary)] hover:bg-black/5"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Loading / error states */}
      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-sky-500" />
        </div>
      )}
      {!loading && error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Identity KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Unique Devices" value={identity.uniqueDevices} />
            <StatCard
              label="Anonymous Events"
              value={`${anonPct}%`}
              sub={`${identity.anonymous.toLocaleString()} events`}
            />
            <StatCard
              label="Authenticated Events"
              value={`${100 - anonPct}%`}
              sub={`${identity.authenticated.toLocaleString()} events`}
            />
          </div>

          <BehaviorMetricsCards
            behavior={data.behavior}
            photoPermissionEventCount={
              (data.topEvents ?? []).find(
                (event) => event.eventName === "Photo-Permission",
              )?.count ?? 0
            }
          />

          {/* Funnel */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--bloggo-text-primary)]">
              Activation Funnel (unique devices)
            </h3>
            {funnel.length === 0 ? (
              <p className="text-sm text-[var(--bloggo-text-secondary)]">
                No events yet.
              </p>
            ) : (
              <div className="space-y-2">
                {funnel.map((step) => {
                  const maxUsers = funnel[0]?.uniqueUsers || 1;
                  const barPct = Math.round(
                    (step.uniqueUsers / maxUsers) * 100,
                  );
                  return (
                    <div
                      key={step.eventName}
                      className="flex items-center gap-3"
                    >
                      <span className="w-36 shrink-0 text-right text-xs text-[var(--bloggo-text-secondary)]">
                        {step.label}
                      </span>
                      <div className="relative flex-1 h-7 bg-[var(--bloggo-bg)] rounded overflow-hidden border border-[var(--bloggo-border)]">
                        <div
                          className="absolute inset-y-0 left-0 bg-sky-500/80 transition-all"
                          style={{ width: `${barPct}%` }}
                        />
                        <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-[var(--bloggo-text-primary)]">
                          {step.uniqueUsers.toLocaleString()}
                          {step.dropoffPct > 0 && (
                            <span className="ml-2 text-red-500">
                              −{step.dropoffPct}%
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daily trend line chart */}
          {data.dailyTrend.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-[var(--bloggo-text-primary)]">
                Daily Event Volume
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: string) => v.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {TREND_KEYS.map((key, i) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={FUNNEL_LABELS[key] ?? key}
                      stroke={TREND_COLORS[i]}
                      dot={false}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top events bar chart */}
          {topEvents.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-[var(--bloggo-text-primary)]">
                Top Events (total count)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={topEvents.slice(0, 12)}
                  layout="vertical"
                  margin={{ left: 10, right: 20 }}
                >
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="eventName"
                    tick={{ fontSize: 11 }}
                    width={140}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Per-User Analytics Section                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="border-t border-[var(--bloggo-border)] pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--bloggo-text-primary)]">
              Per-User Event Analytics
            </h3>
            <p className="text-xs text-[var(--bloggo-text-secondary)]">
              Select a device to drill into individual event history
            </p>
          </div>
          {selectedUser && (
            <button
              onClick={() => onSelectUser(null)}
              className="rounded-md border border-[var(--bloggo-border)] px-3 py-1.5 text-xs text-[var(--bloggo-text-secondary)] hover:bg-black/5 transition-colors"
            >
              Clear selection
            </button>
          )}
        </div>

        {/* Event count summary stats */}
        {!usersLoading && usersEventStats && (
          <div className="mb-3 flex flex-wrap gap-3">
            <MiniStat
              label="Min events"
              value={usersEventStats.min.toLocaleString()}
            />
            <MiniStat
              label="Max events"
              value={usersEventStats.max.toLocaleString()}
            />
            <MiniStat
              label="Avg events"
              value={usersEventStats.avg.toLocaleString()}
            />
          </div>
        )}

        {/* User list */}
        {usersLoading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-[var(--bloggo-text-secondary)]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-sky-500" />
            Loading users…
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-[var(--bloggo-text-secondary)]">
            No users found for this period.
          </p>
        ) : (
          <div className="rounded-lg border border-[var(--bloggo-border)] overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 border-b border-[var(--bloggo-border)]">
                  <tr>
                    <SortTh
                      col="anonymousId"
                      cur={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                      align="left"
                    >
                      Device (UUID)
                    </SortTh>
                    <SortTh
                      col="firstSeen"
                      cur={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                      align="left"
                    >
                      First Seen
                    </SortTh>
                    <SortTh
                      col="recentActivity"
                      cur={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                      align="left"
                    >
                      Last Active
                    </SortTh>
                    <SortTh
                      col="eventCount"
                      cur={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                      align="right"
                    >
                      Events
                    </SortTh>
                    <SortTh
                      col="username"
                      cur={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                      align="left"
                    >
                      Username
                    </SortTh>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200 select-none">
                      Home
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200 select-none">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((u) => {
                    const isSelected =
                      selectedUser?.anonymousId === u.anonymousId &&
                      selectedUser?.userId === u.userId;
                    const isAuth = u.userId !== null;
                    return (
                      <tr
                        key={`${u.anonymousId}::${u.userId ?? ""}`}
                        onClick={() => onSelectUser(isSelected ? null : u)}
                        className={`cursor-pointer border-b border-[var(--bloggo-border)] last:border-0 transition-colors ${
                          isSelected
                            ? "bg-sky-50 dark:bg-sky-900/20"
                            : "hover:bg-black/5"
                        }`}
                      >
                        <td className="px-3 py-2 font-mono text-[var(--bloggo-text-primary)]">
                          <span
                            title={u.anonymousId}
                            className="inline-block max-w-[160px] truncate"
                          >
                            {u.anonymousId}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[var(--bloggo-text-secondary)]">
                          {formatDate(u.firstSeen)}
                        </td>
                        <td className="px-3 py-2 text-[var(--bloggo-text-secondary)]">
                          {formatDate(u.recentActivity)}
                        </td>
                        <td className="px-3 py-2 text-right text-[var(--bloggo-text-primary)] font-medium">
                          {u.eventCount.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-[var(--bloggo-text-primary)]">
                          {u.username ? (
                            u.username
                          ) : (
                            <span className="text-[var(--bloggo-text-secondary)]">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-[var(--bloggo-text-secondary)] whitespace-nowrap">
                          {formatHomeLocation(u.homeLocation)}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              isAuth
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {isAuth ? "Auth" : "Anon"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Per-user drill-down */}
        {selectedUser && (
          <div className="mt-5 space-y-5">
            {perUserLoading && (
              <div className="flex items-center gap-2 py-4 text-sm text-[var(--bloggo-text-secondary)]">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-sky-500" />
                Loading user data…
              </div>
            )}
            {!perUserLoading && perUserError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {perUserError}
              </div>
            )}
            {!perUserLoading && !perUserError && perUserData && (
              <>
                {/* User meta */}
                <div className="rounded-lg border border-[var(--bloggo-border)] bg-[var(--bloggo-bg)] p-4 space-y-2">
                  <p className="text-xs font-medium text-[var(--bloggo-text-primary)] mb-2">
                    Device details
                  </p>
                  {perUserData.username && (
                    <MetaRow
                      label="Username"
                      value={
                        <span className="font-semibold">
                          {perUserData.username}
                        </span>
                      }
                    />
                  )}
                  {perUserData.userId && (
                    <MetaRow
                      label="User ID"
                      value={
                        <span className="font-mono break-all">
                          {perUserData.userId}
                        </span>
                      }
                    />
                  )}
                  <MetaRow
                    label="Device UUID"
                    value={
                      <span className="font-mono break-all">
                        {perUserData.anonymousId}
                      </span>
                    }
                  />
                  {!perUserData.userId && (
                    <MetaRow
                      label="Session type"
                      value={<span className="text-gray-500">Anonymous</span>}
                    />
                  )}
                  {perUserData.homeLocation &&
                    (() => {
                      const loc = formatHomeLocation(perUserData.homeLocation);
                      return loc ? (
                        <MetaRow label="Home location" value={loc} />
                      ) : null;
                    })()}
                  {perUserData.meta && (
                    <>
                      <MetaRow
                        label="First seen"
                        value={formatDatetime(perUserData.meta.firstSeen)}
                      />
                      <MetaRow
                        label="Last active"
                        value={formatDatetime(perUserData.meta.recentActivity)}
                      />
                      <MetaRow
                        label="Total events (all-time)"
                        value={perUserData.meta.totalEvents.toLocaleString()}
                      />
                      {perUserData.meta.platforms.length > 0 && (
                        <MetaRow
                          label="Platforms"
                          value={perUserData.meta.platforms.join(", ")}
                        />
                      )}
                      {perUserData.meta.appVersions.length > 0 && (
                        <MetaRow
                          label="App versions"
                          value={perUserData.meta.appVersions.join(", ")}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Event stats (min/max/avg daily) */}
                {perUserData.eventStats && (
                  <div>
                    <h4 className="mb-2 text-xs font-medium text-[var(--bloggo-text-primary)]">
                      Daily event volume stats (last {perUserData.periodDays}d)
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      <MiniStat
                        label="Min / day"
                        value={perUserData.eventStats.minDaily.toLocaleString()}
                      />
                      <MiniStat
                        label="Max / day"
                        value={perUserData.eventStats.maxDaily.toLocaleString()}
                      />
                      <MiniStat
                        label="Avg / day"
                        value={perUserData.eventStats.avgDaily.toLocaleString()}
                      />
                    </div>
                  </div>
                )}

                {/* Place & blog stats */}
                {perUserData.placeStats && (
                  <div>
                    <h4 className="mb-2 text-xs font-medium text-[var(--bloggo-text-primary)]">
                      Place &amp; blog stats
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      <MiniStat
                        label="Total places"
                        value={perUserData.placeStats.totalPlaces.toLocaleString()}
                      />
                      <MiniStat
                        label="Total blogs"
                        value={perUserData.placeStats.totalBlogs.toLocaleString()}
                      />
                      {perUserData.placeStats.avgDaysPerBlog !== null && (
                        <MiniStat
                          label="Avg days/blog"
                          value={`${perUserData.placeStats.avgDaysPerBlog}d`}
                        />
                      )}
                      {perUserData.placeStats.minDaysPerBlog !== null && (
                        <MiniStat
                          label="Min days/blog"
                          value={`${perUserData.placeStats.minDaysPerBlog}d`}
                        />
                      )}
                      {perUserData.placeStats.maxDaysPerBlog !== null && (
                        <MiniStat
                          label="Max days/blog"
                          value={`${perUserData.placeStats.maxDaysPerBlog}d`}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Per-user funnel */}
                {perUserData.funnel.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-xs font-medium text-[var(--bloggo-text-primary)]">
                      Funnel events (last {perUserData.periodDays}d)
                    </h4>
                    <div className="space-y-2">
                      {perUserData.funnel.map((step) => {
                        const max =
                          Math.max(...perUserData.funnel.map((s) => s.count)) ||
                          1;
                        return (
                          <div
                            key={step.eventName}
                            className="flex items-center gap-3"
                          >
                            <span className="w-36 shrink-0 text-right text-xs text-[var(--bloggo-text-secondary)]">
                              {FUNNEL_LABELS[step.eventName] ?? step.eventName}
                            </span>
                            <div className="relative flex-1 h-6 bg-[var(--bloggo-bg)] rounded overflow-hidden border border-[var(--bloggo-border)]">
                              <div
                                className="absolute inset-y-0 left-0 bg-indigo-400/70 transition-all"
                                style={{
                                  width: `${Math.round((step.count / max) * 100)}%`,
                                }}
                              />
                              <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-[var(--bloggo-text-primary)]">
                                {step.count.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Per-user daily trend */}
                {perUserData.dailyTrend.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-xs font-medium text-[var(--bloggo-text-primary)]">
                      Daily event volume
                    </h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={perUserData.dailyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10 }}
                          tickFormatter={(v: string) => v.slice(5)}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        {TREND_KEYS.map((key, i) => (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            name={FUNNEL_LABELS[key] ?? key}
                            stroke={TREND_COLORS[i]}
                            dot={false}
                            strokeWidth={2}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Per-user top events */}
                {perUserData.topEvents.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-xs font-medium text-[var(--bloggo-text-primary)]">
                      Top events
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={perUserData.topEvents.slice(0, 12)}
                        layout="vertical"
                        margin={{ left: 10, right: 20 }}
                      >
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis
                          type="category"
                          dataKey="eventName"
                          tick={{ fontSize: 10 }}
                          width={140}
                        />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="#818cf8"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small helper components
// ---------------------------------------------------------------------------
function BehaviorMetricsCards({
  behavior,
  photoPermissionEventCount,
}: {
  behavior: EventAnalytics["behavior"];
  photoPermissionEventCount: number;
}) {
  const photoAccess = behavior?.photoAccess ?? {
    full: 0,
    limited: 0,
    none: 0,
  };
  const cleanup = behavior?.cleanup ?? {
    createdBlogs: 0,
    savedBlogs: 0,
    openedBlogs: 0,
    deletedBlogs: 0,
    cleanedBlogs: 0,
    openedPct: 0,
    deletedPct: 0,
    cleanedPct: 0,
    cleanedOfOpenedPct: 0,
    trackingStartedAt: null,
  };
  const savedBlogs = cleanup.savedBlogs || cleanup.createdBlogs;
  const cleanedBlogs = cleanup.cleanedBlogs ?? cleanup.deletedBlogs;
  const cleanedPct = cleanup.cleanedPct ?? cleanup.deletedPct;
  const share = behavior?.share ?? {
    createdBlogs: 0,
    savedBlogs: 0,
    sharedBlogs: 0,
    sharedPct: 0,
    trackingStartedAt: null,
    byType: [],
  };
  const shareSavedBlogs = share.savedBlogs || share.createdBlogs;
  const photoTotal = photoAccess.full + photoAccess.limited + photoAccess.none;
  const photoPct = (n: number) =>
    photoTotal > 0 ? `${Math.round((n / photoTotal) * 100)}%` : "—";
  const maxShareEvents = Math.max(1, ...share.byType.map((row) => row.events));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-1 text-sm font-medium text-[var(--bloggo-text-primary)]">
          Photo permit type
        </h3>
        <p className="mb-3 text-xs text-[var(--bloggo-text-secondary)]">
          Latest <code>Photo-Permission.status</code> or{" "}
          <code>App-Open.photoAccess</code> per device.{" "}
          {photoPermissionEventCount.toLocaleString()} Photo-Permission event
          {photoPermissionEventCount === 1 ? "" : "s"} in this period.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Full"
            value={photoAccess.full}
            sub={photoPct(photoAccess.full)}
          />
          <StatCard
            label="Limited"
            value={photoAccess.limited}
            sub={photoPct(photoAccess.limited)}
          />
          <StatCard
            label="None"
            value={photoAccess.none}
            sub={photoPct(photoAccess.none)}
          />
        </div>
        {photoTotal === 0 && photoPermissionEventCount > 0 && (
          <p className="mt-2 text-xs text-amber-700">
            Photo-Permission events are in Top events, but the Full / Limited /
            None split is still 0. Redeploy Pocketverse so{" "}
            <code>GET /activity/stream</code> reads{" "}
            <code>properties.status</code> on Photo-Permission.
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--bloggo-text-primary)]">
          Smart Cleanup on saved recap blogs
        </h3>
        <p className="mb-3 text-xs text-[var(--bloggo-text-secondary)]">
          Count of blogs that opened cleanup and deleted at least once, among
          blogs created after tracking started
          {cleanup.trackingStartedAt
            ? ` (${new Date(cleanup.trackingStartedAt).toLocaleDateString()})`
            : ""}
          . Treat the count as the main signal until this event has more
          history.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Created + saved since tracking" value={savedBlogs} />
          <StatCard
            label="Opened cleanup"
            value={cleanup.openedBlogs}
            sub={`${cleanup.openedPct}% of those blogs`}
          />
          <StatCard
            label="Cleaned at least once"
            value={cleanedBlogs}
            sub={`${cleanedPct}% of those blogs`}
          />
          <StatCard
            label="Cleaned / opened"
            value={`${cleanup.cleanedOfOpenedPct ?? 0}%`}
            sub="of blogs that opened cleanup"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--bloggo-text-primary)]">
          Share on saved recap blogs
        </h3>
        <p className="mb-3 text-xs text-[var(--bloggo-text-secondary)]">
          Count of blogs that completed a share at least once, among blogs
          created after tracking started
          {share.trackingStartedAt
            ? ` (${new Date(share.trackingStartedAt).toLocaleDateString()})`
            : ""}
          . Treat the count as the main signal until this event has more
          history.
        </p>
        <div className="grid grid-cols-3 gap-4 mb-3">
          <StatCard
            label="Created + saved since tracking"
            value={shareSavedBlogs}
          />
          <StatCard
            label="Shared at least once"
            value={share.sharedBlogs}
            sub={`${share.sharedPct}% of those blogs`}
          />
          <StatCard
            label="Share events"
            value={share.byType.reduce((sum, row) => sum + row.events, 0)}
          />
        </div>
        {share.byType.length === 0 ? (
          <p className="text-sm text-[var(--bloggo-text-secondary)]">
            No completed shares in this period.
          </p>
        ) : (
          <div className="space-y-2">
            {share.byType.map((row) => {
              const barPct = Math.round((row.events / maxShareEvents) * 100);
              return (
                <div key={row.type}>
                  <div className="mb-1 flex justify-between text-xs text-[var(--bloggo-text-secondary)]">
                    <span>{SHARE_TYPE_LABELS[row.type] ?? row.type}</span>
                    <span>
                      {row.events.toLocaleString()} events ·{" "}
                      {row.uniqueBlogs.toLocaleString()} blogs
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

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
    <div className="rounded-lg border border-[var(--bloggo-border)] bg-[var(--bloggo-bg)] p-4">
      <p className="text-xs text-[var(--bloggo-text-secondary)]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[var(--bloggo-text-primary)]">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {sub && (
        <p className="mt-0.5 text-xs text-[var(--bloggo-text-secondary)]">
          {sub}
        </p>
      )}
    </div>
  );
}

function SortTh({
  col,
  cur,
  dir,
  onSort,
  align,
  children,
}: {
  col: SortKey;
  cur: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  align: "left" | "right";
  children: React.ReactNode;
}) {
  const active = cur === col;
  return (
    <th
      onClick={() => onSort(col)}
      className={`px-3 py-2 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer select-none whitespace-nowrap ${
        align === "right" ? "text-right" : "text-left"
      } hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors`}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <span
          className={`text-[10px] ${active ? "text-sky-500" : "text-slate-400"}`}
        >
          {active ? (dir === "asc" ? "▲" : "▼") : "⇅"}
        </span>
      </span>
    </th>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="w-36 shrink-0 text-[var(--bloggo-text-secondary)]">
        {label}
      </span>
      <span className="text-[var(--bloggo-text-primary)] break-all">
        {value}
      </span>
    </div>
  );
}

function formatHomeLocation(
  loc:
    | { city?: string | null; state?: string | null; country?: string | null }
    | undefined,
): string {
  if (!loc) return "";
  const parts = [loc.city, loc.state, loc.country].filter(Boolean);
  return parts.join(", ");
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-[var(--bloggo-border)] bg-[var(--bloggo-bg)] px-3 py-2 text-center min-w-[80px]">
      <p className="text-[10px] text-[var(--bloggo-text-secondary)]">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-[var(--bloggo-text-primary)]">
        {value}
      </p>
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatDatetime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
