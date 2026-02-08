"use client";

import type { PeopleAndPatterns } from "@/views/Profile/travel-stats/statsTypes";

type Props = {
  data: PeopleAndPatterns | null;
};

export default function PeopleAndPatternsSection({ data }: Props) {
  if (!data) return null;
  const { coExploredCount, soloVsGroupRatio } = data;
  const hasCoExplore = coExploredCount > 0;
  const soloLabel =
    soloVsGroupRatio >= 0.8
      ? "Mostly solo"
      : soloVsGroupRatio >= 0.5
        ? "Mix of solo & group"
        : "Mostly with others";

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">People & patterns</h2>
      <div className="flex flex-wrap gap-3">
        {hasCoExplore && (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Explored with</p>
            <p className="text-xl font-bold text-gray-900">
              {coExploredCount} people
            </p>
          </div>
        )}
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Exploration style</p>
          <p className="text-xl font-bold text-gray-900">{soloLabel}</p>
        </div>
      </div>
    </section>
  );
}
