"use client";

import React, { useId, useState } from "react";
import CountryHeaderRow from "@/views/Profile/travel-stats/components/CountryHeaderRow";
import CityRow from "@/views/Profile/travel-stats/components/CityRow";

// city row, country header row 포함하는 컴포넌트

export type CityStat = { city: string; places: number };

type Props = {
  country: string;
  flagEmoji?: string;
  citiesCount: number;
  placesCount: number;
  cities: CityStat[];
  className?: string;
  defaultOpen?: boolean; // 처음에 펼쳐둘지 (옵션)
};

export default function CountryAccordionUI({
  country,
  flagEmoji,
  citiesCount,
  placesCount,
  cities,
  className = "",
  defaultOpen = true,
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div
      className={[
        "w-[90%] rounded-2xl border border-slate-200 bg-white shadow-sm",
        "px-6 py-5",
        className,
      ].join(" ")}
    >
      {/* Header (clickable) */}
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <CountryHeaderRow
          country={country}
          flagEmoji={flagEmoji}
          citiesCount={citiesCount}
          placesCount={placesCount}
          rightSlot={
            <span
              className={[
                "text-[#8B949E] inline-block transition-transform duration-200 text-[20px]",
                isOpen ? "rotate-180" : "rotate-0",
              ].join(" ")}
            >
              ⌄
            </span>
          }
        />
      </button>

      {/* Cities (collapsible) */}
      {isOpen ? (
        <>
          <div className="my-4 h-px bg-slate-200" />

          <div id={panelId}>
            {cities.map((c) => (
              <CityRow key={c.city} city={c.city} places={c.places} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
