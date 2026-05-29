"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ActivitySnapshot } from "../types";

type DailyPoint = {
  date: string;
  dateLabel: string;
  newDevices: number;
  newUsers: number;
  appOpens: number;
  blogCreatedSaved: number;
  blogShared: number;
};

const METRICS: {
  dataKey: keyof Omit<DailyPoint, "date" | "dateLabel">;
  label: string;
  color: string;
}[] = [
  { dataKey: "newDevices", label: "New device", color: "#6366f1" },
  { dataKey: "newUsers", label: "New user", color: "#8b5cf6" },
  { dataKey: "appOpens", label: "App opened", color: "#0ea5e9" },
  {
    dataKey: "blogCreatedSaved",
    label: "Blog created/saved",
    color: "#10b981",
  },
  { dataKey: "blogShared", label: "Blog shared", color: "#f59e0b" },
];

function buildDailyPoints(snapshots: ActivitySnapshot[]): DailyPoint[] {
  return [...snapshots]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => ({
      date: s.date,
      dateLabel: s.date.slice(5),
      newDevices: s.newDevices ?? 0,
      newUsers: s.newUsers ?? 0,
      appOpens: s.appOpens ?? 0,
      blogCreatedSaved: (s.blogScans ?? 0) + (s.blogSaves ?? 0),
      blogShared: (s.blogSharesPDF ?? 0) + (s.blogSharesNearby ?? 0),
    }));
}

function periodTotal(
  points: DailyPoint[],
  key: keyof Omit<DailyPoint, "date" | "dateLabel">,
): number {
  return points.reduce((acc, p) => acc + p[key], 0);
}

function fmt(n: number): string {
  return n.toLocaleString();
}

function MetricChart({
  data,
  dataKey,
  label,
  color,
  total,
}: {
  data: DailyPoint[];
  dataKey: keyof Omit<DailyPoint, "date" | "dateLabel">;
  label: string;
  color: string;
  total: number;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-sm font-medium text-gray-700">{label}</h4>
        <span className="text-lg font-semibold text-gray-900 tabular-nums">
          {fmt(total)}
        </span>
      </div>
      {data.length === 0 ? (
        <p className="text-xs text-gray-400 py-8 text-center">No data</p>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart
            data={data}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              width={36}
              allowDecimals={false}
            />
            <Tooltip
              labelFormatter={(_, payload) => {
                const row = payload?.[0]?.payload as DailyPoint | undefined;
                return row?.date ?? "";
              }}
              formatter={(value) => [
                fmt(typeof value === "number" ? value : 0),
                label,
              ]}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={data.length <= 14}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

interface Props {
  snapshots: ActivitySnapshot[];
  days: number;
}

export function DailyAppPerformanceDashboard({ snapshots, days }: Props) {
  const dailyPoints = useMemo(() => buildDailyPoints(snapshots), [snapshots]);

  if (!snapshots.length) {
    return (
      <div className="text-sm text-gray-400 py-8 text-center">
        No activity snapshots available yet. The nightly job generates data for
        the previous day.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Daily counts over the last {days} days. Blog created/saved combines scan
        + save events; blog shared combines PDF + Nearby shares.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {METRICS.map(({ dataKey, label, color }) => (
          <div
            key={dataKey}
            className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col gap-0.5"
          >
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {label}
            </span>
            <span
              className="text-xl font-semibold text-gray-900 tabular-nums"
              style={{ color }}
            >
              {fmt(periodTotal(dailyPoints, dataKey))}
            </span>
            <span className="text-[11px] text-gray-400">{days}d total</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {METRICS.map(({ dataKey, label, color }) => (
          <MetricChart
            key={dataKey}
            data={dailyPoints}
            dataKey={dataKey}
            label={label}
            color={color}
            total={periodTotal(dailyPoints, dataKey)}
          />
        ))}
      </div>

      <p className="text-[11px] text-gray-400 leading-relaxed">
        New device counts use a 30-day event lookback: a device inactive for
        longer than 30 days may be counted as new again.
      </p>
    </div>
  );
}
