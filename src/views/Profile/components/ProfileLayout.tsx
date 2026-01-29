"use client";

import Sidebar from "@/views/Profile/sidebar/Sidebar";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const SIDEBAR_WIDTH = "320px";

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-offset",
      isSidebarOpen ? SIDEBAR_WIDTH : "0px",
    );
    return () => {
      document.documentElement.style.removeProperty("--sidebar-offset");
    };
  }, [isSidebarOpen]);

  return (
    <div className="relative flex min-h-screen">
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
        className="flex-1 transition-all duration-300 ease-in-out bg-white"
        style={{ paddingLeft: isSidebarOpen ? SIDEBAR_WIDTH : "0px" }}
      >
        <div className="w-full h-full min-h-[calc(100vh-77px)]">{children}</div>
      </main>
    </div>
  );
}
