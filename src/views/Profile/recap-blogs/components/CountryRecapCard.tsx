//카드 하나

"use client";

import Image from "next/image";
import Link from "next/link";

export type CountryRecapItem = {
  id: string;
  countryName: string;
  coverImageUrl: string;
  years: number[];
  href: string; //이동 경로 필수
};

function formatYears(years: number[]) {
  const uniq = Array.from(new Set(years)).sort((a, b) => b - a);
  return uniq.join(", ");
}

export default function CountryRecapCard({ item }: { item: CountryRecapItem }) {
  const src = item.coverImageUrl;
  const unoptimized =
    src?.toLowerCase().endsWith(".heic") ||
    src?.toLowerCase().endsWith(".heif");
  return (
    <Link
      href={item.href}
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
          <div className="mt-1 text-[13px] font-semibold text-white/90 drop-shadow">
            {formatYears(item.years)}
          </div>
        </div>
      </div>
    </Link>
  );
}
