"use client";

import Sidebar from "@/views/Profile/sidebar/Sidebar";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  LayoutModeProvider,
  useLayoutMode,
} from "@/components/layout/LayoutModeContext";

function ProfileLayoutInner({ children }: { children: React.ReactNode }) {
  const { layoutMode } = useLayoutMode();
  const hideSidebar = false;
  // = layoutMode === "bare";

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const SIDEBAR_WIDTH = "320px";

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-offset",
      hideSidebar ? "0px" : isSidebarOpen ? SIDEBAR_WIDTH : "0px",
    );

    return () => {
      document.documentElement.style.removeProperty("--sidebar-offset");
    };
  }, [isSidebarOpen, hideSidebar]);

  //사이드바를 안 띄우고 싶을 때
  if (hideSidebar) {
    return (
      <main className="min-h-screen w-full bg-white">
        <div className="w-full min-h-full flex flex-col">{children}</div>
      </main>
    );
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-0 top-[135px] z-[60] flex items-center justify-center bg-white rounded-r-md border border-l-0 border-gray-200 shadow-md w-10 h-10 transition-all duration-300 ease-in-out hover:bg-gray-50"
        >
          <Image
            src="/icons/leftPanel.png"
            alt="toggle sidebar"
            width={20}
            height={20}
            className="rotate-180 transition-transform duration-300"
          />
        </button>
      )}

      <main
        className="flex-1 h-full overflow-y-auto transition-all duration-300 ease-in-out bg-white"
        style={{ paddingLeft: isSidebarOpen ? SIDEBAR_WIDTH : "0px" }}
      >
        <div className="w-full min-h-full flex flex-col">{children}</div>
      </main>
    </div>
  );
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutModeProvider>
      <ProfileLayoutInner>{children}</ProfileLayoutInner>
    </LayoutModeProvider>
  );
}
