// components/layout/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import "./footer_theme.css";

import instagramIcon from "@/assets/icons/instagram.svg";
import linkedinIcon from "@/assets/icons/linkedin.svg";

export function Footer() {
  return (
    <footer
      className="footer-root w-full border-t border-[var(--bloggo-border)] bg-[var(--bloggo-bg-card)]/50 mt-24"
      style={{
        marginLeft: "var(--sidebar-offset, 0px)",
        width: "calc(100% - var(--sidebar-offset, 0px))",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/images/LS_blue.png"
                  alt="LinkedSpaces Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold gradient-text">
                LinkedSpaces
              </span>
            </Link>
            <p className="text-sm text-[var(--bloggo-text-muted)] leading-relaxed max-w-xs">
              Connect with your friends, share your spaces, and explore the
              world together.
            </p>
            <div className="flex gap-4 mt-2">
              <a
                href="https://www.instagram.com/linkedspaces/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <Image
                  src={instagramIcon}
                  alt="instagramIcon"
                  width={24}
                  height={24}
                />
              </a>
              <a
                href="https://www.linkedin.com/company/linkedspaces/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <Image
                  src={linkedinIcon}
                  alt="linkedinIcon"
                  width={24}
                  height={24}
                />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--bloggo-text-muted)]">
              PRODUCT
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/#our-story"
                  className="text-sm text-[var(--bloggo-text-secondary)] hover:text-[var(--bloggo-text-primary)] transition-colors"
                >
                  Our Story
                </Link>
              </li>
              <li>
                <Link
                  href="/learn-more"
                  className="text-sm text-[var(--bloggo-text-secondary)] hover:text-[var(--bloggo-text-primary)] transition-colors"
                >
                  Learn More
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--bloggo-text-muted)]">
              Company
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-[var(--bloggo-text-secondary)] hover:text-[var(--bloggo-text-primary)] transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/beta-sign-up"
                  className="text-sm text-[var(--bloggo-text-secondary)] hover:text-[var(--bloggo-text-primary)] transition-colors"
                >
                  Beta Sign Up
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--bloggo-text-muted)]">
              Legal
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-[var(--bloggo-text-secondary)] hover:text-[var(--bloggo-text-primary)] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-[var(--bloggo-text-secondary)] hover:text-[var(--bloggo-text-primary)] transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--bloggo-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--bloggo-text-muted)]">
            © {new Date().getFullYear()} LinkedSpaces. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
