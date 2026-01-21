import Image from "next/image";
import { useState } from "react";
import { SidebarProfileData } from "@/views/Profile/sidebar/types";

const DEFAULT_AVATAR = "/images/profileImg.png";

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export default function ProfileSection({
  name,
  handle,
  avatarSrc,
  stats = [],
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
    <div className={cn("p-6", className)}>
      <div className="flex items-center gap-4">
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

      {stats.length ? (
        <div className="mt-3 flex w-full items-center justify-between gap-4 pt-3">
          {stats.map((s) => (
            <div key={s.label} className="min-w-[80px] shrink-0 text-center">
              <div className="truncate text-2xl font-bold text-[var(--color-main)]">
                {s.value}
              </div>
              <div className="text-xs font-normal">{s.label}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
