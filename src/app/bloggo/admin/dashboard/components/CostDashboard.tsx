import { CostDashboardMetrics } from "../types";

export type AwsCostBreakdownDisplay = {
  period: { start: string; end: string };
  totalCost: number;
  storageCost: number;
  requestsCost: number;
  dataTransferCost: number;
  periodDays: number;
  estimatedMonthlyTotal: number;
};

type CostDashboardProps = {
  data: CostDashboardMetrics;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  awsCostBreakdown?: AwsCostBreakdownDisplay | null;
};

export function CostDashboard({
  data,
  loading = false,
  error = null,
  onRefresh,
  awsCostBreakdown = null,
}: CostDashboardProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm mt-8">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          3. Cost Dashboard
        </h2>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Updating…" : "Refresh costs"}
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Current costs and free tier limits across services.
      </p>
      {error && (
        <p className="text-sm text-amber-700 mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          {error} — showing fallback data.
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 uppercase text-gray-700 text-xs">
            <tr>
              <th scope="col" className="px-6 py-3 font-semibold">
                Service
              </th>
              <th scope="col" className="px-6 py-3 font-semibold">
                Current Usage
              </th>
              <th scope="col" className="px-6 py-3 font-semibold">
                Free Tier Limit
              </th>
              <th scope="col" className="px-6 py-3 font-semibold">
                Est Monthly Cost
              </th>
              <th scope="col" className="px-6 py-3 font-semibold">
                Risk Level
              </th>
              <th scope="col" className="px-6 py-3 font-semibold">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.items.map((item) => (
              <tr key={item.service} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {item.service}
                </td>
                <td className="px-6 py-4">{item.currentUsage}</td>
                <td className="px-6 py-4">{item.freeTierLimit}</td>
                <td className="px-6 py-4 font-bold text-gray-900">
                  ${item.estimatedMonthlyCost.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.riskLevel === "Low"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.riskLevel === "Medium"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {item.riskLevel}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs">{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {awsCostBreakdown && (
        <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            AWS S3 cost breakdown
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Period {awsCostBreakdown.period.start} →{" "}
            {awsCostBreakdown.period.end} ({awsCostBreakdown.periodDays} days).
            Est. monthly = 30-day projection.
          </p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <dt className="text-xs font-medium text-gray-500">
                Total (period)
              </dt>
              <dd className="font-semibold text-gray-900">
                ${awsCostBreakdown.totalCost.toFixed(4)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Storage</dt>
              <dd className="font-semibold text-gray-900">
                ${awsCostBreakdown.storageCost.toFixed(4)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Requests</dt>
              <dd className="font-semibold text-gray-900">
                ${awsCostBreakdown.requestsCost.toFixed(4)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">
                Data transfer
              </dt>
              <dd className="font-semibold text-gray-900">
                ${awsCostBreakdown.dataTransferCost.toFixed(4)}
              </dd>
            </div>
          </dl>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="text-xs font-medium text-gray-500">
              Est. monthly total (S3):{" "}
            </span>
            <span className="text-sm font-bold text-gray-900">
              ${awsCostBreakdown.estimatedMonthlyTotal.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
