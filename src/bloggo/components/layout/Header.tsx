"use client";

import { useState, useEffect, useId, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { getCachedUser } from "@/api/user";
import { assertBloggoUser } from "@/lib/bloggo";
import { assetUrl } from "@/api/assets";
import { isAdminUsername } from "@/lib/admin";

const BASE = "/bloggo";

const navLinks = [
  { href: `${BASE}/features`, label: "Features" },
  { href: `${BASE}/support`, label: "Support" },
];

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={[
        "shrink-0",
        "transition-transform duration-200",
        open ? "rotate-180" : "rotate-0",
      ].join(" ")}
      aria-hidden="true"
    >
      <path
        d="M5.5 8l4.5 4.5L14.5 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}

export default function BloggoHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);

  // On shared blog detail pages, hide the mobile nav dropdown
  const isSharedBlogPage = /^\/bloggo\/profile\/[^/]+\/blog\//.test(
    pathname ?? "",
  );

  const [imgError, setImgError] = useState(false);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const user = getCachedUser();
  const isPro = user?.tier === "Pro";

  // Hide header while viewing a recap blog; it reappears when the user navigates back.
  // We only hide it for Pro users. Free tier users get the header (with branding/login CTA).
  if (
    (pathname === "/bloggo/recap" || pathname.startsWith("/bloggo/trip/")) &&
    isPro
  )
    return null;

  const isBloggoUser = isAuthenticated && assertBloggoUser(user).ok;
  const showUserMenu = !isLoading && isBloggoUser;

  const avatarUrl = user?.profile_picture
    ? assetUrl(user.profile_picture)
    : null;
  const initial = user?.username ? user.username.charAt(0).toUpperCase() : "?";

  const renderAvatar = (size: "sm" | "md" = "sm") => {
    const dim = size === "sm" ? "h-7 w-7" : "h-10 w-10";
    const roundClass = size === "sm" ? "rounded-lg" : "rounded-full";
    if (avatarUrl && !imgError) {
      return (
        <span
          className={`relative ${dim} overflow-hidden ${roundClass} bg-white/10 ring-1 ring-black/5`}
        >
          <Image
            src={avatarUrl}
            alt={user?.username || "Avatar"}
            fill
            sizes={size === "sm" ? "28px" : "40px"}
            className="object-cover"
            onError={() => setImgError(true)}
          />
        </span>
      );
    }
    return (
      <span
        className={`relative ${dim} overflow-hidden ${roundClass} bg-blue-500 ring-1 ring-black/5 flex items-center justify-center text-white font-medium text-sm`}
      >
        {initial}
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-[100] border-b border-[var(--bloggo-border)] bg-[var(--bloggo-bg)] backdrop-blur-xl">
      <div
        className={[
          "w-full px-4 sm:px-6 lg:px-8",
          !isBloggoUser ? "max-w-7xl mx-auto" : "",
        ].join(" ")}
      >
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href={
                isBloggoUser && user?.username
                  ? `${BASE}/profile/${user.username}`
                  : BASE
              }
              className="flex items-center gap-2 font-bold text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg"
            >
              <span className="gradient-text">Bloggo</span>
            </Link>

            {!isBloggoUser && (
              <nav className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-semibold text-[var(--bloggo-text-secondary)] hover:text-[var(--bloggo-text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg px-2 py-1"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!isBloggoUser && (
              <Link
                href={`${BASE}/profile/demo`}
                className="text-sm font-semibold text-[var(--bloggo-text-secondary)] hover:text-[var(--bloggo-text-primary)] transition-colors px-3 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                Demo Profile
              </Link>
            )}
            {showUserMenu ? (
              /* ─── Unified avatar + username + chevron pill (like LinkedSpaces) ─── */
              <div ref={rootRef} className="relative inline-flex">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-controls={menuId}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-xl pl-1.5 pr-3 py-1.5 bg-black/5 hover:bg-black/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  {renderAvatar("sm")}
                  <span className="text-sm font-medium text-[var(--bloggo-text-primary)]">
                    {user?.username}
                  </span>
                  <ChevronDown open={menuOpen} />
                </button>

                {/* Overlay */}
                {menuOpen && (
                  <div
                    className="fixed left-0 right-0 bottom-0 top-16 z-[95]"
                    style={{ backgroundColor: "transparent" }}
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                  />
                )}

                {/* Dropdown panel */}
                <div
                  id={menuId}
                  role="menu"
                  className={[
                    "absolute right-0 top-full mt-2 z-[99]",
                    menuOpen
                      ? "pointer-events-auto opacity-100 translate-y-0"
                      : "pointer-events-none opacity-0 -translate-y-1",
                    "transition-all duration-150",
                  ].join(" ")}
                >
                  <div
                    className="w-[220px] rounded-2xl border"
                    style={{
                      backgroundColor: "var(--user-menu-bg)",
                      borderColor: "var(--user-menu-border)",
                      boxShadow: "var(--user-menu-shadow)",
                      /* Reset any inherited transparent text-fill from .gradient-text */
                      WebkitTextFillColor: "initial",
                      color: "var(--foreground)",
                    }}
                  >
                    <div className="px-5 py-4">
                      <span
                        className="block text-[11px] font-semibold tracking-[0.14em]"
                        style={{ color: "#9ca3af" }}
                      >
                        MY ACCOUNT
                      </span>

                      <div className="mt-2 space-y-1">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMenuOpen(false);
                            if (user?.username) {
                              router.push(`${BASE}/profile/${user.username}`);
                            } else {
                              router.push(BASE);
                            }
                          }}
                          className="block rounded-xl px-3 py-2.5 text-[15px] font-semibold w-full text-left transition"
                          style={{
                            color: "#111827",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--user-menu-item-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          My Profile
                        </button>

                        {/* Additional Nav Links in Menu */}
                        {navLinks
                          .filter((link) => link.label !== "Features")
                          .map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setMenuOpen(false)}
                              className="block rounded-xl px-3 py-2.5 text-[15px] font-semibold w-full text-left transition"
                              style={{
                                color: "#111827",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--user-menu-item-hover)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              {link.label}
                            </Link>
                          ))}

                        {/* Temporarily hidden — Dashboard link
                        <Link
                          href="/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="block rounded-xl px-3 py-2.5 text-[15px] font-semibold w-full text-left transition"
                          style={{
                            color: "#111827",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--user-menu-item-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          Dashboard
                        </Link>
                        */}

                        {isAdminUsername(user?.username) && (
                          <>
                            <Link
                              href="/admin/dashboard"
                              onClick={() => setMenuOpen(false)}
                              className="block rounded-xl px-3 py-2.5 text-[15px] font-semibold w-full text-left transition"
                              style={{
                                color: "#111827",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--user-menu-item-hover)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              LinkedSpaces Admin
                            </Link>

                            <Link
                              href="/bloggo/admin/dashboard"
                              onClick={() => setMenuOpen(false)}
                              className="block rounded-xl px-3 py-2.5 text-[15px] font-semibold w-full text-left transition"
                              style={{
                                color: "#111827",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--user-menu-item-hover)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              Bloggo Admin
                            </Link>
                          </>
                        )}
                      </div>

                      <div
                        className="mt-3 h-px w-full"
                        style={{ backgroundColor: "var(--user-menu-border)" }}
                      />

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setMenuOpen(false);
                          logout(BASE);
                        }}
                        className="mt-3 w-full rounded-xl px-3 py-2.5 text-center text-[15px] font-semibold transition"
                        style={{ color: "var(--user-menu-danger)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--user-menu-item-hover)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
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

          {!isSharedBlogPage && (
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
          )}
        </div>

        {!isSharedBlogPage && mobileOpen && (
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
              {showUserMenu ? (
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
                    {renderAvatar("md")}
                    <span className="font-medium text-[var(--bloggo-text-primary)]">
                      {user?.username}
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout(BASE);
                    }}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-black/5 text-center transition-all"
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
