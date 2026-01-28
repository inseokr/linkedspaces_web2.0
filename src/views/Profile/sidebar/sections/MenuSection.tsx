"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type MenuItem = {
  key: string;
  label: string;
  href: string;
  icon?: ReactNode;
  iconSrc?: string;
  disabled?: boolean;
};

export default function MenuSection({ items = [] }: { items?: MenuItem[] }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="p-3">
      <ul className="space-y-1">
        {items.map((item) => {
          const active = isActive(item.href);

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex h-12 items-center gap-3 rounded-[8px] px-4 text-sm transition",
                  active
                    ? "bg-[var(--color-main)] text-white"
                    : "text-gray-900 hover:bg-gray-100",
                  item.disabled ? "pointer-events-none opacity-50" : "",
                ].join(" ")}
              >
                {item.icon ? (
                  <span className="shrink-0 h-5 w-5">{item.icon}</span>
                ) : item.iconSrc ? (
                  <span className="shrink-0 h-5 w-5 relative">
                    <Image
                      src={item.iconSrc}
                      alt=""
                      width={20}
                      height={20}
                      className={active ? "filter brightness-0 invert" : ""}
                    />
                  </span>
                ) : null}

                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
