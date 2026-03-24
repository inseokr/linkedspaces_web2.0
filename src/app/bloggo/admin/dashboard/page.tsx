"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getCachedUser } from "@/api/user";
import { isAdminUsername } from "@/lib/admin";
import {
  fetchStorageCost,
  fetchAwsCost,
  fetchMongoStorage,
  fetchEventAnalytics,
  fetchEventUsers,
  fetchUserEventAnalytics,
  fetchObservabilityMetrics,
  type StorageCostResponse,
  type AwsCostResponse,
  type MongoStorageResponse,
} from "@/api/admin-dashboard";
import { fetchWaitlist, fetchPremiumUserCount } from "@/api/waitlist";
import type { WaitlistEntry } from "@/api/waitlist";
import DashboardWaitlist from "@/app/admin/dashboard/components/DashboardWaitlist";

import {
  MOCK_OBSERVABILITY_METRICS,
  MOCK_SERVICE_USAGE,
  MOCK_COST_DASHBOARD,
} from "./mockData";
import type {
  CostDashboardMetrics,
  CostItem,
  UserStreamEntry,
  PerUserEventAnalytics,
  ObservabilityMetrics,
} from "./types";
import type { ServiceUsage as ServiceUsageType } from "./types";
import { ObservabilityOverview } from "./components/ObservabilityOverview";
import { ServiceUsage } from "./components/ServiceUsage";
import { CostDashboard } from "./components/CostDashboard";
import { CostProjectionModel } from "./components/CostProjectionModel";
import { DashboardEventFunnel } from "./components/DashboardEventFunnel";
import type { EventAnalytics } from "./types";

const STORAGE_SERVICE = "AWS S3 (Storage)";
const MONGO_SERVICE = "MongoDB Atlas";

function getStorageCostData(
  res: StorageCostResponse,
): StorageCostResponse["data"] | null {
  if (res.data) return res.data;
  if (
    res.storage ??
    res.estimatedMonthlyCost ??
    res.storageGrowth ??
    res.history
  ) {
    return {
      storage: res.storage,
      estimatedMonthlyCost: res.estimatedMonthlyCost,
      storageGrowth: res.storageGrowth,
      history: res.history,
    };
  }
  return null;
}

/** Extract storage used in GB from the storage/cost API response. */
function getStorageUsedGbFromResponse(res: StorageCostResponse): number | null {
  const data = getStorageCostData(res);
  const storage = data?.storage;
  if (!storage) return null;
  const sizeGbStr = storage.totalSizeGB;
  if (sizeGbStr != null && sizeGbStr !== "") {
    const n = Number.parseFloat(sizeGbStr);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof storage.totalSizeBytes === "number") {
    return storage.totalSizeBytes / (1024 * 1024 * 1024);
  }
  return null;
}

function mergeStorageCostIntoItems(
  items: CostItem[],
  res: StorageCostResponse,
): CostItem[] {
  const data = getStorageCostData(res);
  if (!data) return items;

  const storage = data.storage;
  const costRaw = data.estimatedMonthlyCost;
  const storageCost =
    typeof costRaw === "number"
      ? costRaw
      : ((costRaw as { storageCost?: number } | undefined)?.storageCost ??
        null);

  const sizeGbStr = storage?.totalSizeGB;
  const sizeGbNum =
    sizeGbStr != null && sizeGbStr !== ""
      ? Number.parseFloat(sizeGbStr)
      : typeof storage?.totalSizeBytes === "number"
        ? storage.totalSizeBytes / (1024 * 1024 * 1024)
        : null;
  const growth = data.storageGrowth;
  const growthNote =
    growth?.growthGB != null && growth?.growthPct != null
      ? ` Growth: ${growth.growthGB.toFixed(2)} GB (${growth.growthPct.toFixed(1)}%) over ${growth.periodDays ?? 30}d.`
      : "";

  return items.map((item) => {
    if (item.service === STORAGE_SERVICE) {
      const currentUsage =
        sizeGbNum != null && !Number.isNaN(sizeGbNum)
          ? `${sizeGbNum.toFixed(2)} GB`
          : item.currentUsage;
      return {
        ...item,
        currentUsage,
        estimatedMonthlyCost:
          storageCost != null ? storageCost : item.estimatedMonthlyCost,
        notes:
          (storageCost != null
            ? "From S3 CloudWatch (BucketSizeBytes, NumberOfObjects); pricing from env/rate card."
            : item.notes) + growthNote,
      };
    }
    return item;
  });
}

