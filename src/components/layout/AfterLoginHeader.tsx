"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import HeaderMenu from "@/components/layout/HeaderMenu";
import HamburgerIcon from "@/assets/icons/hamburger.svg";
import DropdownMenu from "@/components/ui/DropdownMenu";

export function AfterLoginHeader() {
  const router = useRouter();

  return (
    <header className="top-0 z-[100] w-full bg-white border-b border-black">
      <div className="mx-auto h-[77px] flex items-center pl-6 lg:pl-10 ">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative w-14 h-14">
            <Image
              src="/images/LS_blue.png"
              alt="LinkedSpaces Logo"
              fill
              className="object-contain"
              unoptimized={true}
              priority
            />
          </div>
          <span className="text-[32px] font-bold tracking-tight text-black">
            LinkedSpaces
          </span>
        </Link>

        <HeaderMenu className="ml-auto">
          <div className="flex items-center justify-end gap-5 w-full">
            <Button
              radius="full"
              onClick={() => router.push("/profile")}
              className="w-[120px] h-[24px] font-normal [font-family:var(--font-bakbak-one)] shadow-[0_6px_10px_-6px_rgba(0,0,0,0.28)] hover:shadow-[0_6px_14px_rgba(0,0,0,0.22)] transition-shadow hover:bg-[#85aded]"
            >
              Profile
            </Button>

            <DropdownMenu
              className="p-1 hover:opacity-70 transition z-10000"
              trigger={
                <Image
                  src={HamburgerIcon}
                  alt=""
                  width={34}
                  height={34}
                  className="block"
                />
              }
              items={[
                { label: "Our Story", href: "/#our-story" },
                { label: "Learn More", href: "/learn-more" },
                { label: "Contact Us", href: "/contact" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ]}
            />
          </div>
        </HeaderMenu>
      </div>
    </header>
  );
}
