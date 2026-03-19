"use client";

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
import type { EventAnalytics } from "../types";

// Human-readable labels for each funnel step
const FUNNEL_LABELS: Record<string, string> = {
  app_opened: "App Opened",
  trip_scan_started: "Scan Started",
  trip_scan_completed: "Scan Completed",
  trip_selected: "Trip Selected",
  blog_created: "Blog Created",
  blog_saved: "Blog Saved",
  blog_published: "Published",
};

// Events to show on the trend chart (keep it readable)
const TREND_KEYS = [
  "app_opened",
  "trip_selected",
  "blog_created",
  "blog_published",
];
const TREND_COLORS = ["#38bdf8", "#818cf8", "#34d399", "#fb923c"];

type Props = {
  data: EventAnalytics | null;
  loading: boolean;
  error: string | null;
  days: number;
  onChangeDays: (d: number) => void;
};

export function DashboardEventFunnel({
  data,
  loading,
  error,
  days,
  onChangeDays,
}: Props) {
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small helper component
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
