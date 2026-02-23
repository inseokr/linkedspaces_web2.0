"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getCachedUser } from "@/api/user";
import { assertBloggoUser } from "@/lib/bloggo";

export default function BloggoHomeRedirect() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      const user = getCachedUser();
      const result = assertBloggoUser(user);

      if (result.ok && user?.username) {
        // If they are on the bloggo.linkedspaces.com subdomain,
        // the middleware will rewrite /profile/username to /bloggo/profile/username.
        // We use the absolute path /bloggo/profile/username which works for both
        // subdomain and main domain (linkedspaces.com/bloggo).
        router.push(`/bloggo/profile/${user.username}`);
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return null;
}
