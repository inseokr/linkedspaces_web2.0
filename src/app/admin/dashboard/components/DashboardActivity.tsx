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
import type { UserActivityMetrics } from "../types";

type Props = { data: UserActivityMetrics };

export default function DashboardActivity({ data }: Props) {
  const {
    topActiveUsers,
    recentActivity,
    totalPlacesSaved,
    monthlyPlacesSaved,
    totalBlogs,
    engagementByPage,
    mostUsedAddPlaceFlow,
    referralRatePercent,
  } = data;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        User Activity & Engagement
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Top users, recent activity, and engagement by page
      </p>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Summary</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>
              Total places saved:{" "}
              <strong>{totalPlacesSaved.toLocaleString()}</strong>
            </li>
            <li>
              Monthly places saved:{" "}
              <strong>{monthlyPlacesSaved.toLocaleString()}</strong>
            </li>
            <li>
              Total blogs: <strong>{totalBlogs.toLocaleString()}</strong>
            </li>
            <li>
              Referral rate: <strong>{referralRatePercent}%</strong>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700">
            Most used add-place flow
          </h3>
          <div className="mt-2 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mostUsedAddPlaceFlow}
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  width={95}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Completion"]}
                />
                <Bar
                  dataKey="pct"
                  fill="#3b82f6"
                  name="Completion %"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700">
          Top active users (leaderboard)
        </h3>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">#</th>
                <th className="pb-2 pr-4 font-medium">Username</th>
                <th className="pb-2 pr-4 font-medium">Places added</th>
                <th className="pb-2 pr-4 font-medium">Comments</th>
                <th className="pb-2 font-medium">Saved places</th>
              </tr>
            </thead>
            <tbody>
              {topActiveUsers.slice(0, 10).map((u, i) => (
                <tr key={u.userId} className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-500">{i + 1}</td>
                  <td className="py-2 pr-4 font-medium text-gray-900">
                    {u.username}
                  </td>
                  <td className="py-2 pr-4">
                    {u.placesAdded.toLocaleString()}
                  </td>
                  <td className="py-2 pr-4">{u.comments}</td>
                  <td className="py-2">{u.savedPlaces.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700">
          Engagement by page
        </h3>
        <div className="mt-2 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={engagementByPage} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="page"
                tick={{ fontSize: 10 }}
                angle={-25}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar
                dataKey="visits"
                fill="#10b981"
                name="Visits"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="uniqueUsers"
                fill="#f59e0b"
                name="Unique users"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700">
          Recent activity feed
        </h3>
        <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/50 p-3">
          {recentActivity.map((a) => (
            <li key={a.id} className="flex flex-wrap gap-2 text-sm">
              <span className="font-medium text-gray-900">{a.username}</span>
              <span className="text-gray-500">{a.type.replace("_", " ")}</span>
              {a.placeName && (
                <span className="text-gray-700">— {a.placeName}</span>
              )}
              {a.caption && (
                <span className="text-gray-600">
                  &quot;{a.caption.slice(0, 40)}…&quot;
                </span>
              )}
              <span className="text-gray-400">
                {new Date(a.timestamp).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
