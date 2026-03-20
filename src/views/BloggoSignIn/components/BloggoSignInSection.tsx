"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import VideoGuideModal from "@/views/SignIn/components/VideoModal";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { notifyAuthChanged } from "@/hooks/useAuth";
import {
  loginWithGoogle,
  loginWithApple,
  loginWithJwt,
  isLoginSuccess,
} from "@/api/auth";
import { setCachedUser } from "@/api/user";
import { assertBloggoUser } from "@/lib/bloggo";

// Apple Sign in with Apple JS SDK type declarations
declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<{
          authorization: { id_token: string; code: string };
          user?: { name?: { firstName?: string; lastName?: string } };
        }>;
      };
    };
  }
}

const APPLE_CLIENT_ID = "com.bloggo.bloggo";
const APPLE_REDIRECT_URI =
  "https://bloggo.linkedspaces.com/auth/apple/callback";

export default function BloggoSignInSection() {
  const [openGuide, setOpenGuide] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appleReady, setAppleReady] = useState(false);
  const router = useRouter();

  // Load Apple Sign-in JS SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.onload = () => {
      window.AppleID?.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: "name email",
        redirectURI: APPLE_REDIRECT_URI,
        usePopup: true,
      });
      setAppleReady(true);
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // ── Token storage (localStorage → sessionStorage fallback) ──────────────────
  const persistTokenBestEffort = (token: string) => {
    try {
      window.localStorage.setItem("token", token);
      return;
    } catch {
      // ignore and try sessionStorage fallback
    }
    try {
      window.sessionStorage.setItem("token", token);
    } catch {
      // ignore
    }
  };

  // ── Clear token (local logout without redirect) ──────────────────────────────
  const clearTokenLocally = () => {
    try {
      window.localStorage.removeItem("token");
    } catch {
      // ignore
    }
    try {
      window.sessionStorage.removeItem("token");
    } catch {
      // ignore
    }
  };

  // ── Shared post-login check ───────────────────────────────────────────────────
  /**
   * After a successful authentication response:
   *  1. Store the token temporarily so we can check userType.
   *  2. assert the user is a Bloggo account.
   *  3a. OK → cache user, notify, redirect to their profile.
   *  3b. Fail → clear the token, show an inline error (no redirect).
   */
  const handleAuthSuccess = (
    token: string,
    user: Parameters<typeof assertBloggoUser>[0],
  ) => {
    const result = assertBloggoUser(user);

    if (!result.ok) {
      // Block — do not persist token or cache user
      clearTokenLocally();
      setError(result.message);
      return;
    }

    // Persist token and cache user only for Bloggo accounts
    persistTokenBestEffort(token);
    // user.userType is "bloggo" here; user is the full User object from login
    setCachedUser(user as Parameters<typeof setCachedUser>[0]);
    notifyAuthChanged();

    const dest =
      user && "username" in user && user.username
        ? `/bloggo/profile/${(user as { username: string }).username}`
        : "/bloggo";
    router.push(dest);
  };

  // ── Google login ─────────────────────────────────────────────────────────────
  const handleGoogleLogin = async (response: {
    credential?: string;
    tokenId?: string;
  }) => {
    setError(null);
    setIsLoading(true);
    try {
      const idToken = response.credential || response.tokenId;
      if (!idToken) return;

      const data = await loginWithGoogle(idToken);

      if (isLoginSuccess(data)) {
        handleAuthSuccess(data.token, data.user);
      } else {
        setError("Failed to log in with Google.");
      }
    } catch (e) {
      console.error("[bloggo-login] google failed", e);
      setError("Failed to log in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Apple login ───────────────────────────────────────────────────────────────
  const handleAppleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await window.AppleID!.auth.signIn();
      const idToken = response.authorization?.id_token;
      if (!idToken) {
        setError("Failed to log in with Apple.");
        return;
      }
      const firstName = response.user?.name?.firstName ?? "";
      const lastName = response.user?.name?.lastName ?? "";
      const fullName =
        [firstName, lastName].filter(Boolean).join(" ") || undefined;

      const data = await loginWithApple(idToken, fullName);
      if (isLoginSuccess(data)) {
        handleAuthSuccess(data.token, data.user);
      } else {
        setError("Failed to log in with Apple.");
      }
    } catch (e) {
      // User cancelled popup — no error shown
      const err = e as { error?: string };
      if (err?.error !== "popup_closed_by_user") {
        console.error("[bloggo-login] apple failed", e);
        setError("Failed to log in with Apple. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── JWT login ─────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await loginWithJwt(username, password);

      if (isLoginSuccess(data)) {
        handleAuthSuccess(data.token, data.user);
      } else {
        setError("Incorrect username or password.");
      }
    } catch (e) {
      console.error("[bloggo-login] jwt failed", e);
      setError("Failed to log in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <section className="relative min-h-dvh w-full">
      <div className="relative z-10">
        <div className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[420px]">
            <h1 className="text-center">
              <Link
                href="/bloggo"
                className="text-[44px] font-semibold tracking-tight text-black hover:opacity-80 transition-opacity"
              >
                Bloggo
              </Link>
            </h1>

            <GoogleOAuthProvider clientId="365835568807-9s56gicbdaj9vkn3kkbkvs2crt8k764e.apps.googleusercontent.com">
              <div className="mt-8 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  useOneTap
                  text="signin_with"
                  shape="circle"
                  theme="outline"
                  width="380"
                />
              </div>
            </GoogleOAuthProvider>

            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={handleAppleLogin}
                disabled={!appleReady || isLoading}
                className="flex h-[40px] w-[380px] items-center justify-center gap-2 rounded-full border border-black/20 bg-black px-4 text-[14px] font-medium text-white hover:opacity-90 active:opacity-80 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 814 1000"
                  className="h-5 w-5 fill-white"
                  aria-hidden="true"
                >
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 523 26.3 321.3 81.3 203.9c13.4-28.8 41.3-63.8 93.4-105.1C245.8 38.7 335.9 6.5 422.5 5.8c.2 0 .2 0 .3 0 1.5 0 3 .1 4.5.2l-.1.1c58.2 1.8 111.6 28.2 150.3 55.7 36.2 25.9 63 55.8 68.7 64.4l-.1-.1c13.7 21.4 17 23.1 11.9 40.8z" />
                </svg>
                Sign in with Apple
              </button>
            </div>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 border-t border-dashed border-black/30" />
              <span className="text-[12px] font-medium text-black/60">or</span>
              <div className="h-px flex-1 border-t border-dashed border-black/30" />
            </div>

            <div className="space-y-4">
              <input
                placeholder="User Name"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                className={[
                  "w-full h-[46px]",
                  "rounded-[10px] border border-black/25",
                  "px-4 text-[14px] text-black",
                  "outline-none focus:border-black/55",
                ].join(" ")}
              />

              <input
                placeholder="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-2xl border border-black/25 px-5 py-3 text-[14px] placeholder:text-black/50 outline-none focus:border-black/50"
              />

              {/* Inline error message */}
              {error && (
                <p
                  role="alert"
                  className="text-[13px] text-red-600 leading-snug rounded-lg bg-red-50 border border-red-200 px-4 py-3"
                >
                  {error}
                </p>
              )}

              <label className="flex items-center gap-3 pt-1 text-[14px] text-black/80">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border border-black/30"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className="mt-2 w-full rounded-xl bg-[#4A69FF] py-3 text-[14px] font-semibold text-white hover:opacity-90 active:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in…" : "Log in"}
              </button>
            </div>

            <div className="mt-4">
              <Link
                href="/forgot-password"
                className="text-[12px] text-[#4A69FF] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Temporarily hidden — "New to Bloggo?" sign-up prompt
            <div className="mt-6 text-[12px] text-black/70">
              <div className="font-medium">New to Bloggo?</div>

              <button
                type="button"
                onClick={() => setOpenGuide(true)}
                className="text-[#4A69FF] hover:underline"
              >
                Create an account in our app
              </button>
            </div>
            */}
          </div>
        </div>
      </div>

      {/* Modal */}
      <VideoGuideModal
        open={openGuide}
        onClose={() => setOpenGuide(false)}
        title="Join Bloggo!"
        videoSrc="/videos/download.mp4"
      />
    </section>
  );
}
