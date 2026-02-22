/**
 * Bloggo sign-in layout — hides the global BloggoHeader for this route only.
 */
export default function BloggoSignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hide the Bloggo header only for the sign-in segment */}
      <style>{`
        .bloggo-root > header {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  );
}
