import Link from "next/link";
import { COMPANY, NAV_LINKS, SUPPORT_EMAIL } from "@/hyodo/lib/site";

export default function HyodoFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--hw-border)] bg-white/60">
      <div className="hw-container flex flex-col gap-5 py-10 text-sm text-[var(--hw-muted)]">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-1 gap-y-2">
            {NAV_LINKS.map((link, i) => (
              <li key={link.href} className="flex items-center">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="px-2 text-[var(--hw-brand-mid)]"
                  >
                    ·
                  </span>
                )}
                <Link
                  href={link.href}
                  className="font-semibold text-[var(--hw-ink-soft)] hover:text-[var(--hw-brand)] py-1"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p>
          Questions?{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-[var(--hw-brand)] hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
        </p>
        <p>© 2026 {COMPANY}</p>
      </div>
    </footer>
  );
}
