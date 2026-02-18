"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { SidebarProfileData } from "@/views/Profile/sidebar/types";
import EarnedBadges from "@/views/Profile/sidebar/EarnedBadges";
import TopCountries from "@/views/Profile/components/TopCountries";

const DEFAULT_AVATAR = "/images/profileImg.png";

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

// Added isOpen and onToggle props to handle the sidebar state inside the component
interface ProfileSectionProps extends SidebarProfileData {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export default function ProfileSection({
  name,
  handle,
  avatarSrc,
  stats = [],
  earnedBadges = [],
  topCountries = [],
  isOpen,
  onToggle,
  className,
}: ProfileSectionProps) {
  const [hasError, setHasError] = useState(false);

  const imgSrc =
    !hasError && avatarSrc && avatarSrc.length > 0 ? avatarSrc : DEFAULT_AVATAR;

  const handleError = () => {
    if (!hasError) setHasError(true);
  };
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="placeholder" />;
  }

  return (
    <div
      className={cn(
        "relative", // Parent anchor for the button
        "pl-5 pt-[9px] pb-6 pr-4",
        "rounded-[30px]",
        "bg-[var(--color-bg)]",
        className,
      )}
    >
      {/* Profile Header Row — aligned with page section titles (e.g. Latest Activity) via pt-[15px] = 24px total from sidebar top */}
      <div className="pt-[15px] flex items-center justify-between gap-4">
        {/* Left: Profile Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200">
            <Image
              src={imgSrc}
              alt="Profile"
              width={48}
              height={48}
              onError={handleError}
            />
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold leading-tight">
              {name}
            </div>
            {handle && (
              <div className="truncate text-sm font-normal text-gray-500">
                @{handle}
              </div>
            )}
          </div>
        </div>

        {/* Right: Toggle Button - Only show when sidebar is open */}
        {isOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              onToggle();
            }}
            className="z-[60] flex items-center justify-center transition-all duration-300 ease-in-out hover:opacity-70"
          >
            <Image
              src="/icons/leftPanel.png"
              alt="toggle sidebar"
              width={20}
              height={20}
              className="transition-transform duration-300"
            />
          </button>
        )}
      </div>

      <EarnedBadges earnedBadges={earnedBadges} max={2} size={27} />

      {/* Stats Section */}
      {stats.length > 0 && (
        <div
          className="mt-3 h-[64px] w-[285px] rounded-[13px] flex items-center justify-between pl-[13px] py-[13px]"
          style={{ backgroundColor: "rgba(168, 178, 216, 0.24)" }}
        >
          {stats.map((s, idx) => (
            <div key={s.label} className="flex flex-1 items-center">
              <div className="w-full text-center">
                <div className="truncate text-2xl font-bold text-[var(--color-main)] leading-none">
                  {s.value}
                </div>
                <div className="mt-1 text-[10px] font-normal text-gray-900">
                  {s.label}
                </div>
              </div>
              {idx < stats.length - 1 && (
                <div className="mx-2 h-[36px] w-px bg-[#C9D6FF]" />
              )}
            </div>
          ))}
        </div>
      )}

      <TopCountries countries={topCountries} />
    </div>
  );
}
