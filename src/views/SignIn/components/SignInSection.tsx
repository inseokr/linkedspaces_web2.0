"use client";

import Link from "next/link";
import { useState } from "react";
import VideoModal from "./VideoModal"; // 아까 만든 모달 컴포넌트 경로에 맞게 조정

export default function SignInSection() {
  const [openGuide, setOpenGuide] = useState(false);

  return (
    <section className="relative min-h-dvh w-full">
      <div className="relative z-10">
        <div className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[420px]">
            <h1 className="text-center text-[44px] font-semibold tracking-tight text-black">
              LinkedSpaces
            </h1>

            <button
              type="button"
              className="mt-8 w-full rounded-full border border-black/30 py-3 text-[14px] font-medium text-black hover:bg-black/[0.03] active:bg-black/[0.06] transition"
            >
              Sign in with Google
            </button>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 border-t border-dashed border-black/30" />
              <span className="text-[12px] font-medium text-black/60">or</span>
              <div className="h-px flex-1 border-t border-dashed border-black/30" />
            </div>

            <div className="space-y-4">
              <input
                placeholder="User Name"
                autoComplete="username"
                className="w-full rounded-2xl border border-black/25 px-5 py-3 text-[14px] outline-none focus:border-black/50"
              />

              <input
                placeholder="Password"
                type="password"
                autoComplete="current-password"
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
      <VideoModal
        open={openGuide}
        onClose={() => setOpenGuide(false)}
        title="Join to LinkedSpaces!"
        videoSrc="/videos/download.mp4"
      />
    </section>
  );
}
