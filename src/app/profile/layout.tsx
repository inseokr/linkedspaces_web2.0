"use client";
import Sidebar from "@/views/Profile/sidebar/Sidebar";
import { useState } from "react";
import Image from "next/image";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Manage sidebar state at the layout level to sync with main content
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Constants for design consistency
  const SIDEBAR_WIDTH = "320px"; // w-80 in Tailwind

  return (
    <div className="relative flex min-h-screen">
      {/* Sidebar Component with toggle props */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Toggle Button - Always visible when sidebar is closed */}
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

      {/* Main Content Area:
          Use padding-left to create the "pushing" effect. 
          The transition must match the sidebar's animation speed.
      */}
      <main
        className="flex-1 transition-all duration-300 ease-in-out bg-white"
        style={{
          paddingLeft: isSidebarOpen ? SIDEBAR_WIDTH : "0px",
        }}
      >
        <div className="w-full h-full min-h-[calc(100vh-77px)] mt-[77px]">
          {children}
        </div>
      </main>
    </div>
  );
}
