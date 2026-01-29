"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

type Item = { label: string; href: string };

type Props = {
  trigger: React.ReactNode;
  items?: Item[];
  className?: string;
};

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function DropdownMenu({
  trigger,
  items = [
    { label: "Our Story", href: "/#our-story" },
    { label: "Learn More", href: "/learn-more" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  className,
}: Props) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="p-1 relative z-[100]"
      >
        {trigger}
      </button>

      {/* Full-screen overlay - only blurs content below header, not header itself */}
      {open && (
        <div
          className={cn(
            "fixed left-0 right-0 bottom-0 top-[77px] z-[95]",
            "pointer-events-auto backdrop-blur-lg bg-white/45 transition-opacity duration-150",
          )}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel - positioned below header, z-index below header so it sits under it */}
      <div
        id={menuId}
        role="menu"
        className={cn(
          "fixed right-6 lg:right-10 top-[77px] z-[99]",
          open
            ? "pointer-events-auto opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 -translate-y-1",
          "transition-all duration-150",
        )}
      >
        <div
          className={cn(
            "w-[206px] overflow-hidden rounded-[26px]",
            "backdrop-blur-md",
            "shadow-[0_18px_40px_rgba(0,0,0,0.35)]",
          )}
          style={{ backgroundColor: "rgba(21,21,21,0.75)" }}
        >
          <div className="h-full flex flex-col px-5 py-6">
            <div className="flex flex-col justify-center">
              {items.map((item, idx) => (
                <div key={item.href}>
                  <Link
                    role="menuitem"
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block w-full text-right text-white",
                      "text-base font-bold tracking-[-0.5px]",

                      "px-4 py-6 rounded-[12px]",
                    )}
                  >
                    {item.label}
                  </Link>

                  {idx !== items.length - 1 && (
                    <div className="h-px w-full bg-white/50" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
