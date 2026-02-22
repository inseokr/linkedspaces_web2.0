import type { Metadata } from "next";
import DemoProfileView from "./DemoProfileView";

export const metadata: Metadata = {
  title: "Demo Profile - Bloggo",
  description: "Interactive demo profile exploring Bloggo features.",
};

export default function DemoProfilePage() {
  return <DemoProfileView />;
}
