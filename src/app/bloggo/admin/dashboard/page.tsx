"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getCachedUser } from "@/api/user";
import { isAdminUsername } from "@/lib/admin";

import {
  MOCK_OBSERVABILITY_METRICS,
  MOCK_SERVICE_USAGE,
  MOCK_COST_DASHBOARD,
} from "./mockData";
import { ObservabilityOverview } from "./components/ObservabilityOverview";
import { ServiceUsage } from "./components/ServiceUsage";
import { CostDashboard } from "./components/CostDashboard";
import { CostProjectionModel } from "./components/CostProjectionModel";

export default function BloggoAdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/bloggo");
      return;
    }
    const user = getCachedUser();
    if (!isAdminUsername(user?.username)) {
      router.replace("/bloggo");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllowed(true);
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || allowed === null) {
    return (
      <div className="flex bg-[var(--bloggo-bg)] min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-sky-600" />
          <p className="mt-3 text-sm text-[var(--bloggo-text-secondary)]">
            Verifying admin access…
          </p>
        </div>
      </div>
    );
  }

  if (!allowed) return null;

  return (
    <div className="min-h-screen bg-[var(--bloggo-bg)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              Bloggo Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-[var(--bloggo-text-secondary)]">
              Observability and Infrastructure Cost Modeling
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/bloggo"
              className="rounded-lg border border-[var(--bloggo-border)] bg-[var(--bloggo-bg)] px-3 py-2 text-sm font-medium text-[var(--bloggo-text-primary)] hover:bg-black/5 transition-colors"
            >
              Back to Bloggo
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-4">
            <svg
              className="h-5 w-5 text-amber-600 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-amber-800">
              <strong>Notice:</strong> The backend is not yet emitting precise
              Bloggo-specific analytics (e.g. Mapbox map loads, photo uploads
              specific to blogs). The Observability, Service Usage, and Cost
              Dashboard sections currently display structurally sound{" "}
              <strong>mock data</strong>. The Cost Projection Model is fully
              functional interactively.
            </p>
          </div>

          <ObservabilityOverview data={MOCK_OBSERVABILITY_METRICS} />
          <ServiceUsage data={MOCK_SERVICE_USAGE} />
          <CostDashboard data={MOCK_COST_DASHBOARD} />
          <CostProjectionModel />
        </div>
      </div>
    </div>
  );
}
