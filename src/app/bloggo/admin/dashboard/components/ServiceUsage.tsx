import { ServiceUsage as ServiceUsageType } from "../types";

export function ServiceUsage({ data }: { data: ServiceUsageType }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        2. Service Usage Tracking
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Raw metric usage broken down by infrastructure provider.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProviderCard
          title="Amazon Web Services"
          metrics={[
            { label: "S3 Uploads", value: data.aws.s3Uploads.toLocaleString() },
            { label: "Storage Used", value: `${data.aws.storageUsedGb} GB` },
            { label: "Bandwidth Used", value: `${data.aws.bandwidthGb} GB` },
            {
              label: "Request Count",
              value: data.aws.requestCount.toLocaleString(),
            },
          ]}
        />
        <ProviderCard
          title="Mapbox"
          metrics={[
            {
              label: "Map Loads",
              value: data.mapbox.mapLoads.toLocaleString(),
            },
            {
              label: "Search Autocomplete",
              value: data.mapbox.searchAutocomplete.toLocaleString(),
            },
          ]}
        />
        <ProviderCard
          title="MongoDB"
          metrics={[
            {
              label: "Storage Used",
              value: `${data.mongodb.storageUsedGb} GB`,
            },
          ]}
        />
        <ProviderCard
          title="Heroku"
          metrics={[
            { label: "Dyno Hours", value: `${data.heroku.dynoHours} hr` },
          ]}
        />
      </div>
    </section>
  );
}

function ProviderCard({
  title,
  metrics,
}: {
  title: string;
  metrics: { label: string; value: string }[];
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">
        {title}
      </h3>
      <dl className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label} className="flex justify-between">
            <dt className="text-xs font-medium text-gray-500">{m.label}</dt>
            <dd className="text-sm font-semibold text-gray-900">{m.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
