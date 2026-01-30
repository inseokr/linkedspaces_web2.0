// components/RecapLoginBar.tsx
"use client";

import React from "react";
import { Menu } from "lucide-react";

type Props = {
  message?: string;
  signInLabel?: string;
  onSignIn?: () => void;
  onMenuClick?: () => void;
  className?: string;
};

export default function RecapLoginBar({
  message = "Sign in now to start keeping your moments",
  signInLabel = "Sign in",
  onSignIn,
  onMenuClick,
  className = "",
}: Props) {
  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-[200]",
        "w-full border-b border-black/10 bg-white",
        className,
      ].join(" ")}
    >
      <div className="flex h-[74px] w-full items-center px-4 sm:px-6 overflow-x-hidden">
        <div className="ml-auto flex min-w-0 items-center justify-end gap-3 sm:gap-4">
          {/* ✅ 모바일에서는 숨김 */}
          <span className="hidden sm:block min-w-0 max-w-[520px] truncate text-[18px] font-semibold text-black/70">
            {message}
          </span>

          <button
            type="button"
            onClick={onSignIn}
            className={[
              "shrink-0 rounded-xl px-4 py-2 text-[16px] sm:text-[18px] font-semibold",
              "bg-[#0798FF] text-white hover:brightness-95 active:brightness-90",
              "transition",
            ].join(" ")}
          >
            {signInLabel}
          </button>

          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition hover:bg-black/5 active:bg-black/10"
          >
            <Menu className="h-6 w-6 text-black/70" />
          </button>
        </div>
      </div>
    </header>
  );
}
