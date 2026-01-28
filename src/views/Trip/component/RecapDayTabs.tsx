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
  className?: string;
};

export default function RecapDayTabs({
  tabs,
  activeId,
  onChange,
  className = "",
}: Props) {
  return (
    <div className={["flex items-center gap-2", className].join(" ")}>
      {tabs.map((t) => {
        const active = t.id === activeId;

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={[
              "h-9 rounded-full px-4 text-[14px] font-semibold",
              "transition",
              active
                ? "bg-indigo-500 text-white shadow-sm"
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
