"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";

const DEFAULT_SHOW_AFTER_PX = 400;

export interface ScrollToTopButtonProps {
  /**
   * When set, scroll this element instead of window (e.g. overflow-y-auto container).
   * Also supports legacy prop name scrollTargetRef.
   */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  /** @deprecated Use scrollContainerRef */
  scrollTargetRef?: React.RefObject<HTMLElement | null>;
  /**
   * Set to true when the scroll container ref is attached (so the effect can attach to the element).
   * Only needed when using scrollContainerRef; defaults to true when no container ref is passed.
   */
  scrollTargetReady?: boolean;
  /** Show button after scrolling this many pixels (default 400). */
  showAfterPx?: number;
}

export default function ScrollToTopButton({
  scrollContainerRef: scrollContainerRefProp,
  scrollTargetRef,
  scrollTargetReady = true,
  showAfterPx = DEFAULT_SHOW_AFTER_PX,
}: ScrollToTopButtonProps) {
  const containerRef = scrollContainerRefProp ?? scrollTargetRef;
  const [visible, setVisible] = React.useState(false);

  const scrollToTop = React.useCallback(() => {
    if (containerRef?.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [containerRef]);

  React.useEffect(() => {
    const el = containerRef?.current;
    if (containerRef != null && !scrollTargetReady) return;
    if (containerRef != null && el == null) return;
    const useElement = el != null;
    const target = useElement
      ? el
      : typeof window !== "undefined"
        ? window
        : null;
    if (!target) return;

    let rafId = 0;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollTop =
          useElement && containerRef?.current
            ? containerRef.current.scrollTop
            : window.scrollY;
        setVisible(scrollTop > showAfterPx);
      });
    };

    handleScroll();
    if (useElement && containerRef?.current) {
      const node = containerRef.current;
      node.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        node.removeEventListener("scroll", handleScroll);
        cancelAnimationFrame(rafId);
      };
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [containerRef, scrollTargetReady, showAfterPx]);

  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex transition-all duration-200 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        pointerEvents: visible ? "auto" : "none",
      }}
      aria-hidden={!visible}
    >
      <button
        type="button"
        onClick={scrollToTop}
        tabIndex={visible ? 0 : -1}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--card-text)] shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 focus:ring-offset-white active:scale-[0.98]"
        aria-label="Scroll back to top"
      >
        <ArrowUp className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
