/**
 * Bloggo forgot-password layout — hides the global BloggoHeader for this route only.
 */
export default function BloggoForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        .bloggo-root > header {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  );
}
