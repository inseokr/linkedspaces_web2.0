"use client";

import React from "react";
import RecapDayTabs, { type DayTab } from "@/views/Trip/component/RecapDayTabs";

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
    <div className={["bg-transparent", className].join(" ")}>
      <RecapDayTabs
        tabs={dayTabs}
        activeId={activeDayId}
        onChange={onDayChange}
      />
    </div>
  );
}
