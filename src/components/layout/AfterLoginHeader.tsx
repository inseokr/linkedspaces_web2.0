"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/layout/UserMenu";

import { useLayoutMode } from "@/components/layout/LayoutModeContext";

const NAV_TABS = [
  { label: "Home", href: "/home" },
  { label: "Explore", href: "/explore" },
  { label: "Profile", href: "/profile/my-places" },
] as const;

export function AfterLoginHeader() {
  const { layoutMode } = useLayoutMode();
  const pathname = usePathname();

  const hideTopbar = layoutMode === "bare";

  if (hideTopbar) return null;

  const isActive = (href: string) => {
    if (href === "/profile/my-places")
      return (
        (pathname === "/profile" || pathname?.startsWith("/profile/")) ?? false
      );
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-[var(--header-border)] bg-[var(--header-bg)] backdrop-blur supports-[backdrop-filter]:bg-[var(--header-bg)] shadow-[var(--header-shadow)]">
      <div className="mx-auto h-[77px] flex items-center pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-10 lg:pr-10 gap-4 sm:gap-6">
        <Link href="/home" className="flex items-center gap-2 shrink-0">
          <div className="relative w-14 h-14">
            <Image
              src="/images/LS_blue.png"
              alt="LinkedSpaces Logo"
              fill
              className="object-contain"
              unoptimized={true}
              priority
            />
          </div>
          <span className="text-[28px] sm:text-[32px] font-bold tracking-tight text-[var(--header-text)]">
            LinkedSpaces
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-4 shrink-0">
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
            {NAV_TABS.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    rounded-lg px-3 py-2 text-sm font-medium transition-colors
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-1
                    ${
                      active
                        ? "bg-[var(--color-main)]/12 text-[var(--color-main)] underline decoration-2 underline-offset-2"
                        : "text-[var(--header-text-muted)] hover:bg-black/5 hover:text-[var(--header-text)]"
                    }
                  `}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
