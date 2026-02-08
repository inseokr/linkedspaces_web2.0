"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getCachedUser } from "@/api/user";
import { isAdminUsername } from "@/lib/admin";
import {
  fetchDashboardAnalytics,
  fetchUserDetails,
} from "@/api/admin-dashboard";
import type {
  BackendDashboardAnalytics,
  BackendUserDetails,
} from "@/api/admin-dashboard";
import DashboardOverview from "./components/DashboardOverview";
import DashboardActivity from "./components/DashboardActivity";
import DashboardPerformance from "./components/DashboardPerformance";
import DashboardGeo from "./components/DashboardGeo";
import DashboardPerUser from "./components/DashboardPerUser";
import DashboardApiUsage from "./components/DashboardApiUsage";
import DashboardFilters from "./components/DashboardFilters";
import {
  mapToOverviewMetrics,
  mapToActivityMetrics,
  mapToPerformanceMetrics,
  mapToGeoMetrics,
  mapToPerUserMetrics,
} from "./dataMapper";
import { getMockApiUsageMetrics, getMockPerUserMetrics } from "./mockData";
import type { DashboardFilters as Filters } from "./types";

const DEFAULT_DATE_END = new Date().toISOString().slice(0, 10);
const DEFAULT_DATE_START = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().slice(0, 10);
})();

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  const [analytics, setAnalytics] = useState<BackendDashboardAnalytics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<BackendUserDetails | null>(
    null,
  );
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    dateRange: { start: DEFAULT_DATE_START, end: DEFAULT_DATE_END },
  });

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardAnalytics();
      setAnalytics(data);
      setUseMockData(false);
    } catch (err: unknown) {
      const apiErr = err as {
        status?: number;
        message?: string;
        detail?: string;
      };
      const status = apiErr?.status;
      const message =
        status === 403
          ? "Access denied. Admin only."
          : status === 404
            ? "Backend endpoint not found."
            : status === 500
              ? "Server error loading analytics."
              : apiErr?.message || "Failed to load dashboard data.";
      setError(message);
      setAnalytics(null);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    const user = getCachedUser();
    if (!isAdminUsername(user?.username)) {
      router.replace("/");
      return;
    }
    setAllowed(true);
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!allowed) return;
    loadAnalytics();
  }, [allowed, loadAnalytics]);

  useEffect(() => {
    if (!selectedUsername) {
      setUserDetails(null);
      return;
    }
    let cancelled = false;
    setUserDetailsLoading(true);
    setUserDetails(null);
    fetchUserDetails(selectedUsername)
      .then((data) => {
        if (!cancelled) {
          setUserDetails(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUserDetails(null);
        }
      })
      .finally(() => {
        if (!cancelled) setUserDetailsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedUsername]);

  const effectiveAnalytics = useMockData ? null : analytics;
  const overview = mapToOverviewMetrics(effectiveAnalytics);
  const activity = mapToActivityMetrics(effectiveAnalytics);
  const performance = mapToPerformanceMetrics(effectiveAnalytics);
  const geo = mapToGeoMetrics(effectiveAnalytics);
  const apiUsage = getMockApiUsageMetrics();

  const perUserDetail = (() => {
    if (!selectedUsername) return null;
    if (useMockData) {
      const userId = activity.topActiveUsers.find(
        (u) => u.username === selectedUsername,
      )?.userId;
      return userId ? getMockPerUserMetrics(userId) : null;
    }
    return mapToPerUserMetrics(selectedUsername, userDetails);
  })();

  function exportOverviewCsv() {
    const headers = ["Metric", "Value"];
    const rows = [
      ["Total users (MAU)", overview.mau],
      ["New sign-ups (30d)", overview.newSignupsCurrent],
      ["Retention %", overview.retentionRatePercent],
      ["Stickiness", overview.stickinessRatio],
      ["Churn %", overview.churnRatePercent],
    ];
    const csv = [headers, ...rows.map((r) => r.map(String).join(","))].join(
      "\n",
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-overview-${DEFAULT_DATE_END}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPerUserCsv(username: string) {
    const detail = mapToPerUserMetrics(username, userDetails);
    if (!detail) return;
    const rows = [
      ["Username", detail.username],
      ["Places", detail.placesCount],
      ["Avg places/day", detail.avgPlacesPerDay.toFixed(1)],
      ["Friends", detail.friendsCount],
      ["% photos with story", detail.pctPhotosWithStory],
      ["% audio captions", detail.pctAudioCaptions],
      ["Avg story length", detail.avgStoryLength],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user-${detail.username}-${DEFAULT_DATE_END}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (authLoading || allowed === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          <p className="mt-3 text-sm text-gray-600">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  if (loading && !analytics && !useMockData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          <p className="mt-3 text-sm text-gray-600">Loading dashboard data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              {useMockData || !analytics
                ? "LinkedSpaces admin — mock data"
                : "LinkedSpaces admin — live data"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {analytics && !useMockData && (
              <button
                type="button"
                onClick={loadAnalytics}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Refresh data
              </button>
            )}
            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to app
            </Link>
            <button
              type="button"
              onClick={exportOverviewCsv}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Export overview CSV
            </button>
          </div>
        </div>

        {useMockData && error && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-800">
              Showing mock data — {error}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadAnalytics()}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
              >
                Retry backend
              </button>
              <button
                type="button"
                onClick={() => setError(null)}
                className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <DashboardFilters
            filters={filters}
            onDateRangeChange={(dateRange) =>
              setFilters((f) => ({ ...f, dateRange }))
            }
            onSegmentChange={(segment) =>
              setFilters((f) => ({ ...f, segment }))
            }
            onCountryChange={(country) =>
              setFilters((f) => ({ ...f, country }))
            }
          />
        </div>

        <div className="space-y-8">
          <DashboardOverview data={overview} />
          <DashboardActivity data={activity} />
          <DashboardPerformance data={performance} />
          <DashboardGeo data={geo} />
          <DashboardPerUser
            topActiveUsers={activity.topActiveUsers}
            selectedUsername={selectedUsername}
            onSelectUsername={setSelectedUsername}
            perUserDetail={perUserDetail}
            perUserLoading={userDetailsLoading}
            onExport={exportPerUserCsv}
          />
          <DashboardApiUsage data={apiUsage} />
        </div>

        <footer className="mt-12 border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
          {useMockData || !analytics
            ? "Showing mock data. Backend GET /admin/dashboard-analytics required for live data."
            : "Live data from backend. API Usage section still uses mock data."}
        </footer>
      </div>
    </div>
  );
}
