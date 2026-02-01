//CountryRecapCard.tsx

// "use client";

// import Image from "next/image";
// import Link from "next/link";

// export type CountryRecapItem = {
//   id: string;
//   countryName: string;
//   coverImageUrl: string;
//   years: number[];
//   href: string; //이동 경로 필수
// };

// function formatYears(years: number[]) {
//   const uniq = Array.from(new Set(years)).sort((a, b) => b - a);
//   return uniq.join(", ");
// }

// export default function CountryRecapCard({ item }: { item: CountryRecapItem }) {
//   return (
//     <Link
//       href={item.href}
//       className={[
//         "group relative block w-full max-w-[500px] overflow-hidden rounded-3xl",
//         "border border-black/5 shadow-sm",
//         "focus:outline-none focus:ring-2 focus:ring-blue-400/40",
//       ].join(" ")}
//     >
//       {/* 이미지 */}
//       <div className="relative aspect-[5/4] w-full">
//         <Image
//           src={item.coverImageUrl}
//           alt={item.countryName}
//           fill
//           className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
//           sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
//       </div>

//       {/* 텍스트 오버레이 */}
//       <div className="absolute inset-0 flex items-end justify-center pb-6 text-center">
//         <div className="px-4">
//           <div className="text-[24px] font-semibold tracking-[-0.4px] text-white drop-shadow">
//             {item.countryName}
//           </div>
//           <div className="mt-1 text-[13px] font-semibold text-white/90 drop-shadow">
//             {formatYears(item.years)}
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// }

// CountryRecapCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";

export type CountryRecapItem = {
  id: string;
  countryCode: string; //추가 (어떤 나라 클릭인지)
  countryName: string;
  coverImageUrl: string;
  years: number[];
  href: string;
  /** Latest trip date range for this country (e.g. "Aug 3 ~ Aug 5, 2025") */
  latestTripDateLabel?: string;
};

type Props = {
  item: CountryRecapItem & { countryCode?: string };
  onSelect?: (countryCode: string) => void;
  showTripSummary?: boolean;
};

function formatYearsSummary(years: number[]): {
  display: string;
  full: string;
} {
  const uniq = Array.from(new Set(years))
    .map((y) => Number(y))
    .filter((y) => Number.isFinite(y))
    .sort((a, b) => b - a);

  const full = uniq.join(", ");
  if (uniq.length <= 3) return { display: full, full };

  // Keep it short: "2026 · 2025 · +4"
  const head = uniq.slice(0, 2).join(" · ");
  const rest = uniq.length - 2;
  return { display: `${head} · +${rest}`, full };
}

export default function CountryRecapCard({
  item,
  onSelect,
  // Default to hidden; caller opts-in (e.g. when a specific year is selected).
  showTripSummary = false,
}: Props) {
  const { src, unoptimized } = normalizeImageSrc(item.coverImageUrl);
  const code = (item.countryCode ?? item.id ?? "").toString().trim();
  const yearsSummary = formatYearsSummary(item.years);
  const latestTripDateLabel = String(item.latestTripDateLabel ?? "").trim();
  return (
    <Link
      href={item.href}
      onClick={(e) => {
        if (onSelect) {
          e.preventDefault();
          if (code) onSelect(code);
        }
      }}
      className={[
        "group relative block w-full max-w-[500px] overflow-hidden rounded-3xl",
        "border border-black/5 shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-blue-400/40",
      ].join(" ")}
    >
      {/* 이미지 */}
      <div className="relative aspect-[5/4] w-full">
        <Image
          src={src}
          alt={item.countryName}
          unoptimized={unoptimized}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={(e) => {
            console.log("[CardRender] image error:", src, e);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
      </div>

      {/* 텍스트 오버레이 */}
      <div className="absolute inset-0 flex items-end justify-center pb-6 text-center">
        <div className="px-4">
          <div className="text-[24px] font-semibold tracking-[-0.4px] text-white drop-shadow">
            {item.countryName}
          </div>
          {/* Prefer showing latest trip date range when available */}
          {!!latestTripDateLabel ? (
            <div className="mt-2 flex justify-center">
              <div
                className={[
                  "max-w-[320px]",
                  "truncate whitespace-nowrap",
                  "rounded-full",
                  "border border-white/20",
                  "bg-black/35 px-3 py-1.5",
                  "text-[12px] font-semibold leading-none text-white/90",
                  "shadow-[0_10px_24px_rgba(0,0,0,0.25)]",
                  "backdrop-blur-sm",
                ].join(" ")}
                title={latestTripDateLabel}
              >
                {latestTripDateLabel}
              </div>
            </div>
          ) : (
            showTripSummary && (
              <div className="mt-2 flex justify-center">
                <div
                  className={[
                    "max-w-[260px]",
                    "truncate whitespace-nowrap",
                    "rounded-full",
                    "border border-white/20",
                    "bg-black/35 px-3 py-1.5",
                    "text-[12px] font-semibold leading-none text-white/90",
                    "shadow-[0_10px_24px_rgba(0,0,0,0.25)]",
                    "backdrop-blur-sm",
                  ].join(" ")}
                  title={yearsSummary.full}
                >
                  {yearsSummary.display}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </Link>
  );
}
