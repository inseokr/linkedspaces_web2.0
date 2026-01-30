"use client";

import React from "react";
import RecapDayTabs, {
  type DayTab,
} from "@/views/Profile/Trip/component/RecapDayTabs";

type Props = {
  dayTabs: DayTab[];
  activeDayId: string;
  onDayChange: (id: string) => void;
  className?: string;
};

export default function GuestRecapTopBar({
  dayTabs,
  activeDayId,
  onDayChange,
  className = "",
}: Props) {
  return (
    <div
      className={[
        "inline-flex",
        "rounded-full bg-white/70 backdrop-blur-md",
        "border border-white/40",
        "px-2 py-2",
        className,
      ].join(" ")}
    >
      <RecapDayTabs
        tabs={dayTabs}
        activeId={activeDayId}
        onChange={onDayChange}
      />
    </div>
  );
}
