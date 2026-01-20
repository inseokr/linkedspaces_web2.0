import { ReactNode } from "react";

export type SidebarStat = {
  label: string;
  value: number | string;
};

export type SidebarProfileData = {
  name: string;
  handle?: string;
  avatarSrc?: string;
  stats?: SidebarStat[];
};

export type SidebarNavItem = {
  key: string;
  label: string;
  href: string;
  iconSrc: string;
  disabled?: boolean;
};
