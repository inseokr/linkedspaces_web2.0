"use client";

import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/components/layout/UserMenu";

import { useLayoutMode } from "@/components/layout/LayoutModeContext";

export function AfterLoginHeader() {
  const { layoutMode } = useLayoutMode();

  const hideTopbar = layoutMode === "bare";

  if (hideTopbar) return null; // 여기서 차단

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-[var(--header-border)] bg-[var(--header-bg)] backdrop-blur supports-[backdrop-filter]:bg-[var(--header-bg)] shadow-[var(--header-shadow)]">
      <div className="mx-auto h-[77px] flex items-center pl-6 lg:pl-10 ">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative w-14 h-14">
            <Image
              src="/images/LS_blue.png"
              alt="LinkedSpaces Logo"
              fill
              className="object-contain logo-light"
              unoptimized={true}
              priority
            />
            <Image
              src="/images/ls-logo-orange.svg"
              alt="LinkedSpaces Logo"
              fill
              className="object-contain logo-dark"
              unoptimized={true}
              priority
            />
          </div>
          <span className="text-[32px] font-bold tracking-tight text-[var(--header-text)]">
            LinkedSpaces
          </span>
        </Link>

        <div className="ml-auto pr-6 lg:pr-10">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
