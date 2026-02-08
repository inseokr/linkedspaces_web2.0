import React from "react";
import CountryStatCard from "@/views/Profile/travel-stats/components/MostVisited";

export type CountryStat = {
  country: string;
  visits: number;
  subtitle?: string;
  countryCode?: string;
};

type Props = {
  items: CountryStat[];
  className?: string;
};

export default function MostVisitedSection({ items, className = "" }: Props) {
  return (
    <section className={`space-y-4 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900">Top 3 Countries</h2>

      <div className="space-y-2 w-full">
        {items.map((item, idx) => (
          <CountryStatCard
            key={item.country}
            country={item.country}
            visits={item.visits}
            subtitle={item.subtitle}
            countryCode={item.countryCode}
            highlight={idx === 0}
            className="w-full"
          />
        ))}
      </div>
    </section>
  );
}
