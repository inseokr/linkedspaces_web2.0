"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { OverviewMetrics } from "../types";

type Props = { data: OverviewMetrics };

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function DashboardOverview({ data }: Props) {
  const {
    dau,
    wau,
    mau,
    activeUsersCurrentPeriod,
    newSignupsCurrent,
    newSignupsPrevious,
    userGrowthRatePercent,
    retentionRatePercent,
    stickinessRatio,
    churnRatePercent,
    trendDaily,
  } = data;

  const cards = [
    { label: "DAU", value: dau, sub: "Daily Active Users" },
    { label: "WAU", value: wau, sub: "Weekly Active Users" },
    { label: "MAU", value: mau, sub: "Monthly Active Users" },
    {
      label: "Active (current period)",
      value: activeUsersCurrentPeriod,
      sub: "WAU",
    },
    {
      label: "New sign-ups",
      value: newSignupsCurrent,
      sub: `vs ${newSignupsPrevious} previous`,
    },
    {
      label: "User growth rate",
      value: `${userGrowthRatePercent.toFixed(1)}%`,
      sub: "Present vs past period",
    },
    {
      label: "Retention rate",
      value: `${retentionRatePercent}%`,
      sub: "(CE − CN) / CS × 100",
    },
    {
      label: "Stickiness (DAU/MAU)",
      value: stickinessRatio.toFixed(2),
      sub: "Higher = more engagement",
    },
    { label: "Churn rate", value: `${churnRatePercent}%`, sub: "Monthly" },
  ];

  const chartData = trendDaily.slice(-90).map((d) => ({
    ...d,
    dateShort: d.date.slice(5),
  }));

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
      <p className="mt-1 text-sm text-gray-500">Core user and growth metrics</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-gray-100 bg-gray-50/80 p-3"
          >
            <div className="text-xs font-medium text-gray-500">{c.label}</div>
            <div className="mt-1 text-xl font-semibold text-gray-900">
              {typeof c.value === "number" ? formatNum(c.value) : c.value}
            </div>
            <div className="text-xs text-gray-400">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="dateShort"
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
            />
            <YAxis
              tickFormatter={formatNum}
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
            />
            <Tooltip
              formatter={(value: number) => [formatNum(value), ""]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="dau"
              name="DAU"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="wau"
              name="WAU"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="mau"
              name="MAU"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
