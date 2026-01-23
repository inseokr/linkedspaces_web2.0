import React from "react";
import CountryAccordionUI, {
  CityStat,
} from "@/views/Profile/travel-stats/components/CountryAccordionUI";

export type CountryDetail = {
  country: string;
  countryCode?: string;
  citiesCount: number;
  placesCount: number;
  cities: CityStat[];
};

type Props = {
  items: CountryDetail[];
  className?: string;
};

export default function AllCountriesSection({ items, className = "" }: Props) {
  return (
    <section className={`space-y-4 ${className}`}>
      <h2 className="ml-12 font-[Inter] text-[18px] font-semibold leading-[28px] tracking-[-0.5px] text-[#7C7C7C]">
        All Countries
      </h2>

      <div className="space-y-4">
        {items.map((c) => (
          <CountryAccordionUI
            key={`${c.country}-${c.countryCode ?? ""}`}
            country={c.country}
            countryCode={c.countryCode}
            citiesCount={c.citiesCount}
            placesCount={c.placesCount}
            cities={c.cities}
            className="ml-12 w-[85%]"
          />
        ))}
      </div>
    </section>
  );
}
