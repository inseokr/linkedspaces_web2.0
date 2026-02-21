/**
 * Demo profile layout — header only (no footer).
 * Next.js nested layouts let us override the parent bloggo/layout.tsx
 * by wrapping children in a dedicated shell. However, because the parent
 * layout always renders <BloggoFooter />, we need a different approach:
 * we hide the footer via CSS scoped to this segment.
 */
export default function DemoProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hide the Bloggo footer only for the demo-profile segment */}
      <style>{`
        .bloggo-root > footer {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  );
}
