// src/views/Profile/badges/badgeMap.ts
import type { BadgeKey, BadgeProgress } from "@/api/user";

export const BADGE_UI: Record<BadgeKey, { label: string; iconSrc: string }> = {
  foodie: { label: "Foodie", iconSrc: "/images/badges/Badge_foodie.png" },
  mountainClimber: {
    label: "Mountain Climber",
    iconSrc: "/images/badges/Badge_mountain_climber.png",
  },
  cityHopper: {
    label: "City Hopper",
    iconSrc: "/images/badges/Badge_cityscape.png",
  },
  backpacker: {
    label: "Backpacker",
    iconSrc: "/images/badges/Badge_backpack.png",
  },
  sunsetChaser: {
    label: "Sunset Chaser",
    iconSrc: "/images/badges/Badge_sunset_chaser.png",
  },
  nightOwl: {
    label: "Night Owl",
    iconSrc: "/images/badges/Badge_night_owl.png",
  },
  wilderness: {
    label: "Wilderness",
    iconSrc: "/images/badges/Badge_wilderness.png",
  },
};

export function getEarnedBadges(progress?: BadgeProgress | null) {
  const badges = progress?.badges ?? {};
  return (Object.keys(BADGE_UI) as BadgeKey[])
    .filter((key) => badges[key]?.completed)
    .map((key) => ({
      key,
      label: badges[key]?.name?.trim() || BADGE_UI[key].label,
      iconSrc: BADGE_UI[key].iconSrc,
    }));
}
