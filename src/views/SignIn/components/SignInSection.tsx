"use client";

import Link from "next/link";
import { useState } from "react";
import VideoGuideModal from "./VideoModal";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { notifyAuthChanged } from "@/hooks/useAuth";
import { loginWithGoogle, loginWithJwt, isLoginSuccess } from "@/api/auth";
import { setCachedUser } from "@/api/user";

export default function SignInSection() {
  const [openGuide, setOpenGuide] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Google login
  const handleGoogleLogin = async (response: any) => {
    const idToken = response.credential || response.tokenId;
    if (!idToken) return;

    const data = await loginWithGoogle(idToken);

    if (isLoginSuccess(data)) {
      localStorage.setItem("token", data.token);
      setCachedUser(data.user);
      notifyAuthChanged();
      router.push("/profile");
    } else {
      alert("Failed to log in with Google.");
    }
  };

  // JWT login button handler
  const handleLogin = async () => {
    const data = await loginWithJwt(username, password);

    if (isLoginSuccess(data)) {
      localStorage.setItem("token", data.token);
      setCachedUser(data.user);
      notifyAuthChanged();
      router.push("/profile");
    } else {
      alert("check username or password.");
    }
  };

  return (
    <section className="relative min-h-dvh w-full">
      <div className="relative z-10">
        <div className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[420px]">
            <h1 className="text-center text-[44px] font-semibold tracking-tight text-black">
              LinkedSpaces
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
                className="w-full rounded-2xl border border-black/25 px-5 py-3 text-[14px] outline-none focus:border-black/50"
              />

              <input
                placeholder="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-black/25 px-5 py-3 text-[14px] outline-none focus:border-black/50"
              />

              <label className="flex items-center gap-3 pt-1 text-[14px] text-black/80">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border border-black/30"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={handleLogin} // Call general login
                className="mt-2 w-full rounded-xl bg-[#4A69FF] py-3 text-[14px] font-semibold text-white hover:opacity-90 active:opacity-80 transition"
              >
                Log in
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

            <div className="mt-6 text-[12px] text-black/70">
              <div className="font-medium">New to LinkedSpaces?</div>

              {/* Modal Trigger */}
              <button
                type="button"
                onClick={() => setOpenGuide(true)}
                className="text-[#4A69FF] hover:underline"
              >
                Create an account in our app
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <VideoGuideModal
        open={openGuide}
        onClose={() => setOpenGuide(false)}
        title="Join to LinkedSpaces!"
        videoSrc="/videos/download.mp4"
      />
    </section>
  );
}
