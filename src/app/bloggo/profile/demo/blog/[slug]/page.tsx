import type { Metadata } from "next";
import DemoBlogDetailView from "./DemoBlogDetailView";

export const metadata: Metadata = {
  title: "Blog Post - BlogGo",
  description: "Interactive blog post with map view.",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default function DemoBlogDetailPage({ params }: Props) {
  return <DemoBlogDetailView params={params} />;
}
