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

export type CountryRecapItem = {
  id: string;
  countryCode: string; //추가 (어떤 나라 클릭인지)
  countryName: string;
  coverImageUrl: string;
  years: number[];
  href: string;
};

type Props = {
  item: CountryRecapItem;
  onSelect?: (countryCode: string) => void; //추가
};

function formatYears(years: number[]) {
  const uniq = Array.from(new Set(years)).sort((a, b) => b - a);
  return uniq.join(", ");
}

export default function CountryRecapCard({ item, onSelect }: Props) {
  return (
    <Link
      href={item.href}
      onClick={(e) => {
        //onSelect가 있으면 "이동" 대신 "선택"으로 처리
        if (onSelect) {
          e.preventDefault(); // 라우팅 막음?아마도
          onSelect(item.countryCode); // 선택 정보 넘김
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
          src={item.coverImageUrl}
          alt={item.countryName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
