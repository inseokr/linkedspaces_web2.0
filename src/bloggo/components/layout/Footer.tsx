"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const BASE = "/bloggo";

const footerLinks = {
  Product: [
    { href: `${BASE}/features`, label: "Features" },
    { href: `${BASE}/pricing`, label: "Pricing" },
    { href: `${BASE}/editor/my-first-post`, label: "Editor Demo" },
  ],
  Company: [
    { href: `${BASE}/support`, label: "Support" },
    { href: `${BASE}/privacy`, label: "Privacy Policy" },
    { href: `${BASE}/terms`, label: "Terms of Service" },
  ],
  Demo: [
    { href: `${BASE}/profile/demo`, label: "Demo Profile" },
    {
      href: `${BASE}/profile/demo/blog/getting-started-with-nextjs-14`,
      label: "Sample Post",
    },
  ],
};

export default function BloggoFooter() {
  const pathname = usePathname();
  if (
    pathname === "/bloggo/recap" ||
    pathname.startsWith("/bloggo/profile/") ||
    pathname.startsWith("/bloggo/trip/")
  )
    return null;

  return (
    <footer className="border-t border-[var(--bloggo-border)] bg-[var(--bloggo-bg-card)]/50 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link
              href={BASE}
              className="flex items-center gap-2 font-bold text-xl w-fit"
            >
              <span className="gradient-text">BlogGo</span>
            </Link>
            <p className="text-sm text-[var(--bloggo-text-muted)] leading-relaxed max-w-xs">
              BlogGo is the fastest way to turn photos into blogs. Turn your
              camera roll into a blog draft in seconds.
            </p>
            <p className="text-xs text-[var(--bloggo-text-muted)]">
              Support:{" "}
              <a
                href="mailto:contactbloggo@linkedspaces.com"
                className="text-sky-400 hover:text-sky-300 transition-colors"
              >
                contactbloggo@linkedspaces.com
              </a>
            </p>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--bloggo-text-muted)]">
                {group}
              </h3>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--bloggo-text-secondary)] hover:text-[var(--bloggo-text-primary)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--bloggo-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--bloggo-text-muted)]">
            © {new Date().getFullYear()} BlogGo. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={`${BASE}/privacy`}
              className="text-xs text-[var(--bloggo-text-muted)] hover:text-[var(--bloggo-text-primary)] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href={`${BASE}/terms`}
              className="text-xs text-[var(--bloggo-text-muted)] hover:text-[var(--bloggo-text-primary)] transition-colors"
            >
              Terms
            </Link>
            <Link
              href={`${BASE}/support`}
              className="text-xs text-[var(--bloggo-text-muted)] hover:text-[var(--bloggo-text-primary)] transition-colors"
            >
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
