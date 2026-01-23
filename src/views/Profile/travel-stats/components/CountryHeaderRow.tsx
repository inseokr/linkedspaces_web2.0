import React from "react";
import Flag from "@/components/ui/Flag";

type Props = {
  country: string;
  countryCode?: string;
  citiesCount: number;
  placesCount: number;
  className?: string;
  rightSlot?: React.ReactNode;
};

export default function CountryHeaderRow({
  country,
  countryCode,
  citiesCount,
  placesCount,
  className = "",
  rightSlot,
}: Props) {
  console.log(`🚩 [CountryHeaderRow] ${country}:`, {
    countryCode,
    citiesCount,
    placesCount,
  });
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex items-start gap-3 min-w-0">
        <div className="shrink-0 mt-[2px]">
          <Flag
            countryCode={countryCode}
            alt={`Flag of ${country}`}
            size={30}
          />
        </div>

        <div className="min-w-0">
          <div className="font-[Inter] font-semibold text-slate-900 truncate">
            {country}
          </div>
          <div className="mt-1 font-[Inter] text-[14px] font-normal tracking-[-0.5px] text-[#8B949E]">
            {citiesCount} cities • {placesCount} places
          </div>
        </div>
      </div>

      <div className="shrink-0">{rightSlot}</div>
    </div>
  );
}
