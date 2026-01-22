"use client";

/**
 * ProfileSectionContainer
 * - Reads cached user
 * - Reuses Travel Stats view model mapper
 * - Injects totals into ProfileSection as stats props
 */

import ProfileSection from "./ProfileSection";
import type { SidebarProfileData } from "@/views/Profile/sidebar/types";
import { getCachedUser } from "@/api/user";
import { assetUrl } from "@/api/assets";
import { mapUserToTravelStatsVM } from "@/views/Profile/travel-stats/data/mapToViewModel";
import { getEarnedBadges } from "@/views/Profile/sidebar/badgeMap";

type Props = Omit<SidebarProfileData, "stats"> & { className?: string };

export default function ProfileSectionContainer({ className }: Props) {
  const user = getCachedUser();

  const vm = mapUserToTravelStatsVM(user);
  const name = user?.username ?? "User";
  const handle = user?.username ?? "";
  const avatarSrc = assetUrl(user?.profile_picture);

  // Build earned badges (icon + label only)
  const earnedBadges = getEarnedBadges(user?.badgeProgress);

  return (
    <ProfileSection
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
