import React from "react";

// 이미지
import Image from "next/image";
import graphIcon from "@/assets/icons/graph.svg";

type Props = {
  deltaPlaces: number;
  comparedTo?: string;
  className?: string;
};

export default function OverallJourney({
  deltaPlaces,
  comparedTo = "last month",
  className = "",
}: Props) {
  const highlighted =
    "bg-gradient-to-r from-[#0798FF]/90 via-[#0798FF]/12 to-white";

  return (
    <div
      className={[
        "flex items-center gap-0",
        "rounded-2xl border border-slate-200",
        "bg-gradient-to-r from-[#0798FF]/90 via-[#0798FF]/12 to-white",
        "px-3 py-1 shadow-sm",
        className,
      ].join(" ")}
    >
      {/* icon */}
      <div className="flex h-9 w-6 items-center">
        <Image src={graphIcon} alt="" width={18} height={18} />
      </div>

      {/* text */}
      <p className="font-[Inter] text-[14px] font-normal leading-[20px] tracking-[-0.5px] text-[#636363]">
        You&apos;ve explored{" "}
        <span className="font-semibold text-[#0798FF]">
          {deltaPlaces} more places
        </span>{" "}
        than {comparedTo}
      </p>
    </div>
  );
}
