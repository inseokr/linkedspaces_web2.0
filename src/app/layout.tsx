// src/app/layout.tsx
"use client";

import "./global.css";
import { BerforeLoginHeader } from "@/components/layout/BeforeLoginHeader";
import { AfterLoginHeader } from "@/components/layout/AfterLoginHeader";
import { Footer } from "@/components/layout/Footer";
import { Montserrat, Poppins, Bakbak_One } from "next/font/google";
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

const bakbakOne = Bakbak_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bakbak-one",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoggedIn = useAuth();

  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${poppins.variable} ${bakbakOne.variable}`}
    >
      <body className="min-h-screen flex flex-col overflow-y-auto">
        {/* Conditionally render Header based on login status */}
        {isLoggedIn ? <AfterLoginHeader /> : <BerforeLoginHeader />}

        <main className="flex-1">{children}</main>

        <div className="pb-[74px]">
          <Footer />
        </div>
      </body>
    </html>
  );
}
