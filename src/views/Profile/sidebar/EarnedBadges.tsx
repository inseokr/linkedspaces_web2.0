// src/views/Profile/sidebar/EarnedBadges.tsx
"use client";

import Image from "next/image";
import type { EarnedBadge } from "@/views/Profile/sidebar/types";

type Props = {
  earnedBadges?: EarnedBadge[];
  size?: number; // Figma: 27
  max?: number; // show up to N badges
};

export default function EarnedBadges({
  earnedBadges = [],
  size = 27,
  max = 2,
}: Props) {
  const list = earnedBadges.slice(0, max);
  if (list.length === 0) return null;

  return (
    <div className="mt-3 flex items-start gap-4">
      {list.map((b) => (
        <div key={b.key} className="flex flex-col items-center gap-[5px]">
          <div
            className="relative overflow-hidden rounded-full bg-gray-100"
            style={{ width: size, height: size }}
          >
            <Image
              src={b.iconSrc}
              alt={b.label}
              fill
              sizes={`${size}px`}
              className="object-cover"
            />
          </div>

          <span className="text-[8px] font-normal leading-none whitespace-nowrap">
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
}
