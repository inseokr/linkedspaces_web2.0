import React from "react";

type Props = {
  country: string;
  flagEmoji?: string;
  citiesCount: number;
  placesCount: number;
  className?: string;
  rightSlot?: React.ReactNode; // chevron 같은 거 꽂기용
};

export default function CountryHeaderRow({
  country,
  flagEmoji,
  citiesCount,
  placesCount,
  className = "",
  rightSlot,
}: Props) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex items-start gap-3 min-w-0">
        <span className="text-xl leading-none mt-[2px]">
          {flagEmoji ?? "🏳️"}
        </span>

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
