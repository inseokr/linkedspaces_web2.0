import type { BadgeKey, CountryVisited } from "@/api/user";

export type SidebarStat = {
  label: string;
  value: number | string;
};

export type EarnedBadge = {
  key: BadgeKey;
  label: string;
  iconSrc: string;
};

export type SidebarProfileData = {
  name: string;
  handle?: string;
  avatarSrc?: string;
  earnedBadges?: EarnedBadge[];
  stats?: SidebarStat[];
  topCountries?: CountryVisited[];
};

export type SidebarNavItem = {
  key: string;
  label: string;
  href: string;
  iconSrc: string;
  disabled?: boolean;
};
