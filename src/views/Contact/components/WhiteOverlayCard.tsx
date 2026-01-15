import React from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  overlayOpacity?: number;
  maxWidthClassName?: string;
  children?: React.ReactNode;
};

export default function WhiteOverlayCard({
  title,
  subtitle,
  overlayOpacity = 0,
  maxWidthClassName = "max-w-3xl",
  children,
}: Props) {
  return (
    <div className="relative w-full min-h-[520px] flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(255, 255, 255, ${overlayOpacity})` }}
        aria-hidden="true"
      />

      <div
        className={`relative z-[9200] w-full ${maxWidthClassName} rounded-3xl bg-white/0 text-center`}
      >
        <h2 className="[font-family:var(--font-poppins)] text-[56px] leading-[1.05] font-extrabold text-black">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-5 text-lg font-semibold text-black/80">{subtitle}</p>
        )}

        {children && <div className="mt-12">{children}</div>}

        <Button
          radius="md"
          asChild
          className="justify-center items-center mt-12 px-[26px] py-3 w-[275px] h-[59px] text-2xl"
        >
          <Link href="/beta-sign-up">Request For Beta</Link>
        </Button>
      </div>
    </div>
  );
}
