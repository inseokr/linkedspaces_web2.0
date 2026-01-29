"use client";

import Link from "next/link";
import React from "react";

export type Crumb = {
  label: string;
  href?: string; // 있으면 링크, 없으면 텍스트
};

type Props = {
  items: Crumb[];
  className?: string;
};

export default function RecapBlogBreadcrumb({ items, className = "" }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={[
        "flex flex-wrap items-center gap-2 text-[14px] text-black/60",
        className,
      ].join(" ")}
    >
      {items.map((c, idx) => {
        const isLast = idx === items.length - 1;
        const node = c.href ? (
          <Link href={c.href} className="hover:text-black/80 transition-colors">
            {c.label}
          </Link>
        ) : (
          <span className={isLast ? "text-black/70" : ""}>{c.label}</span>
        );

        return (
          <React.Fragment key={`${c.label}-${idx}`}>
            {node}
            {!isLast && <span className="text-black/30">{">"}</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
