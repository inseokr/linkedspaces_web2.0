import BloggoAuthGuard from "@/bloggo/components/BloggoAuthGuard";

/**
 * Layout for /bloggo/profile/[username] — requires BlogGo authentication.
 * Any unauthenticated visitor or non-bloggo user is redirected to
 * /bloggo/sign-in by the BloggoAuthGuard client component.
 */
export default function BloggoProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BloggoAuthGuard>{children}</BloggoAuthGuard>;
}
