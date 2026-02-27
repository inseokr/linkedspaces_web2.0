//day tab
"use client";

import React from "react";

export type DayTab = {
  id: string; // "day-1"
  label: string; // "Day 1"
};

type Props = {
  tabs: DayTab[];
  activeId: string;
  onChange: (id: string) => void;
  size?: "md" | "sm";
  className?: string;
};

export default function RecapDayTabs({
  tabs,
  activeId,
  onChange,
  size = "md",
  className = "",
}: Props) {
  const baseButton =
    size === "sm" ? "h-7 px-3 text-[13px]" : "h-8 px-4 text-[14px]";

  return (
    <div
      className={[
        "flex max-w-full items-center gap-2 overflow-x-auto overflow-y-hidden",
        "[-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        "px-0.5 py-1", // small padding so scale/shadow isn't clipped
        className,
      ].join(" ")}
    >
      {tabs.map((t) => {
        const active = t.id === activeId;

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={[
              "shrink-0 rounded-full font-bold transition-all duration-200",
              baseButton,
              active
                ? "bg-black text-white shadow-md scale-[1.02]"
                : "bg-black/[0.04] text-black/40 hover:bg-black/[0.08] hover:text-black/60",
            ].join(" ")}
            aria-pressed={active}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
