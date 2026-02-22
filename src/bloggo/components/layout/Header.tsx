"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { getCachedUser } from "@/api/user";
import { assertBloggoUser } from "@/lib/bloggo";
import { assetUrl } from "@/api/assets";

const BASE = "/bloggo";

const navLinks = [
  { href: `${BASE}/features`, label: "Features" },
  { href: `${BASE}/pricing`, label: "Pricing" },
  { href: `${BASE}/support`, label: "Support" },
];

export default function BloggoHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { isLoading, isAuthenticated, logout } = useAuth();

  const [imgError, setImgError] = useState(false);

  if (pathname === "/bloggo/recap") return null;

  const user = getCachedUser();
  const isBloggoUser = isAuthenticated && assertBloggoUser(user).ok;
  const showLogout = !isLoading && isBloggoUser;

  const avatarUrl = user?.profile_picture
    ? assetUrl(user.profile_picture)
    : null;
  const initial = user?.username ? user.username.charAt(0).toUpperCase() : "?";

  const renderAvatar = () => {
    if (avatarUrl && !imgError) {
      return (
        <Image
          src={avatarUrl}
          alt={user?.username || "Avatar"}
          fill
          sizes="40px"
          className="object-cover"
          onError={() => setImgError(true)}
        />
      );
    }
    return (
      <div className="flex h-full w-full items-center justify-center bg-blue-500 text-white font-medium">
        {initial}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--bloggo-border)] bg-[var(--bloggo-bg)]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href={
              isBloggoUser && user?.username
                ? `${BASE}/profile/${user.username}`
                : BASE
            }
            className="flex items-center gap-2 font-bold text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg"
          >
            <span className="gradient-text">BlogGo</span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-1"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                  pathname === link.href
                    ? "text-[var(--bloggo-text-primary)] bg-black/5"
                    : "text-[var(--bloggo-text-secondary)] hover:text-[var(--bloggo-text-primary)] hover:bg-black/5",
                ].join(" ")}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {!isBloggoUser && (
              <Link
                href={`${BASE}/profile/demo`}
                className="text-sm text-[var(--bloggo-text-secondary)] hover:text-[var(--bloggo-text-primary)] transition-colors px-3 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                Demo Profile
              </Link>
            )}
            {showLogout ? (
              <div className="flex items-center gap-3">
                <Link
                  href={
                    isBloggoUser && user?.username
                      ? `${BASE}/profile/${user.username}`
                      : BASE
                  }
                >
                  <div className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-black/5 shadow-sm hover:ring-sky-500 transition-all cursor-pointer">
                    {renderAvatar()}
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link
                href="/bloggo/sign-in"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-lg shadow-sky-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                Sign In
              </Link>
            )}
          </div>

          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="bloggo-mobile-menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-[var(--bloggo-text-secondary)] hover:text-[var(--bloggo-text-primary)] hover:bg-black/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
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

        {mobileOpen && (
          <nav
            id="bloggo-mobile-menu"
            aria-label="Mobile navigation"
            className="md:hidden border-t border-[var(--bloggo-border)] py-4 flex flex-col gap-1"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={[
                  "px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-[var(--bloggo-text-primary)] bg-black/5"
                    : "text-[var(--bloggo-text-secondary)] hover:text-[var(--bloggo-text-primary)] hover:bg-black/5",
                ].join(" ")}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-[var(--bloggo-border)] flex flex-col gap-2">
              {!isBloggoUser && (
                <Link
                  href={`${BASE}/profile/demo`}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm text-[var(--bloggo-text-secondary)] hover:text-[var(--bloggo-text-primary)] hover:bg-black/5 transition-colors"
                >
                  Demo Profile
                </Link>
              )}
              {showLogout ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href={
                      isBloggoUser && user?.username
                        ? `${BASE}/profile/${user.username}`
                        : BASE
                    }
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-black/5 shadow-sm shrink-0">
                      {renderAvatar()}
                    </div>
                    <span className="font-medium text-[var(--bloggo-text-primary)]">
                      {user?.username}
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white text-center transition-all"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <Link
                  href="/bloggo/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white text-center transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
