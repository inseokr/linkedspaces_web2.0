"use client";

import {
  MapPin,
  CalendarDays,
  Building2,
  Globe,
  BookOpen,
  Route,
} from "lucide-react";
import type { HeadlineStats } from "@/views/Profile/travel-stats/statsTypes";
import HeroStatCard from "./HeroStatCard";

type Props = {
  stats: HeadlineStats;
  onStatClick?: (key: string) => void;
};

export default function HeroStatCards({ stats, onStatClick }: Props) {
  const cards: {
    key: string;
    value: number | string;
    label: string;
    subtext?: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "places",
      value: stats.totalPlacesSaved,
      label: "Places",
      subtext: "saved",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      key: "days",
      value: stats.daysExplored,
      label: "days",
      subtext: "recorded",
      icon: <CalendarDays className="h-5 w-5" />,
    },
    {
      key: "cities",
      value: stats.citiesVisitedCount,
      label: "Cities",
      subtext: "visited",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      key: "countries",
      value: stats.countriesVisitedCount,
      label: "Countries",
      subtext: "visited",
      icon: <Globe className="h-5 w-5" />,
    },
    {
      key: "recaps",
      value: stats.recapBlogsCreatedCount,
      label: "Recap blogs",
      subtext: "created",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      key: "distance",
      value: stats.estimatedDistanceMiles,
      label: "Distance",
      subtext: "miles between places",
      icon: <Route className="h-5 w-5" />,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.key}
          className={onStatClick ? "cursor-pointer" : ""}
          onClick={onStatClick ? () => onStatClick(card.key) : undefined}
          onKeyDown={
            onStatClick
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") onStatClick(card.key);
                }
              : undefined
          }
          role={onStatClick ? "button" : undefined}
          tabIndex={onStatClick ? 0 : undefined}
        >
          <HeroStatCard
            value={card.value}
            label={card.label}
            subtext={card.subtext}
            icon={card.icon}
            animate
          />
        </div>
      ))}
    </div>
  );
}
