import type { Metadata } from "next";
import DemoProfileView from "./DemoProfileView";

export const metadata: Metadata = {
  title: "Demo Profile - BlogGo",
  description: "Interactive demo profile exploring BlogGo features.",
};

export default function DemoProfilePage() {
  return <DemoProfileView />;
}
