// src/app/layout.tsx  — Server Component
// (no "use client" — we need to read request headers set by middleware)
import "./global.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { Montserrat, Poppins, Inter } from "next/font/google";
import { headers } from "next/headers";
import LayoutClient from "./LayoutClient";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware sets this header when the request comes from bloggo.linkedspaces.com
  const headersList = await headers();
  const isBloggoDomain = headersList.get("x-bloggo-domain") === "true";

  const fontVariables = `${inter.variable} ${poppins.variable} ${montserrat.variable}`;

  return (
    <LayoutClient isBloggoDomain={isBloggoDomain} fontVariables={fontVariables}>
      {children}
    </LayoutClient>
  );
}
