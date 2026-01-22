import Image from "next/image";
import { useState } from "react";
import { SidebarProfileData } from "@/views/Profile/sidebar/types";
import EarnedBadges from "@/views/Profile/sidebar/EarnedBadges";
import TopCountries from "../components/TopCountries";

const DEFAULT_AVATAR = "/images/profileImg.png";

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export default function ProfileSection({
  name,
  handle,
  avatarSrc,
  stats = [],
  earnedBadges = [],
  topCountries = [],
  className,
}: SidebarProfileData & { className?: string }) {
  const [hasError, setHasError] = useState(false);

  const imgSrc =
    !hasError && avatarSrc && avatarSrc.length > 0 ? avatarSrc : DEFAULT_AVATAR;

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  return (
    <div
      className={cn(
        "pl-5 pt-9 pb-6 pr-4",
        "rounded-[30px]",
        "bg-[var(--color-bg)]",
        className,
      )}
    >
      <div className="pt-[15px] flex items-center gap-4">
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-200">
          <Image
            src={imgSrc}
            alt={"Profile picture"}
            width={48}
            height={48}
            onError={handleError}
            priority={false}
          />
        </div>

        <div className="min-w-0">
          <div className="truncate text-lg font-semibold">{name}</div>
          {handle ? (
            <div className="truncate text-sm font-normal">@{handle}</div>
          ) : null}
        </div>
      </div>
      {/* Earned badges (icon + label) */}

      <EarnedBadges earnedBadges={earnedBadges} max={2} size={27} />

      {stats.length ? (
        <div
          className="
            mt-3 h-[64px] w-[285px]
            rounded-[13px]
            flex items-center justify-between
            px-[13px] py-[13px]
          "
          style={{
            backgroundColor: "rgba(168, 178, 216, 0.24)",
            borderRadius: 13,
            border: "0 solid #E5E7EB",
          }}
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

              {idx < stats.length - 1 ? (
                <div className="mx-2 h-[36px] w-px bg-[#C9D6FF]" />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      <TopCountries countries={topCountries} />
    </div>
  );
}
