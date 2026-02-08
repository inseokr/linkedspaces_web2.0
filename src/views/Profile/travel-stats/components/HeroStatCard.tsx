"use client";

import { useEffect, useState } from "react";

type Props = {
  value: number | string;
  label: string;
  subtext?: string;
  icon?: React.ReactNode;
  /** Run count-up animation on first mount (only for numbers) */
  animate?: boolean;
};

function formatValue(v: number | string): string {
  if (typeof v === "number") {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return v.toLocaleString();
    return String(v);
  }
  return String(v);
}

export default function HeroStatCard({
  value,
  label,
  subtext,
  icon,
  animate = true,
}: Props) {
  const [display, setDisplay] = useState<number | string>(
    typeof value === "number" && animate ? 0 : value,
  );
  const isNumber = typeof value === "number";
  const target = isNumber ? value : 0;
  const shouldAnimate = animate && isNumber && target !== 0;
  const effectiveDisplay = shouldAnimate ? display : value;

  useEffect(() => {
    if (!shouldAnimate) return;
    const duration = 800;
    const start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - t) * (1 - t); // easeOutQuad
      setDisplay(Math.round(start + (target - start) * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [shouldAnimate, target]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-2xl font-bold tabular-nums text-gray-900 sm:text-3xl">
            {formatValue(effectiveDisplay)}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-600">{label}</p>
          {subtext && <p className="mt-0.5 text-xs text-gray-500">{subtext}</p>}
        </div>
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
