import { CostDashboardMetrics } from "../types";

export function CostDashboard({ data }: { data: CostDashboardMetrics }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        3. Cost Dashboard
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Current costs and free tier limits across services.
      </p>

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
    </section>
  );
}
