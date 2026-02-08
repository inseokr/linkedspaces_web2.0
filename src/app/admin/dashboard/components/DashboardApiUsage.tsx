"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ApiUsageMetrics } from "../types";

type Props = { data: ApiUsageMetrics };

const SERVICE_LABELS: Record<keyof ApiUsageMetrics["totalByService"], string> =
  {
    google: "Google API",
    openai: "OpenAI/ChatGPT",
    unsplash: "Unsplash",
    osmCityName: "OSM getCityNameByCoordinate",
    osmAddress: "OSM getAddressByCoordinate",
  };

function formatCalls(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function DashboardApiUsage({ data }: Props) {
  const { totalByService, costPerUserAvgUsd, perUserBreakdown } = data;

  const chartData = (
    Object.entries(totalByService) as [keyof typeof totalByService, number][]
  ).map(([key, value]) => ({ name: SERVICE_LABELS[key], calls: value }));

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        API Usage & Cost Tracking
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Calls by service and per-user breakdown
      </p>

      <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50/50 p-4">
        <div className="text-sm font-medium text-amber-900">
          LS service cost per user (avg)
        </div>
        <div className="mt-1 text-2xl font-semibold text-amber-900">
          ${costPerUserAvgUsd.toFixed(2)}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700">
          Total API calls by service
        </h3>
        <div className="mt-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                tickFormatter={formatCalls}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={135}
              />
              <Tooltip
                formatter={(value: number) => [formatCalls(value), "Calls"]}
              />
              <Bar
                dataKey="calls"
                fill="#3b82f6"
                name="Calls"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700">
          Per-user breakdown
        </h3>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">Username</th>
                <th className="pb-2 pr-4 font-medium">Places saved</th>
                <th className="pb-2 pr-4 font-medium">Friends</th>
                <th className="pb-2 pr-4 font-medium">Highlights</th>
                <th className="pb-2 pr-4 font-medium">Recap blogs</th>
                <th className="pb-2 font-medium">Itineraries</th>
              </tr>
            </thead>
            <tbody>
              {perUserBreakdown.map((u) => (
                <tr key={u.userId} className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-medium text-gray-900">
                    {u.username}
                  </td>
                  <td className="py-2 pr-4">
                    {u.placesSaved.toLocaleString()}
                  </td>
                  <td className="py-2 pr-4">{u.friends}</td>
                  <td className="py-2 pr-4">{u.highlights}</td>
                  <td className="py-2 pr-4">{u.recapBlogs}</td>
                  <td className="py-2">{u.itineraries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
