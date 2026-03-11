import {
  ObservabilityMetrics,
  ServiceUsage,
  CostDashboardMetrics,
} from "./types";

export const MOCK_OBSERVABILITY_METRICS: ObservabilityMetrics = {
  totalUsers: 14205,
  activeUsers: 3450,
  blogsCreated: {
    day: 125,
    week: 950,
    month: 3800,
  },
  cloudPublishes: 2150,
  photosUploaded: 85400,
  storageUsedGb: 145.2,
  avgBlogsPerUser: 1.2,
  avgUploadsPerUser: 24.7,
};

export const MOCK_SERVICE_USAGE: ServiceUsage = {
  aws: {
    s3Uploads: 85400,
    storageUsedGb: 145.2,
    bandwidthGb: 512.5,
    requestCount: 1205000,
  },
  mapbox: {
    mapLoads: 145000,
    searchAutocomplete: 45000,
  },
  mongodb: {
    storageUsedGb: 12.4,
  },
  heroku: {
    dynoHours: 720,
  },
};

export const MOCK_COST_DASHBOARD: CostDashboardMetrics = {
  items: [
    {
      service: "AWS S3 (Storage)",
      currentUsage: "145.2 GB",
      freeTierLimit: "5 GB",
      estimatedMonthlyCost: 3.22,
      riskLevel: "Low",
      notes: "$0.023 per GB after free tier",
    },
    {
      service: "Mapbox Maps",
      currentUsage: "145,000 loads",
      freeTierLimit: "50,000 loads",
      estimatedMonthlyCost: 47.5,
      riskLevel: "High",
      notes: "$4.00 per 1k loads over 50k",
    },
    {
      service: "Mapbox Search",
      currentUsage: "45,000 requests",
      freeTierLimit: "100,000 requests",
      estimatedMonthlyCost: 0,
      riskLevel: "Low",
      notes: "Well within free tier limit",
    },
    {
      service: "MongoDB Atlas",
      currentUsage: "12.4 GB",
      freeTierLimit: "512 MB",
      estimatedMonthlyCost: 65.0,
      riskLevel: "Medium",
      notes: "Dedicated cluster (M10)",
    },
    {
      service: "Heroku Dynos",
      currentUsage: "720 hours",
      freeTierLimit: "N/A",
      estimatedMonthlyCost: 50.0,
      riskLevel: "Low",
      notes: "Standard-1X Dyno ($25) x2",
    },
  ],
};
