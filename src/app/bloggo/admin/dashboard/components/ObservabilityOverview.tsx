import { ObservabilityMetrics } from "../types";

export function ObservabilityOverview({
  data,
}: {
  data: ObservabilityMetrics;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        1. Observability Overview
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        High-level product engagement and activity metrics.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPIBox title="Total Users" value={data.totalUsers.toLocaleString()} />
        <KPIBox
          title="Active Users"
          value={data.activeUsers.toLocaleString()}
        />
        <KPIBox
          title="Cloud Publishes"
          value={data.cloudPublishes.toLocaleString()}
        />
        <KPIBox
          title="Photos Uploaded"
          value={data.photosUploaded.toLocaleString()}
        />
        <KPIBox title="Storage Used" value={`${data.storageUsedGb} GB`} />
        <KPIBox
          title="Avg Blogs/User"
          value={data.avgBlogsPerUser.toFixed(1)}
        />
        <KPIBox
          title="Avg Uploads/User"
          value={data.avgUploadsPerUser.toFixed(1)}
        />
      </div>

      <div className="mt-8 border-t pt-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Blogs Created
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <SubKPI
            title="Today"
            value={data.blogsCreated.day.toLocaleString()}
          />
          <SubKPI
            title="This Week"
            value={data.blogsCreated.week.toLocaleString()}
          />
          <SubKPI
            title="This Month"
            value={data.blogsCreated.month.toLocaleString()}
          />
        </div>
      </div>
    </section>
  );
}

function KPIBox({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex flex-col justify-center items-start">
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
        {title}
      </dt>
      <dd className="text-2xl font-bold text-gray-900">{value}</dd>
    </div>
  );
}

function SubKPI({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="flex flex-col">
      <dt className="text-sm font-medium text-gray-500">{title}</dt>
      <dd className="text-xl font-semibold text-gray-900">{value}</dd>
    </div>
  );
}
