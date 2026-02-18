"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const MapboxMap = dynamic(() => import("./MapBoxMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] w-full items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-500">
      Loading map…
    </div>
  ),
});

type Geography = {
  countryCodes: string[];
  countryStats: { code: string; value: number }[];
};

type Props = {
  geography: Geography | null;
};

export default function MapFootprint({ geography }: Props) {
  const hasData = geography && geography.countryStats.length > 0;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Your footprint</h2>
        <Link
          href="/profile/my-places"
          className="text-sm font-medium text-[var(--color-main)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 rounded"
        >
          Explore on map
        </Link>
      </div>
      <div className="h-[320px] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
        {hasData ? (
          <MapboxMap
            highlightIso2={geography.countryCodes}
            countryStats={geography.countryStats}
            countryCode={geography.countryStats[0]?.code}
            defaultFocusZoom={2.5}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
            Save places to see your travel footprint
          </div>
        )}
      </div>
    </section>
  );
}
