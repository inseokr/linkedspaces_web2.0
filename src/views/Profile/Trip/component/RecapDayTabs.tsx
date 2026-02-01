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
        "flex max-w-full items-center gap-2 overflow-x-auto",
        "[-webkit-overflow-scrolling:touch]",
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
              "shrink-0 rounded-full font-semibold",
              baseButton,
              "transition-colors",
              active
                ? "bg-[#0798FF] text-white shadow-sm"
                : "bg-black/10 text-black/55 hover:bg-black/15",
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
