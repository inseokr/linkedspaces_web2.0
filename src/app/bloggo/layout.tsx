import "@/app/bloggo/bloggo.css";
import BloggoHeader from "@/bloggo/components/layout/Header";
import BloggoFooter from "@/bloggo/components/layout/Footer";

export const metadata = {
  title: {
    default: "BlogGo – The fastest way to turn photos into blogs",
    template: "%s | BlogGo",
  },
  description: "BlogGo is the fastest way to turn photos into blogs.",
  keywords: ["blogging", "writing", "developer blog", "content creation"],
  openGraph: {
    type: "website",
    siteName: "BlogGo",
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
