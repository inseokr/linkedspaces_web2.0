// src/app/layout.tsx
"use client";

import "./global.css";
import { BerforeLoginHeader } from "@/components/layout/BeforeLoginHeader";
import { AfterLoginHeader } from "@/components/layout/AfterLoginHeader";
import { Footer } from "@/components/layout/Footer";
import { Montserrat, Poppins, Inter } from "next/font/google";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import "mapbox-gl/dist/mapbox-gl.css";

import { LayoutModeProvider } from "@/components/layout/LayoutModeContext"; // 1029추가 - sidebar 없애기 위함
import { FriendsNetworkProvider } from "@/contexts/FriendsNetworkContext";
import { UserLocationProvider } from "@/contexts/UserLocationContext";

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
  const isBloggo = pathname?.startsWith("/bloggo") ?? false;
  const forceLightTheme =
    pathname === "/" ||
    pathname === "/privacy" ||
    pathname === "/contact" ||
    pathname === "/terms" ||
    pathname === "/home" ||
    pathname === "/explore" ||
    pathname === "/profile" ||
    pathname === "/learn-more" ||
    isBloggo ||
    (pathname?.startsWith("/profile/") ?? false);

  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${montserrat.variable} ${
        forceLightTheme ? "theme-light" : ""
      }`}
    >
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        {/* 여기서 Provider로 감싸기 */}
        <LayoutModeProvider>
          <UserLocationProvider>
            <FriendsNetworkProvider>
              {!isAuthPage &&
                !isBloggo &&
                (isAuthenticated ? (
                  <AfterLoginHeader />
                ) : (
                  <BerforeLoginHeader />
                ))}

              {isBloggo ? (
                <div className="flex-1">{children}</div>
              ) : (
                <main className="flex-1">{children}</main>
              )}

              {!isAuthenticated && !isBloggo && <Footer />}
            </FriendsNetworkProvider>
          </UserLocationProvider>
        </LayoutModeProvider>
      </body>
    </html>
  );
}
