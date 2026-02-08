"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { PerformanceMetrics } from "../types";

type Props = { data: PerformanceMetrics };

export default function DashboardPerformance({ data }: Props) {
  const {
    poiAccuracy,
    crashRatePercent,
    loadTimeAvgMs,
    apiFailureRatePercent,
    cacUsd,
  } = data;

  const poiChartData = [
    { name: "Top 3", value: poiAccuracy.top3, fill: "#3b82f6" },
    { name: "Top 10", value: poiAccuracy.top10, fill: "#10b981" },
    { name: "Top 40", value: poiAccuracy.top40, fill: "#8b5cf6" },
    {
      name: "Google AC",
      value: poiAccuracy.googleAutocomplete,
      fill: "#f59e0b",
    },
  ];

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Performance Metrics
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        POI accuracy, stability, and cost
      </p>

      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-4">
          <div className="text-xs font-medium text-gray-500">
            POI Top 3 accuracy
          </div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {poiAccuracy.top3}%
          </div>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-4">
          <div className="text-xs font-medium text-gray-500">
            POI Top 10 accuracy
          </div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {poiAccuracy.top10}%
          </div>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-4">
          <div className="text-xs font-medium text-gray-500">
            POI Top 40 accuracy
          </div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {poiAccuracy.top40}%
          </div>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-4">
          <div className="text-xs font-medium text-gray-500">
            Google Autocomplete
          </div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {poiAccuracy.googleAutocomplete}%
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
          <div className="text-xs font-medium text-amber-800">Crash rate</div>
          <div className="text-lg font-semibold text-amber-900">
            {crashRatePercent}%
          </div>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3">
          <div className="text-xs font-medium text-gray-500">
            Load time (avg)
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {loadTimeAvgMs} ms
          </div>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3">
          <div className="text-xs font-medium text-gray-500">
            API failure rate
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {apiFailureRatePercent}%
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 inline-block">
          <span className="text-xs font-medium text-gray-500">
            CAC (Customer Acquisition Cost)
          </span>
          <span className="ml-2 text-lg font-semibold text-gray-900">
            ${cacUsd.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-6 h-56">
        <h3 className="text-sm font-medium text-gray-700">
          POI accuracy comparison
        </h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart
            data={poiChartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: number) => [`${value}%`, "Accuracy"]} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {poiChartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
