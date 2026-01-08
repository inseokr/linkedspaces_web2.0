"use client";

import { useScroll } from "@/hooks/useScroll";

export function ScrollManager(props: {
  topSentinelId?: string;
  maxTries?: number;
}) {
  useScroll(props);
  return null;
}
