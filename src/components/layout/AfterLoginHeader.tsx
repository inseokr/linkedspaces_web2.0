"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Contact", href: "/contact" },
  { label: "Profile", href: "/profile" },
  { label: "Sign In", href: "/sign-in" },
];

export function AfterLoginHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="w-full h-[5.5rem] bg-white">
      <div className="mx-auto flex items-center px-0">
        <nav
          aria-label="Primary"
          className="flex items-center ml-auto gap-2 bg-white mb-3 mt-7 mr-0 p-1"
        >
          {NAV_ITEMS.map((item) => {
            const isOurStory = item.label === "Our Story";

            return (
              <Link
                key={item.href}
                href={item.href}
                scroll={false}
                className="px-6.5 py-2.5 text-[18px] font-bold hover:text-[var(--color-main)] focus:outline-none"
                onClick={(e) => {
                  if (!isOurStory) return;

                  // If we're not on the home page, navigate to "/#our-story"
                  if (pathname !== "/") {
                    e.preventDefault();
                    router.push("/#our-story");
                    return;
                  }

                  // On the home page, force smooth scrolling every time
                  e.preventDefault();
                  scrollToId("our-story");

                  // Keep the URL consistent without triggering a full navigation
                  history.replaceState(null, "", "#our-story");
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
