import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Bloggo is free to download. Try it as a guest, or sign in with a free account for unlimited blogs and exports.",
  alternates: { canonical: "/pricing" },
};

export default function BloggoPricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
