export type ObservabilityMetrics = {
  totalUsers: number;
  activeUsers: number;
  blogsCreated: {
    day: number;
    week: number;
    month: number;
  };
  cloudPublishes: number;
  photosUploaded: number;
  storageUsedGb: number;
  avgBlogsPerUser: number;
  avgUploadsPerUser: number;
};

export type ServiceUsage = {
  aws: {
    s3Uploads: number;
    storageUsedGb: number;
    bandwidthGb: number;
    requestCount: number;
  };
  mapbox: {
    mapLoads: number;
    searchAutocomplete: number;
  };
  mongodb: {
    storageUsedGb: number;
  };
  heroku: {
    dynoHours: number;
  };
};

export type CostItem = {
  service: string;
  currentUsage: string;
  freeTierLimit: string;
  estimatedMonthlyCost: number;
  riskLevel: "Low" | "Medium" | "High";
  notes: string;
};

export type CostDashboardMetrics = {
  items: CostItem[];
};

// --- Event-stream analytics (from /admin/dashboard/analytics/events) ---

export type FunnelStep = {
  eventName: string;
  uniqueUsers: number;
  dropoffPct?: number; // computed on client
};

export type DailyTrendRow = {
  date: string;
  [eventName: string]: number | string; // date + arbitrary event counts
};

export type TopEvent = {
  eventName: string;
  count: number;
};

export type EventAnalytics = {
  periodDays: number;
  funnel: FunnelStep[];
  dailyTrend: DailyTrendRow[];
  topEvents: TopEvent[];
  identity: {
    anonymous: number;
    authenticated: number;
    uniqueDevices: number;
  };
};
