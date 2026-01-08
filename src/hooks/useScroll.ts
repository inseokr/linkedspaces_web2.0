"use client";

import { useEffect } from "react";

export function useScroll({
  topSentinelId = "top-sentinel",
  maxTries = 20,
}: {
  topSentinelId?: string;
  maxTries?: number;
}) {
  useEffect(() => {
    const getIdFromHash = () => {
      const hash = window.location.hash;
      if (!hash) return null;
      return decodeURIComponent(hash.slice(1));
    };

    const scrollToHash = async () => {
      const id = getIdFromHash();
      if (!id) return;

      for (let i = 0; i < maxTries; i++) {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        await new Promise((r) => requestAnimationFrame(() => r(null)));
      }
    };

    scrollToHash();

    const onHashChange = () => scrollToHash();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [maxTries]);

  useEffect(() => {
    const sentinel = document.getElementById(topSentinelId);
    if (!sentinel) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && window.location.hash) {
          const { pathname, search } = window.location;
          history.replaceState(null, "", `${pathname}${search}`);
        }
      },
      { threshold: 0.9 },
    );

    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [topSentinelId]);
}
