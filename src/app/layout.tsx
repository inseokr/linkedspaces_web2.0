// src/app/layout.tsx
"use client";

import "./global.css";
import { BerforeLoginHeader } from "@/components/layout/BeforeLoginHeader";
import { AfterLoginHeader } from "@/components/layout/AfterLoginHeader";
import { Footer } from "@/components/layout/Footer";
import { Montserrat, Poppins, Inter } from "next/font/google";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation"; // 1. usePathname 추가
import "mapbox-gl/dist/mapbox-gl.css";

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
  const pathname = usePathname();

  const isAuthPage = pathname === "/sign-in";

  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${montserrat.variable}`}
    >
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        {!isAuthPage &&
          (isAuthenticated ? <AfterLoginHeader /> : <BerforeLoginHeader />)}

        <main className="flex-1">{children}</main>

        {!isAuthenticated && <Footer />}
      </body>
    </html>
  );
}
