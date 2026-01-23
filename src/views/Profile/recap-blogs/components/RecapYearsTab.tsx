import React from "react";

export type RecapYearValue = "ALL" | number;

type Props = {
  value: RecapYearValue;
  years: number[]; // ex) [2026, 2025, 2024, 2023]
  onChange: (v: RecapYearValue) => void;
  className?: string;
};

export default function RecapYearTabs({
  value,
  years,
  onChange,
  className = "",
}: Props) {
  const options: RecapYearValue[] = ["ALL", ...years];

  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full bg-slate-100 p-1",
        className,
      ].join(" ")}
      role="tablist"
      aria-label="Recap year filter"
    >
      {options.map((opt) => {
        const selected = opt === value;
        return (
          <button
            key={String(opt)}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt)}
            className={[
              "rounded-full px-5 py-2 text-[13px] font-semibold leading-none transition",
              selected
                ? "bg-[#4C7DFF] text-white shadow-sm"
                : "text-slate-400 hover:text-slate-700",
              "focus:outline-none focus:ring-2 focus:ring-blue-400/40",
            ].join(" ")}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
