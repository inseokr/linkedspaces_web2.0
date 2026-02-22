"use client";

/**
 * BloggoAuthGuard
 *
 * Wraps any BlogGo page that requires authentication.
 * - If not authenticated → redirects to /bloggo/sign-in
 * - If authenticated but userType !== "bloggo" → redirects to /bloggo/sign-in
 * - While resolving auth state → renders nothing (avoids flash of protected content)
 *
 * Usage:
 *   <BloggoAuthGuard>{children}</BloggoAuthGuard>
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getCachedUser } from "@/api/user";
import { assertBloggoUser } from "@/lib/bloggo";

interface Props {
  children: React.ReactNode;
}

export default function BloggoAuthGuard({ children }: Props) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // wait for auth to resolve

    if (!isAuthenticated) {
      router.replace("/bloggo/sign-in");
      return;
    }

    const user = getCachedUser();
    const result = assertBloggoUser(user);

    if (!result.ok) {
      router.replace("/bloggo/sign-in");
    }
  }, [isLoading, isAuthenticated, router]);

  // Render nothing until we've confirmed access
  const user = getCachedUser();
  const allowed = !isLoading && isAuthenticated && !!assertBloggoUser(user).ok;
  if (isLoading || !allowed) return null;

  return <>{children}</>;
}
