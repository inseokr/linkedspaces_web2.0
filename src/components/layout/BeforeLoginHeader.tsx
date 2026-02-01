"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Our Story", href: "/#our-story" },
  { label: "Learn More", href: "/learn-more" },
  { label: "Contact", href: "/contact" },
  { label: "Beta Sign Up 🚀", href: "/beta-sign-up" },
  { label: "Sign In", href: "/sign-in" },
];

export function BerforeLoginHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-[100] w-full h-[5.5rem] border-b border-[var(--header-border)] bg-[var(--header-bg)] backdrop-blur supports-[backdrop-filter]:bg-[var(--header-bg)] shadow-[var(--header-shadow)]">
      <div className="mx-auto flex items-center  pl-6 lg:pl-10">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative w-14 h-14">
            <Image
              src="/images/LS_blue.png"
              alt="LinkedSpaces Logo"
              fill
              className="object-contain logo-light"
              priority
            />
            <Image
              src="/images/ls-logo-orange.svg"
              alt="LinkedSpaces Logo"
              fill
              className="object-contain logo-dark"
              priority
            />
          </div>
          <span className="text-[32px] font-bold tracking-tight text-[var(--header-text)]">
            LinkedSpaces
          </span>
        </Link>
        <nav
          aria-label="Primary"
          className="flex items-center ml-auto gap-2 mb-3 mt-7 mr-0 p-1"
        >
          {NAV_ITEMS.map((item) => {
            const isOurStory = item.label === "Our Story";

            return (
              <Link
                key={item.href}
                href={item.href}
                scroll={false}
                className="px-6.5 py-2.5 text-[18px] font-bold text-[var(--header-text-muted)] hover:text-[var(--color-sub)] focus:outline-none"
                onClick={(e) => {
                  if (!isOurStory) return;

                  // If we're not on the home page, navigate to "/#our-story"
                  if (pathname !== "/") {
                    e.preventDefault();
                    router.push("/#our-story");
                    return;
                  }

                  // On the home page, force smooth scrolling every time
                  e.preventDefault();
                  scrollToId("our-story");

                  // Keep the URL consistent without triggering a full navigation
                  history.replaceState(null, "", "#our-story");
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
