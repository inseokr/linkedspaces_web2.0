import Link from "next/link";
import { SITE_NAME } from "@/hyodo/lib/site";

export default function HyodoHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--hw-border)] bg-[var(--hw-paper)]/90 backdrop-blur">
      <div className="hw-container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg text-[var(--hw-ink)] no-underline"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hyodo/AppIcon.svg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-[10px] shadow-sm"
          />
          <span className="hw-display">{SITE_NAME}</span>
        </Link>
        <Link
          href="/support"
          className="rounded-full px-4 py-2 text-sm font-bold text-[var(--hw-brand)] hover:bg-[var(--hw-lilac)] transition-colors"
        >
          Support
        </Link>
      </div>
    </header>
  );
}
