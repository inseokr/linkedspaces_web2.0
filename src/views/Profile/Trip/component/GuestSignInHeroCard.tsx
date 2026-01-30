"use client";

import Image from "next/image";
import React from "react";

type Props = {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  secondaryLabel?: string;

  onPrimaryClick?: () => void; // Sign in
  onSecondaryClick?: () => void; // Download app

  className?: string;

  // 필요하면 교체 가능하도록
  backgroundSrc?: string;
  backgroundAlt?: string;
};

export default function SignInHeroCard({
  title = "Save your moments \n on LinkedSpaces.",
  subtitle = "We turn your photos into travel \n recap blogs",
  primaryLabel = "Sign in",
  secondaryLabel = "Download app",
  onPrimaryClick,
  onSecondaryClick,
  className = "",
  backgroundSrc = "/images/sign-in-bg2.png",
  backgroundAlt = "Sign in background",
}: Props) {
  return (
    <section
      className={[
        "relative mx-auto w-[90%] rounded-[36px] rounded-[36px] overflow-hidden",
        "h-[80vh]",
        className,
      ].join(" ")}
    >
      {/* Background image */}
      <Image
        src={backgroundSrc}
        alt={backgroundAlt}
        fill
        priority
        className="object-cover -scale-x-100"
      />

      {/* Contrast overlay (subtle, left-heavy) */}
      {/* <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-white/10" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.18) 42%, rgba(0,0,0,0.00) 72%)",
          }}
        />
      </div> */}

      {/* Content */}
      <div className="relative z-10 flex h-full w-full items-center">
        <div className="w-full max-w-[8000px] p-8 md:p-30">
          {/* Title */}
          <h1
            className={[
              "text-white",
              "font-bold",
              "leading-[1.16]",
              "tracking-[-0.75px]",
              "font-['Nunito_Sans']",
              "!text-[60px]",
              "whitespace-pre-line",
            ].join(" ")}
            style={{
              textShadow: "0 4px 4px rgba(0, 0, 0, 0.75)",
            }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p className='!mt-5 text-white leading-[1.16] tracking-[-0.75px] !font-["Nunito_Sans"] !text-[20px] font-bold leading-[1.32] tracking-[2.4px] whitespace-pre-line'>
            {subtitle}
          </p>

          {/* Buttons */}
          <div className="mt-25 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onPrimaryClick}
              className={[
                "h-20 w-full sm:w-[280px]",
                "rounded-2xl",
                "bg-white/90 hover:bg-white",
                "text-[#2F6BFF]",
                "text-[30px] font-semibold",
                "shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
                "transition",
                "backdrop-blur-md",
              ].join(" ")}
            >
              {primaryLabel}
            </button>

            <button
              type="button"
              onClick={onSecondaryClick}
              className={[
                "h-20 w-full sm:w-[280px]",
                "rounded-2xl",
                "bg-white/90 hover:bg-white",
                "text-[#2F6BFF]",
                "text-[30px] font-semibold",
                "shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
                "transition",
                "backdrop-blur-md",
              ].join(" ")}
            >
              {secondaryLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
