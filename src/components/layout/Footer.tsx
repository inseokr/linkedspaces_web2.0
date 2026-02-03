// components/layout/Footer.tsx
import Link from "next/link";
import Image from "next/image";

import instagramIcon from "@/assets/icons/instagram.svg";
import linkedinIcon from "@/assets/icons/linkedin.svg";

export function Footer() {
  return (
    <footer
      className="w-full bg-transparent"
      style={{
        marginLeft: "var(--sidebar-offset, 0px)",
        width: "calc(100% - var(--sidebar-offset, 0px))",
      }}
    >
      <div className="mx-auto flex items-center justify-center gap-2.5 pt-10 pb-6">
        <a
          href="https://www.instagram.com/linkedspaces/"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          className="inline-flex"
        >
          <Image
            src={instagramIcon}
            alt="instagramIcon"
            width={39}
            height={39}
            className="h-[39px] w-[39px]"
          />
        </a>

        <a
          href="https://www.linkedin.com/company/linkedspaces/"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
          className="inline-flex"
        >
          <Image
            src={linkedinIcon}
            alt="linkedinIcon"
            width={39}
            height={39}
            className="h-[39px] w-[39px]"
          />
        </a>
      </div>

      <div className="mx-auto flex flex-col sm:flex-row flex-wrap [font-family:var(--font-poppins)] text-base leading-[22.4px] font-semibold text-[var(--foreground)] items-center justify-center gap-2 px-4 pb-30 text-center">
        <span>© 2025 LinkedSpaces. All rights reserved.</span>
        <span className="hidden sm:inline">|</span>
        <Link href="/privacy" className="underline text-[var(--color-main)]">
          Privacy Policy
        </Link>
        <span className="hidden sm:inline text-[var(--color-main)]">|</span>
        <Link href="/terms" className="underline text-[var(--color-main)]">
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}
