import "@/app/bloggo/bloggo.css";
import BloggoHeader from "@/bloggo/components/layout/Header";
import BloggoFooter from "@/bloggo/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Bloggo – The fastest way to turn photos into blogs",
    template: "%s | Bloggo",
  },
  description: "Bloggo is the fastest way to turn photos into blogs.",
  keywords: ["blogging", "writing", "developer blog", "content creation"],
  icons: {
    icon: "/bloggo-icon.png",
    apple: "/bloggo-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Bloggo",
  },
};

export default function BloggoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bloggo-root min-h-screen flex flex-col theme-light">
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
