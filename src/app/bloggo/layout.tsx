import "@/app/bloggo/bloggo.css";
import BloggoHeader from "@/bloggo/components/layout/Header";
import BloggoFooter from "@/bloggo/components/layout/Footer";
import JsonLd from "@/bloggo/components/seo/JsonLd";
import { Metadata } from "next";

const APP_STORE_URL = "https://apps.apple.com/us/app/bloggo/id6759849314";

export const metadata: Metadata = {
  metadataBase: new URL("https://bloggo.linkedspaces.com"),
  title: {
    default: "Bloggo – AI travel journal that turns photos into blogs",
    template: "%s | Bloggo",
  },
  description:
    "Bloggo turns your camera roll into a travel journal — photos grouped by trip and place, with maps, captions, and a blog draft in seconds. Private, on-device.",
  keywords: [
    "AI travel journal",
    "turn photos into a blog",
    "travel journal app",
    "photo journal app",
    "travel diary",
    "trip blog maker",
  ],
  icons: {
    icon: "/bloggo-icon.png",
    apple: "/bloggo-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Bloggo",
    images: [
      {
        url: "/bloggo/og-image.png",
        width: 1096,
        height: 1080,
        alt: "Bloggo – turn your photos into a travel blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/bloggo/og-image.png"],
  },
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "Bloggo: Journal & Diary",
  operatingSystem: "iOS",
  applicationCategory: "PhotoApplication",
  offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: 5,
    ratingCount: 3,
  },
  url: APP_STORE_URL,
};

export default function BloggoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bloggo-root min-h-screen flex flex-col theme-light">
      <JsonLd data={appJsonLd} />
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.12) 0%, transparent 60%)",
        }}
      />
      <BloggoHeader />
      <main className="flex-1 relative">{children}</main>
      <BloggoFooter />
    </div>
  );
}
