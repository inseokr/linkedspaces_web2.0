import Image from "next/image";
import { SidebarProfileData } from "@/views/Profile/sidebar/types";

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
  return (
    <div className={cn("p-6", className)}>
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-200">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={`${name} avatar`}
              width={48}
              height={48}
              className="object-cover rounded-full"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-black-200 rounded-full" />
          )}
        </div>

        <div className="min-w-0">
          <div className="truncate text-lg  font-semibold">{name}</div>
          {handle ? (
            <div className="truncate text-sm font-normal">@{handle}</div>
          ) : null}
        </div>
      </div>

      {stats.length ? (
        <div className="mt-3 w-full flex gap-4 items-center justify-between pt-3">
          {stats.map((s) => (
            <div key={s.label} className="min-w-[80px] shrink-0 text-center">
              <div className="truncate text-[var(--color-main)] text-2xl font-bold">
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
