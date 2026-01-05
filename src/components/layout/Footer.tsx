import Link from "next/link";
import Image from "next/image";

import instagramIcon from "@/assets/icons/instagram.svg";
import linkedinIcon from "@/assets/icons/linkedin.svg";

export function Footer() {
  return (
    <footer className="w-full bg-white fixed inset-x-0 bottom-[74px] z-50">
      <div className="mx-auto flex items-center justify-center gap-2.5 pb-14">
        {/* Social icons */}
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
            priority={false}
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

      <div className="mx-auto flex [font-family:var(--font-poppins)] text-base leading-[22.4px] font-semibold text-black items-center justify-center gap-2 px-4 pb-10">
        <span>© 2025 LinkedSpaces. All rights reserved.</span>
        <span>|</span>
        <Link href="/privacy" className="underline text-[var(--color-main)]">
          Privacy Policy
        </Link>
        <span className="text-[var(--color-main)]">|</span>
        <Link href="/terms" className="underline text-[var(--color-main)]">
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}
