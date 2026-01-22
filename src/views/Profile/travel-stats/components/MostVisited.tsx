import React from "react";

export type CountryStatCardProps = {
  country: string;
  visits: number;
  subtitle?: string;
  flagEmoji?: string;
  flagSrc?: string;
  highlight?: boolean;
  className?: string;
};

export default function CountryStatCard({
  country,
  visits,
  subtitle,
  flagEmoji,
  flagSrc,
  highlight = false,
  className = "",
}: CountryStatCardProps) {
  const base =
    "w-[85%] rounded-2xl border border-slate-200 bg-white shadow-sm " + // 가로 크기 수정
    "px-5 py-4 flex items-center justify-between gap-2 " + // 조금 작게
    "transition hover:shadow-md hover:-translate-y-[1px]";

  // 강조
  const highlighted =
    "bg-gradient-to-r from-[#0798FF]/90 via-[#0798FF]/12 to-white";

  return (
    <div className={`${base} ${highlight ? highlighted : ""} ${className}`}>
      {/* Left */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
          {flagSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={flagSrc}
              alt={`${country} flag`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xl leading-none">{flagEmoji ?? "🏳️"}</span>
          )}
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
            "text-2xl font-bold leading-none", //숫자 크기/굵기/라인높이 (항상 적용)
            highlight ? "text-[#0798FF]" : "text-slate-900", //highlight면 파랑, 아니면 검정
          ].join(" ")}
        >
          {visits}
        </div>
        <div className="text-sm text-slate-500">visits</div>
      </div>
    </div>
  );
}
