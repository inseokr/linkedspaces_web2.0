import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
  maxWidthPx?: number; // default 698
  heightPx?: number; // default 38
  radiusPx?: number; // default 13
  paddingX?: number; // default 25
  bgOpacity?: number; // default 0.54
  className?: string;
};

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function HeaderMenu({
  children,
  maxWidthPx = 698,
  heightPx = 38,
  radiusPx = 13,
  paddingX = 25,
  bgOpacity = 0.54,
  className,
}: Props) {
  return (
    <div
      className={cn("w-full relative z-[100]", className)}
      style={{ maxWidth: maxWidthPx }}
    >
      <div
        className={cn(
          "flex items-center w-full border shadow-sm",
          "border-[var(--header-menu-border)]",
        )}
        style={{
          height: heightPx,
          borderRadius: radiusPx,
          paddingLeft: paddingX,
          paddingRight: paddingX,
          backgroundColor: `rgb(var(--header-menu-rgb) / ${bgOpacity})`,
          backdropFilter: "blur(10px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
