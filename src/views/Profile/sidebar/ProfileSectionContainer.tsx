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

// Reuse the same mapping logic used by Travel Stats page
import { mapUserToTravelStatsVM } from "@/views/Profile/travel-stats/data/mapToViewModel";
import { API_ORIGIN } from "@/api/client";

type Props = Omit<SidebarProfileData, "stats"> & { className?: string };

export default function ProfileSectionContainer({ className }: Props) {
  const user = getCachedUser();
  console.log(user);

  const raw = user?.profile_picture ?? "";
  const vm = mapUserToTravelStatsVM(user);
  const name = user?.username ?? "User";
  const handle = user?.username ?? "";
  const avatarSrc =
    raw && raw.startsWith("http")
      ? raw
      : raw
        ? `${API_ORIGIN}${raw.startsWith("/") ? "" : "/"}${raw}`
        : "";

  return (
    <ProfileSection
      name={name}
      handle={handle}
      avatarSrc={avatarSrc}
      className={className}
      stats={[
        { label: "Countries", value: vm.totals.countries },
        { label: "Cities", value: vm.totals.cities },
        { label: "Places", value: vm.totals.places },
      ]}
    />
  );
}
