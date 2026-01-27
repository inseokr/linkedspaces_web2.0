import React from "react";
import Flag from "@/components/ui/Flag";

export type CountryStatCardProps = {
  country: string;
  visits: number;
  countryCode?: string;
  subtitle?: string;
  highlight?: boolean;
  className?: string;
};

export default function CountryStatCard({
  country,
  visits,
  subtitle,
  countryCode,
  highlight = false,
  className = "",
}: CountryStatCardProps) {
  console.log("[mostvisited] ${countryCode}");
  const base =
    "w-[90%] rounded-2xl border border-slate-200 bg-white shadow-sm " +
    "px-5 py-4 flex items-center justify-between gap-2 " +
    "transition hover:shadow-md hover:-translate-y-[1px]";

  const highlighted =
    "bg-gradient-to-r from-[#0798FF]/90 via-[#0798FF]/12 to-white";

  return (
    <div className={`${base} ${highlight ? highlighted : ""} ${className}`}>
      {/* Left */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
          <Flag
            countryCode={countryCode?.toUpperCase()}
            alt={`${country} flag`}
            size={36}
          />
        </div>

        <div className="min-w-0">
          <h3 className="font-[Inter] font-semibold text-slate-900 truncate">
            {country}
          </h3>
          {subtitle ? (
            <p className="text-sm text-slate-500 truncate">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {/* Right */}
      <div className="text-right shrink-0 pr-4">
        <div
          className={[
            "text-2xl font-bold leading-none",
            highlight ? "text-[#0798FF]" : "text-slate-900",
          ].join(" ")}
        >
          {visits}
        </div>
        <div className="text-sm text-slate-500">visits</div>
      </div>
    </div>
  );
}
