"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { assetUrl } from "@/api/assets";
import { getCachedUser, type User } from "@/api/user";
import { isAdminUsername } from "@/lib/admin";

type Props = {
  /** Placeholder until we wire real user profile data */
  displayName?: string;
  /** Placeholder avatar image */
  avatarSrc?: string;
  className?: string;
};

const DEFAULT_AVATAR = "/images/profileImg.png";

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

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function UserMenu({ displayName, avatarSrc, className }: Props) {
  const { logout } = useAuth();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    try {
      return getCachedUser();
    } catch {
      return null;
    }
  });
  const [hasImgError, setHasImgError] = useState(false);

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const updateUser = () => setUser(getCachedUser());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user") updateUser();
    };
    window.addEventListener("auth:changed", updateUser as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("auth:changed", updateUser as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const resolvedName = displayName ?? user?.username ?? "User";
  const resolvedAvatar =
    avatarSrc ??
    (hasImgError ? "" : assetUrl(user?.profile_picture)) ??
    DEFAULT_AVATAR;
  const imgSrc =
    resolvedAvatar && resolvedAvatar.length > 0
      ? resolvedAvatar
      : DEFAULT_AVATAR;

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "user-pill",
          "inline-flex items-center gap-2 rounded-full",
          "pl-2 pr-3 py-1.5",
          "shadow-sm transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--user-pill-focus)]",
        )}
      >
        <span className="relative h-7 w-7 overflow-hidden rounded-full bg-white/10">
          <Image
            src={imgSrc}
            alt="Profile"
            fill
            sizes="28px"
            className="object-cover"
            onError={() => setHasImgError(true)}
          />
        </span>

        <span
          className="text-[14px] font-semibold leading-none"
          style={{ color: "var(--user-pill-text)" }}
        >
          {resolvedName}
        </span>

        <ChevronDown open={open} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed left-0 right-0 bottom-0 top-[77px] z-[95]"
          style={{ backgroundColor: "var(--user-menu-overlay)" }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        id={menuId}
        role="menu"
        className={cn(
          "fixed right-6 lg:right-10 top-[77px] z-[99]",
          open
            ? "pointer-events-auto opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 -translate-y-1",
          "transition-all duration-150",
        )}
      >
        <div
          className={cn(
            "w-[280px] overflow-hidden rounded-[24px] border",
            "backdrop-blur-md",
          )}
          style={{
            backgroundColor: "var(--user-menu-bg)",
            borderColor: "var(--user-menu-border)",
            boxShadow: "var(--user-menu-shadow)",
          }}
        >
          <div className="px-5 py-4">
            <div
              className="text-[11px] font-semibold tracking-[0.14em]"
              style={{ color: "var(--user-menu-muted)" }}
            >
              MY ACCOUNT
            </div>

            <div className="mt-2 space-y-1">
              <button
                role="menuitem"
                type="button"
                disabled
                aria-disabled="true"
                className={cn(
                  "block rounded-xl px-3 py-2.5 text-[15px] font-semibold",
                  "opacity-60 cursor-not-allowed select-none",
                )}
                style={{ color: "var(--foreground)" }}
              >
                Profile Settings
              </button>

              <button
                role="menuitem"
                type="button"
                disabled
                aria-disabled="true"
                className={cn(
                  "block rounded-xl px-3 py-2.5 text-[15px] font-semibold",
                  "opacity-60 cursor-not-allowed select-none",
                )}
                style={{ color: "var(--foreground)" }}
              >
                Account Settings
              </button>

              {isAdminUsername(user?.username) && (
                <Link
                  href="/admin/dashboard"
                  role="menuitem"
                  className={cn(
                    "block rounded-xl px-3 py-2.5 text-[15px] font-semibold text-left w-full",
                    "transition hover:bg-[var(--user-menu-item-hover)]",
                  )}
                  style={{ color: "var(--foreground)" }}
                  onClick={() => setOpen(false)}
                >
                  User Dashboard
                </Link>
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
                setOpen(false);
                logout();
              }}
              className={cn(
                "mt-3 w-full rounded-xl px-3 py-2.5 text-center text-[15px] font-semibold",
                "transition hover:bg-[var(--user-menu-item-hover)]",
              )}
              style={{ color: "var(--user-menu-danger)" }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
