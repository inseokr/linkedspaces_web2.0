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
import type { GeoMetrics } from "../types";

type Props = { data: GeoMetrics };

export default function DashboardGeo({ data }: Props) {
  const { popularPlaces, placesPerCity, usersPerCountry } = data;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Geographical Data</h2>
      <p className="mt-1 text-sm text-gray-500">
        Popular places, places per city, users per country
      </p>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700">
          Most popular places visited
        </h3>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">Place</th>
                <th className="pb-2 pr-4 font-medium">City</th>
                <th className="pb-2 pr-4 font-medium">Country</th>
                <th className="pb-2 font-medium">Visits</th>
              </tr>
            </thead>
            <tbody>
              {popularPlaces.map((p) => (
                <tr
                  key={`${p.placeName}-${p.city}`}
                  className="border-b border-gray-100"
                >
                  <td className="py-2 pr-4 font-medium text-gray-900">
                    {p.placeName}
                  </td>
                  <td className="py-2 pr-4 text-gray-600">{p.city}</td>
                  <td className="py-2 pr-4 text-gray-600">{p.country}</td>
                  <td className="py-2">{p.visits.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium text-gray-700">
            Total places per city
          </h3>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={placesPerCity} margin={{ bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="city"
                  tick={{ fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#10b981"
                  name="Places"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700">
            Users per country
          </h3>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usersPerCountry} margin={{ bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="country"
                  tick={{ fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#8b5cf6"
                  name="Users"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
