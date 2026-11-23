import "@/app/hyodo/hyodo.css";
import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import HyodoHeader from "@/hyodo/components/Header";
import HyodoFooter from "@/hyodo/components/Footer";
import { SITE_NAME, TAGLINE } from "@/hyodo/lib/site";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-hw-body",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-hw-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hyodo.linkedspaces.com"),
  title: {
    default: `${SITE_NAME} – ${TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: TAGLINE,
  applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: "/hyodo/AppIcon.svg", type: "image/svg+xml" },
      { url: "/hyodo/AppIcon.png", type: "image/png", sizes: "1024x1024" },
    ],
    apple: { url: "/hyodo/apple-touch-icon.png", sizes: "180x180" },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: TAGLINE,
    images: [{ url: "/hyodo/AppIcon.png", width: 1024, height: 1024 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F3FD",
};

export default function HyodoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`hyodo-root ${nunito.variable} ${fredoka.variable} min-h-screen flex flex-col`}
    >
      <HyodoHeader />
      <main className="flex-1">{children}</main>
      <HyodoFooter />
    </div>
  );
}
