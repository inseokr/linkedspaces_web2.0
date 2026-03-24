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
  avgPhotosPerBlog: number;
  blogLifecycle: { saved: number; completed: number; published: number };
  blogsWithShareLink: number;
  blogsWithShareLinkPct: number;
  photosWithCaptionPct: number;
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

// Unique identity = one (device, user) pair.
// userId null means anonymous session on that device.
export type HomeLocation = {
  city: string | null;
  state: string | null;
  country: string | null;
};

export type UserStreamEntry = {
  anonymousId: string;
  userId: string | null;
  username: string | null;
  firstSeen: string;
  recentActivity: string;
  eventCount: number;
  platforms: string[];
  appVersions: string[];
  homeLocation?: HomeLocation;
};

export type PerUserEventAnalytics = {
  anonymousId: string;
  userId: string | null;
  username: string | null;
  periodDays: number;
  homeLocation?: HomeLocation;
  meta: {
    firstSeen: string;
    recentActivity: string;
    totalEvents: number;
    platforms: string[];
    appVersions: string[];
  } | null;
  funnel: { eventName: string; count: number }[];
  dailyTrend: DailyTrendRow[];
  topEvents: TopEvent[];
  eventStats?: { minDaily: number; maxDaily: number; avgDaily: number };
  placeStats?: {
    totalPlaces: number;
    totalBlogs: number;
    avgDaysPerBlog: number | null;
    minDaysPerBlog: number | null;
    maxDaysPerBlog: number | null;
  };
};
