import React from "react";
import CountryStatCard from "@/views/Profile/travel-stats/components/MostVisited";

export type CountryStat = {
  country: string;
  visits: number;
  subtitle?: string;
  flagEmoji?: string;
  flagSrc?: string;
};

type Props = {
  items: CountryStat[];
  className?: string;
};

export default function MostVisitedSection({ items, className = "" }: Props) {
  return (
    <section className={`space-y-2 ${className}`}>
      <h2 className="ml-12 font-[Inter] text-[18px] font-semibold leading-[28px] tracking-[-0.5px] text-[#7C7C7C]">
        Most Visited
      </h2>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <CountryStatCard
            key={item.country}
            country={item.country}
            visits={item.visits}
            subtitle={item.subtitle}
            flagEmoji={item.flagEmoji}
            flagSrc={item.flagSrc}
            highlight={idx === 0} // 첫 번째만 강조
            className="ml-12" // Most Visited 섹션에서만 오른쪽 이동
          />
        ))}
      </div>
    </section>
  );
}
