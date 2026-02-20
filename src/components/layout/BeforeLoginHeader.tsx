"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useLayoutMode } from "@/components/layout/LayoutModeContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Our Story", href: "/#our-story" },
  { label: "Learn More", href: "/learn-more" },
  { label: "Contact", href: "/contact" },
];

export function BerforeLoginHeader() {
  const { layoutMode } = useLayoutMode();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (layoutMode === "bare") return null;

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: (typeof navLinks)[number],
  ) => {
    if (item.label !== "Our Story") return;

    if (pathname !== "/") {
      e.preventDefault();
      router.push("/#our-story");
      return;
    }

    e.preventDefault();
    scrollToId("our-story");
    history.replaceState(null, "", "#our-story");
  };

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-[var(--header-border)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative w-10 h-10">
              <Image
                src="/images/LS_blue.png"
                alt="LinkedSpaces Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--header-text)]">
              LinkedSpaces
            </span>
          </Link>

          {/* Center nav links */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-1"
          >
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                scroll={false}
                onClick={(e) => handleNavClick(e, item)}
                className={[
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                  pathname === item.href
                    ? "text-[var(--header-text)] bg-black/5"
                    : "text-[var(--header-text-muted)] hover:text-[var(--header-text)] hover:bg-black/5",
                ].join(" ")}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side: Beta Sign Up + Sign In */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/beta-sign-up"
              className="text-sm text-[var(--header-text-muted)] hover:text-[var(--header-text)] transition-colors px-3 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              Beta Sign Up
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-lg shadow-sky-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-[var(--header-text-muted)] hover:text-[var(--header-text)] hover:bg-black/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            className="md:hidden border-t border-[var(--header-border)] py-4 flex flex-col gap-1"
          >
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                scroll={false}
                onClick={(e) => {
                  handleNavClick(e, item);
                  setMobileOpen(false);
                }}
                className={[
                  "px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "text-[var(--header-text)] bg-black/5"
                    : "text-[var(--header-text-muted)] hover:text-[var(--header-text)] hover:bg-black/5",
                ].join(" ")}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-[var(--header-border)] flex flex-col gap-2">
              <Link
                href="/beta-sign-up"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm text-[var(--header-text-muted)] hover:text-[var(--header-text)] hover:bg-black/5 transition-colors"
              >
                Beta Sign Up
              </Link>
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white text-center transition-all"
              >
                Sign In
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
