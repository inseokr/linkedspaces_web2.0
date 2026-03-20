"use client";

// After Apple's redirect-mode sign-in, the callback route forwards here with
// ?token=...&username=... so we can store the token in localStorage and redirect.

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { notifyAuthChanged } from "@/hooks/useAuth";
import { setCachedUser } from "@/api/user";
import { assertBloggoUser } from "@/lib/bloggo";
import { apiFetch } from "@/api/client";
import type { User } from "@/api/user";

export default function AppleAuthDone() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const username = params.get("username");

    if (!token) {
      router.replace("/sign-in?error=apple_no_token");
      return;
    }

    // Store token temporarily to fetch user profile
    const store = (t: string) => {
      try {
        window.localStorage.setItem("token", t);
      } catch {
        try {
          window.sessionStorage.setItem("token", t);
        } catch {
          // ignore
        }
      }
    };

    const clear = () => {
      try {
        window.localStorage.removeItem("token");
      } catch {}
      try {
        window.sessionStorage.removeItem("token");
      } catch {}
    };

    async function finalize() {
      store(token!);

      try {
        // Fetch the full user object so we can run the Bloggo assertion and cache it
        const user = await apiFetch<User>(`/profile/${username}`, {
          token: token!,
        });

        const result = assertBloggoUser(user);
        if (!result.ok) {
          clear();
          router.replace(
            `/sign-in?error=${encodeURIComponent(result.message)}`,
          );
          return;
        }

        setCachedUser(user);
        notifyAuthChanged();
        router.replace(username ? `/bloggo/profile/${username}` : "/bloggo");
      } catch {
        // If profile fetch fails, still proceed — the token is valid
        notifyAuthChanged();
        router.replace(username ? `/bloggo/profile/${username}` : "/bloggo");
      }
    }

    finalize();
  }, [params, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-sm text-black/50">Signing you in…</p>
    </div>
  );
}
