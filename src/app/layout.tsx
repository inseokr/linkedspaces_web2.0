// src/app/layout.tsx
"use client";

import "./global.css";
import { BerforeLoginHeader } from "@/components/layout/BeforeLoginHeader";
import { AfterLoginHeader } from "@/components/layout/AfterLoginHeader";
import { Footer } from "@/components/layout/Footer";
import { Montserrat, Poppins, Inter } from "next/font/google";
import "@fontsource-variable/wix-madefor-text";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  console.log("[RootLayout] render", {
    isAuthenticated,
    token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
    time: new Date().toISOString(),
  });

  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${montserrat.variable}`}
    >
      <body className="min-h-screen flex flex-col overflow-y-auto">
        {/* Conditionally render Header based on login status */}
        {isAuthenticated ? <AfterLoginHeader /> : <BerforeLoginHeader />}

        <main className="flex-1">{children}</main>

        <div className="pb-[74px]">
          <Footer />
        </div>
      </body>
    </html>
  );
}
