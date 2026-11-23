import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with Bloggo. Browse common questions or contact us — we read every message.",
  alternates: { canonical: "/support" },
};

export default function BloggoSupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
