// components/ViewAllBlogsButton.tsx
import Link from "next/link";
import React from "react";

type Props = {
  href?: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
};

export default function ViewAllBlogsButton({
  href,
  onClick,
  className = "",
  children,
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full border border-black/50 bg-white " +
    "px-4 py-2 text-[13px] font-semibold leading-none text-black " +
    "hover:bg-black/[0.03] active:translate-y-[0.5px] " +
    "focus:outline-none focus:ring-2 focus:ring-blue-400/40";

  if (href) {
    return (
      <Link href={href} className={`${base} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${base} ${className}`}>
      {children}
    </button>
  );
}
