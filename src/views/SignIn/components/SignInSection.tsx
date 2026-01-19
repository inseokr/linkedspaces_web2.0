"use client";

import Link from "next/link";
import { useState } from "react";
import VideoGuideModal from "./VideoModal";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { notifyAuthChanged } from "@/hooks/useAuth";

// Google OAuth 2.0 login
const googleLogin = async (idToken: string, router: any) => {
  try {
    const response = await fetch(
      "https://pocketverse.herokuapp.com/LS_API/oauth/google",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken,
        }),
      },
    );

    const data = await response.json();

    if (data.message === "ok") {
      localStorage.setItem("token", data.token);
      console.log("User info:", data.user);
      notifyAuthChanged();
      // Redirect to profile or dashboard
      router.push("/profile");
    } else {
      console.error("Authentication failed");
      alert("Failed to log in with Google.");
    }
  } catch (error) {
    console.error("Error during Google login:", error);
  }
};

// JWT login

const jwtLogin = async (username: string, password: string, router: any) => {
  try {
    const response = await fetch(
      "https://pocketverse.herokuapp.com/LS_API/jwt_login_v1",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      },
    );

    // 401, 404 등 에러 핸들링
    if (!response.ok) {
      const errorDetail = await response.text();
      console.error(`login failed status code: ${response.status}`);
      alert("check username or password.");
      return;
    }

    const data = await response.json();

    if (data.message === "ok") {
      localStorage.setItem("token", data.token);
      console.log("User info:", data.user);
      notifyAuthChanged();
      //  successfully logged in, redirect to profile or dashboard
      router.push("/profile");
    } else {
      console.error("Authentication failed");
      alert("login failed. Please try again.");
    }
  } catch (error) {
    console.error("Error during JWT login:", error);
  }
};

export default function SignInSection() {
  const [openGuide, setOpenGuide] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Google login
  const handleGoogleLogin = (response: any) => {
    console.log("Google Response:", response);
    const token = response.credential || response.tokenId;

    if (token) {
      googleLogin(token, router);
    } else {
      console.error("cannot find token in Google response");
    }
  };

  // general login
  const handleLogin = async () => {
    await jwtLogin(username, password, router);
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
