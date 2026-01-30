"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type LayoutMode = "profile" | "bare";

type LayoutModeCtx = {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
};

const Ctx = createContext<LayoutModeCtx | null>(null);

export function LayoutModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("profile");

  const value = useMemo(() => ({ layoutMode, setLayoutMode }), [layoutMode]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLayoutMode() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useLayoutMode must be used within LayoutModeProvider");
  return ctx;
}
