import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/layout/UserMenu";
import "./header_theme.css";

import { useLayoutMode } from "@/components/layout/LayoutModeContext";

const NAV_TABS = [
  { label: "Home", href: "/home" },
  { label: "Explore", href: "/explore" },
  { label: "Profile", href: "/profile/my-places" },
] as const;

export function AfterLoginHeader() {
  const { layoutMode } = useLayoutMode();
  const pathname = usePathname();

  const hideTopbar = layoutMode === "bare";

  if (hideTopbar) return null;

  const isActive = (href: string) => {
    if (href === "/profile/my-places")
      return (
        (pathname === "/profile" || pathname?.startsWith("/profile/")) ?? false
      );
    return pathname === href;
  };

  return (
    <header className="header-root sticky top-0 z-[100] w-full border-b border-[var(--bloggo-border)] bg-[var(--bloggo-bg)]/80 backdrop-blur-xl">
      <div className="mx-auto h-16 flex items-center px-4 sm:px-6 lg:px-8 gap-6">
        <Link
          href="/home"
          className="flex items-center gap-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg"
        >
          <div className="relative w-8 h-8">
            <Image
              src="/images/LS_blue.png"
              alt="LinkedSpaces Logo"
              fill
              className="object-contain"
              unoptimized={true}
              priority
            />
          </div>
          <span className="text-xl font-bold gradient-text">LinkedSpaces</span>
        </Link>

        <div className="ml-auto flex items-center gap-4 shrink-0">
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {NAV_TABS.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500
                    ${
                      active
                        ? "text-[var(--bloggo-text-primary)] bg-black/5"
                        : "text-[var(--bloggo-text-secondary)] hover:text-[var(--bloggo-text-primary)] hover:bg-black/5"
                    }
                  `}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
