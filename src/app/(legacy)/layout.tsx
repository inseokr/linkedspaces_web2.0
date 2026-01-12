import "@/legacy-blog/index.css";
import "@/legacy-blog/App.css";
import "@/legacy-blog/pages/TripRecap.css";
import "@/legacy-blog/pages/Highlight.css";
import "@/legacy-blog/overrides.css";

export default function LegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="LegacyBlog">{children}</div>;
}
