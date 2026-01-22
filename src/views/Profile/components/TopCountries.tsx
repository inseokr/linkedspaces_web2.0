"use client";

import type { CountryVisited } from "@/api/user";
import Flag from "@/components/ui/Flag";

type Props = {
  countries?: CountryVisited[];
};

function getCountryName(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return "Unknown";
  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    return displayNames.of(countryCode.toUpperCase()) || countryCode;
  } catch {
    return countryCode ?? "Unknown";
  }
}

function CountryPill({ country }: { country: CountryVisited }) {
  const countryCode = country?.countryCode?.toUpperCase();
  const countryName = getCountryName(countryCode);

  return (
    <div className="inline-flex items-center gap-[5px] rounded-[26px] bg-[#F6F6F6] py-[7px] px-[15px]">
      <div className="w-6 flex items-center justify-center">
        <Flag
          countryCode={countryCode}
          alt={`Flag of ${countryName}`}
          size={24}
        />
      </div>

      <span className="text-xs text-[#3C3E41] font-semibold truncate">
        {countryName}
      </span>
    </div>
  );
}

export default function TopCountries({ countries = [] }: Props) {
  if (!countries.length) return null;

  return (
    <div className="mt-3">
      <div className="text-xs font-medium text-gray-500">Top countries:</div>
      <div className="mt-2 flex gap-3">
        {countries.map((c) => (
          <CountryPill
            key={c._id ?? `${c.country}-${c.countryCode}`}
            country={c}
          />
        ))}
      </div>
    </div>
  );
}
