"use client";

export type DayValue = `day${number}`;
export type DayTab = { value: DayValue; label: string };

// day 계산 유틸
export function parseISOToUTCMidnight(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function getTripDayCountInclusive(fromISO: string, toISO?: string) {
  const from = parseISOToUTCMidnight(fromISO);
  const to = parseISOToUTCMidnight(toISO ?? fromISO);

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((to.getTime() - from.getTime()) / msPerDay);

  return Math.max(1, diffDays + 1); // 포함 계산
}

export default function DayTabs({
  items,
  value,
  onChange,
  className = "",
}: {
  items: DayTab[];
  value: DayValue;
  onChange: (v: DayValue) => void;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex max-w-full items-center gap-2 overflow-x-auto",
        className,
      ].join(" ")}
    >
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            onClick={() => onChange(it.value)}
            className={[
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold",
              active
                ? "bg-blue-500 text-white"
                : "bg-black/10 text-black/60 hover:bg-black/15",
            ].join(" ")}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
