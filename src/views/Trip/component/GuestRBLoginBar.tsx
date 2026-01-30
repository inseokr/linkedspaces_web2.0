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
      {/* mx-auto + max-w 제거!!!!!!! 어디선가 1200px으로 제한중임...하... */}
      <div className="flex h-[72px] w-full items-center px-6">
        <div className="ml-auto flex items-center gap-4">
          <span className="max-w-[520px] truncate text-[18px] font-semibold text-black/70">
            {message}
          </span>

          <button
            type="button"
            onClick={onSignIn}
            className={[
              "rounded-xl px-4 py-2 text-[18px] font-semibold",
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-black/5 active:bg-black/10"
          >
            <Menu className="h-6 w-6 text-black/70" />
          </button>
        </div>
      </div>
    </header>
  );
}