function mergeMongoStorageIntoItems(
  items: CostItem[],
  res: MongoStorageResponse,
): CostItem[] {
  if (res.result !== "OK" || res.totalStorageMB == null) return items;
  const sizeGb = res.totalStorageMB / 1024;
  return items.map((item) => {
    if (item.service !== MONGO_SERVICE) return item;
    return {
      ...item,
      currentUsage: `${sizeGb.toFixed(2)} GB`,
      notes: `From db.stats() (${res.totalStorageMB} MB). ` + item.notes,
    };
  });
}

/** Get YYYY-MM-DD for first day of current month and for tomorrow (for AWS cost period). */
function getAwsCostPeriod(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

/** Match usage types that are data transfer / egress (Out-Bytes, DataTransfer-Out, AWS-Out). */
function isDataTransferUsageType(usageType: string): boolean {
  return (
    /Out-Bytes|DataTransfer-Out|DataTransfer.*Out|AWS-Out/i.test(usageType) &&
    !/In-Bytes|DataTransfer-In/i.test(usageType)
  );
}

/** Match usage types that are storage (TimedStorage, ByteHrs). */
function isStorageUsageType(usageType: string): boolean {
  return /TimedStorage|ByteHrs|Storage-ByteHrs/i.test(usageType);
}

/** Match usage types that are requests (Tier1, Tier2, Requests). */
function isRequestsUsageType(usageType: string): boolean {
  return /Requests-Tier|Requests\.Tier/i.test(usageType);
}

/** Sum cost from breakdown items matching a predicate. */
function sumBreakdownCost(
  breakdown: AwsCostResponse["breakdown"],
  predicate: (usageType: string) => boolean,
): number {
  if (!breakdown?.length) return 0;
  return breakdown
    .filter((b) => b.usageType && predicate(b.usageType))
    .reduce((sum, b) => sum + (Number.isFinite(b.cost) ? b.cost! : 0), 0);
}

/** Build a simple S3 cost breakdown for display (storage, requests, data transfer). */
function getAwsCostBreakdownForDisplay(res: AwsCostResponse): {
  period: { start: string; end: string };
  totalCost: number;
  storageCost: number;
  requestsCost: number;
  dataTransferCost: number;
  periodDays: number;
  estimatedMonthlyTotal: number;
} | null {
  if (
    res.result !== "OK" ||
    !res.breakdown?.length ||
    !res.period?.start ||
    !res.period?.end
  )
    return null;
  const start = new Date(res.period.start);
  const end = new Date(res.period.end);
  const periodDays = Math.max(
    1,
    (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
  );
  const storageCost = sumBreakdownCost(res.breakdown, isStorageUsageType);
  const requestsCost = sumBreakdownCost(res.breakdown, isRequestsUsageType);
  const dataTransferCost = sumBreakdownCost(
    res.breakdown,
    isDataTransferUsageType,
  );
  const totalCost =
    res.totalCost ?? storageCost + requestsCost + dataTransferCost;
  const estimatedMonthlyTotal = (totalCost / periodDays) * 30;
  return {
    period: { start: res.period.start, end: res.period.end },
    totalCost,
    storageCost,
    requestsCost,
    dataTransferCost,
    periodDays: Math.round(periodDays),
    estimatedMonthlyTotal,
  };
}

const COST_DAYS_DEFAULT = 30;

export default function BloggoAdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [costData, setCostData] =
    useState<CostDashboardMetrics>(MOCK_COST_DASHBOARD);
  const [serviceUsage, setServiceUsage] =
    useState<ServiceUsageType>(MOCK_SERVICE_USAGE);
  const [awsStorageGrowth, setAwsStorageGrowth] = useState<{
    growthPct: number;
    growthGB: number;
    periodDays: number;
  } | null>(null);
  const [awsCostBreakdown, setAwsCostBreakdown] = useState<{
    period: { start: string; end: string };
    totalCost: number;
    storageCost: number;
    requestsCost: number;
    dataTransferCost: number;
    periodDays: number;
    estimatedMonthlyTotal: number;
  } | null>(null);
  const [costLoading, setCostLoading] = useState(true);
  const [costError, setCostError] = useState<string | null>(null);

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [premiumCount, setPremiumCount] = useState(0);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  const [observabilityMetrics, setObservabilityMetrics] =
    useState<ObservabilityMetrics>(MOCK_OBSERVABILITY_METRICS);
  const [observabilityLoading, setObservabilityLoading] = useState(true);
  const [observabilityError, setObservabilityError] = useState<string | null>(
    null,
  );

  const [eventData, setEventData] = useState<EventAnalytics | null>(null);
  const [eventDays, setEventDays] = useState(30);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);

  // Per-user event analytics state
  const [eventUsers, setEventUsers] = useState<UserStreamEntry[]>([]);
  const [eventUsersLoading, setEventUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserStreamEntry | null>(
    null,
  );
  const [perUserData, setPerUserData] = useState<PerUserEventAnalytics | null>(
    null,
  );
  const [perUserLoading, setPerUserLoading] = useState(false);
  const [perUserError, setPerUserError] = useState<string | null>(null);

  const loadObservability = useCallback(async () => {
    setObservabilityLoading(true);
    setObservabilityError(null);
    try {
      const data = await fetchObservabilityMetrics();
      setObservabilityMetrics((prev) => ({
        ...prev,
        totalUsers: data.totalUsers,
        activeUsers: data.activeUsers,
        cloudPublishes: data.cloudPublishes,
        photosUploaded: data.photosUploaded,
        blogsCreated: data.blogsCreated,
        avgBlogsPerUser: data.avgBlogsPerUser,
        avgUploadsPerUser: data.avgUploadsPerUser,
        avgPhotosPerBlog: data.avgPhotosPerBlog,
        blogLifecycle: data.blogLifecycle,
        blogsWithShareLink: data.blogsWithShareLink,
        blogsWithShareLinkPct: data.blogsWithShareLinkPct,
        photosWithCaptionPct: data.photosWithCaptionPct,
      }));
    } catch (e) {
      setObservabilityError(
        e instanceof Error ? e.message : "Failed to load observability metrics",
      );
    } finally {
      setObservabilityLoading(false);
    }
  }, []);

  const loadEventAnalytics = useCallback(async (days: number) => {
    setEventLoading(true);
    setEventError(null);
    try {
      const res = await fetchEventAnalytics(days);
      if (res.result === "OK") {
        setEventData({ periodDays: res.periodDays, ...res.data });
      } else {
        setEventError("Failed to load event analytics");
      }
    } catch (e) {
      setEventError(
        e instanceof Error ? e.message : "Failed to load event analytics",
      );
    } finally {
      setEventLoading(false);
    }
  }, []);

  const loadEventUsers = useCallback(async (days: number) => {
    setEventUsersLoading(true);
    try {
      const res = await fetchEventUsers(days);
      if (res.result === "OK") {
        setEventUsers(res.users);
      }
    } catch {
      // silently ignore; list simply stays empty
    } finally {
      setEventUsersLoading(false);
    }
  }, []);

  const handleSelectUser = useCallback(
    async (user: UserStreamEntry | null) => {
      setSelectedUser(user);
      setPerUserData(null);
      setPerUserError(null);
      if (!user) return;
      setPerUserLoading(true);
      try {
        const res = await fetchUserEventAnalytics(
          user.anonymousId,
          user.userId,
          eventDays,
        );
        if (res.result === "OK") {
          setPerUserData({
            anonymousId: res.anonymousId,
            userId: res.userId,
            username: res.username,
            periodDays: res.periodDays,
            homeLocation: res.homeLocation,
            meta: res.meta,
            funnel: res.data.funnel,
            dailyTrend: res.data.dailyTrend,
            topEvents: res.data.topEvents,
            eventStats: res.eventStats,
            placeStats: res.placeStats,
          });
        } else {
          setPerUserError("Failed to load user data");
        }
      } catch (e) {
        setPerUserError(
          e instanceof Error ? e.message : "Failed to load user data",
        );
      } finally {
        setPerUserLoading(false);
      }
    },
    [eventDays],
  );

  const loadWaitlist = useCallback(async () => {
    setWaitlistLoading(true);
    setWaitlistError(null);
    try {
      const [list, count] = await Promise.all([
        fetchWaitlist(),
        fetchPremiumUserCount().catch(() => 0),
      ]);
      console.log("[Waitlist] Fetch waitlist API response:", list);
      setWaitlist(list);
      setPremiumCount(count);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load waitlist";
      setWaitlistError(msg);
    } finally {
      setWaitlistLoading(false);
    }
  }, []);

  const loadCosts = useCallback(async (days: number = COST_DAYS_DEFAULT) => {
    setCostLoading(true);
    setCostError(null);
    const { start, end } = getAwsCostPeriod();
    try {
      const [storageRes, awsCostRes, mongoRes] = await Promise.all([
        fetchStorageCost(days),
        fetchAwsCost({
          start,
          end,
          granularity: "MONTHLY",
          service: "Amazon Simple Storage Service",
        }),
        fetchMongoStorage(),
      ]);
      console.log(
        "[Cost Dashboard] AWS storage/cost API response:",
        storageRes,
      );
      console.log("[Cost Dashboard] AWS cost API response:", awsCostRes);
      console.log("[Cost Dashboard] MongoDB storage API response:", mongoRes);

      let items = mergeStorageCostIntoItems(
        MOCK_COST_DASHBOARD.items,
        storageRes,
      );
      items = mergeMongoStorageIntoItems(items, mongoRes);
      setCostData({ items });
      const breakdown = getAwsCostBreakdownForDisplay(awsCostRes);
      setAwsCostBreakdown(breakdown ?? null);

      const data = getStorageCostData(storageRes);
      const storageGb = getStorageUsedGbFromResponse(storageRes);
      const objectCount = data?.storage?.objectCount;

      const mongoGb =
        mongoRes.result === "OK" && mongoRes.totalStorageMB != null
          ? mongoRes.totalStorageMB / 1024
          : null;

      setServiceUsage((prev) => ({
        ...prev,
        aws: {
          ...prev.aws,
          storageUsedGb: storageGb ?? prev.aws.storageUsedGb,
          s3Uploads: objectCount ?? prev.aws.s3Uploads,
        },
        ...(mongoGb != null ? { mongodb: { storageUsedGb: mongoGb } } : {}),
      }));

      const growth = data?.storageGrowth;
      if (growth?.growthPct != null) {
        setAwsStorageGrowth({
          growthPct: growth.growthPct,
          growthGB: growth.growthGB ?? 0,
          periodDays: growth.periodDays ?? COST_DAYS_DEFAULT,
        });
      } else {
        setAwsStorageGrowth(null);
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load cost data";
      setCostError(message);
      setCostData(MOCK_COST_DASHBOARD);
    } finally {
      setCostLoading(false);
    }
  }, []);

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

    setAllowed(true);
  }, [authLoading, isAuthenticated, router]);

  // Sync real S3 storage GB into observability metrics once available
  useEffect(() => {
    const gb = serviceUsage.aws?.storageUsedGb;
    if (gb != null && gb > 0) {
      setObservabilityMetrics((prev) => ({ ...prev, storageUsedGb: gb }));
    }
  }, [serviceUsage.aws?.storageUsedGb]);

  useEffect(() => {
    if (!allowed) return;
    loadObservability();
    loadCosts(COST_DAYS_DEFAULT);
    loadWaitlist();
    loadEventAnalytics(eventDays);
    loadEventUsers(eventDays);
  }, [
    allowed,
    loadObservability,
    loadCosts,
    loadWaitlist,
    loadEventAnalytics,
    loadEventUsers,
  ]);  

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
              <strong>Data sources:</strong> <strong>Observability</strong> uses{" "}
              <code className="rounded bg-amber-100 px-1">
                /admin/dashboard/analytics/bloggo
              </code>{" "}
              (real user/trip/photo counts; blog dates are trip-start proxies).{" "}
              <strong>Service Usage</strong> and <strong>Cost Dashboard</strong>{" "}
              use{" "}
              <code className="rounded bg-amber-100 px-1">
                /admin/dashboard/storage/cost
              </code>{" "}
              for S3 storage,{" "}
              <code className="rounded bg-amber-100 px-1">
                /admin/dashboard/aws/cost
              </code>{" "}
              for S3 bandwidth, and{" "}
              <code className="rounded bg-amber-100 px-1">/storage/mongo</code>{" "}
              for MongoDB storage. Mapbox/Heroku metrics remain mock.
            </p>
          </div>

          <DashboardWaitlist
            waitlist={waitlist}
            premiumCount={premiumCount}
            loading={waitlistLoading}
            error={waitlistError}
            onRefresh={loadWaitlist}
          />
          <DashboardEventFunnel
            data={eventData}
            loading={eventLoading}
            error={eventError}
            days={eventDays}
            onChangeDays={(d) => {
              setEventDays(d);
              setSelectedUser(null);
              setPerUserData(null);
              loadEventAnalytics(d);
              loadEventUsers(d);
            }}
            users={eventUsers}
            usersLoading={eventUsersLoading}
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
            perUserData={perUserData}
            perUserLoading={perUserLoading}
            perUserError={perUserError}
          />
          <ObservabilityOverview
            data={observabilityMetrics}
            loading={observabilityLoading}
            error={observabilityError}
          />
          <ServiceUsage
            data={serviceUsage}
            awsStorageGrowth={awsStorageGrowth}
          />
          <CostDashboard
            data={costData}
            loading={costLoading}
            error={costError}
            onRefresh={() => loadCosts(COST_DAYS_DEFAULT)}
            awsCostBreakdown={awsCostBreakdown}
          />
          <CostProjectionModel
            awsCostBreakdown={awsCostBreakdown}
            storageUsedGb={serviceUsage.aws?.storageUsedGb}
            currentMau={observabilityMetrics.activeUsers}
            photoCount={serviceUsage.aws?.s3Uploads}
          />
        </div>
      </div>
    </div>
  );
}
