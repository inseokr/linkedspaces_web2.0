import React from "react";

type Props = {
  city: string;
  places: number;
  className?: string;
};

export default function CityRow({ city, places, className = "" }: Props) {
  return (
    <div className={`flex items-center justify-between py-3 ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[16px] leading-[24px] text-[#E46A2E]">📍</span>
        <span className="truncate font-[Inter] text-[16px] font-normal tracking-[-0.5px] text-black">
          {city}
        </span>
      </div>

      <span className="shrink-0 font-[Inter] text-[14px] font-normal tracking-[-0.5px] text-[#8B949E]">
        {places} places
      </span>
    </div>
  );
}
