"use client";

import { useState, useMemo } from "react";
import ProfileSection from "./ProfileSection";
import type { SidebarProfileData } from "@/views/Profile/sidebar/types";
import { getCachedUser } from "@/api/user";
import { assetUrl } from "@/api/assets";
import { mapUserToTravelStatsVM } from "@/views/Profile/travel-stats/mappers/mapToViewModel";
import { getEarnedBadges } from "@/views/Profile/sidebar/badgeMap";

// Added isOpen and onToggle to the Props type
type Props = {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
};

export default function ProfileSectionContainer({
  isOpen,
  onToggle,
  className,
}: Props) {
  const [user] = useState<any | null>(() => getCachedUser());

  const vm = useMemo(() => mapUserToTravelStatsVM(user), [user]);
  const name = user?.username ?? "User";
  const handle = user?.username ?? "";
  const avatarSrc = assetUrl(user?.profile_picture);

  // Build earned badges (icon + label only)
  const earnedBadges = getEarnedBadges(user?.badgeProgress);

  return (
    <ProfileSection
      isOpen={isOpen}
      onToggle={onToggle}
      name={name}
      handle={handle}
      avatarSrc={avatarSrc}
      className={className}
      earnedBadges={earnedBadges}
      stats={[
        { label: "COUNTRIES", value: vm.totals.countries },
        { label: "CITIES", value: vm.totals.cities },
        { label: "PLACES", value: vm.totals.places },
      ]}
      topCountries={vm.topCountries}
    />
  );
}
