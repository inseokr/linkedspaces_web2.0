"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";

type Props = {
  open: boolean;
  onClose: () => void;

  // 액션 훅 (원하면 연결)
  onGoogleSignIn?: () => void;
  onLogin?: (payload: {
    username: string;
    password: string;
    remember: boolean;
  }) => void;

  // 링크 액션 (원하면 연결)
  onForgotPassword?: () => void;
  onCreateAccount?: () => void;

  // 문구 커스텀
  title?: string; // "Join to LinkedSpaces!"
  googleLabel?: string; // "Sign in with Google"
  loginLabel?: string; // "Log in"

  className?: string;
};

export default function SignInModal({
  open,
  onClose,
  onGoogleSignIn,
  onLogin,
  onForgotPassword,
  onCreateAccount,
  title = "Join to LinkedSpaces!",
  googleLabel = "Sign in with Google",
  loginLabel = "Log in",
  className = "",
}: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  // 열릴 때 스크롤 잠금 + 포커스
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = window.setTimeout(() => firstInputRef.current?.focus(), 50);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const canSubmit = useMemo(() => {
    return username.trim().length > 0 && password.trim().length > 0;
  }, [username, password]);

  const submit = () => {
    onLogin?.({ username: username.trim(), password, remember });
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className={[
        "fixed inset-0 z-[9999]",
        "flex items-center justify-center",
        "bg-black/55 backdrop-blur-[2px]",
        className,
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in modal"
      onMouseDown={(e) => {
        // 바깥 클릭으로 닫기 (카드 내부 클릭은 무시)
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* close X (스크린샷처럼 카드 바깥 오른쪽 위 느낌) */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className={[
          "absolute right-10 top-24",
          "h-12 w-12 rounded-full",
          "text-white/95 hover:text-white",
          "flex items-center justify-center",
        ].join(" ")}
      >
        <span className="text-[44px] leading-none">×</span>
      </button>

      <div
        className={[
          "w-[520px] max-w-[92vw]",
          "rounded-[14px] bg-white",
          "shadow-[0_30px_90px_rgba(0,0,0,0.35)]",
          "px-12 py-12",
        ].join(" ")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* logo */}
        <div className="flex items-center justify-center">
          <LogoMark />
        </div>

        {/* title */}
        <h2 className="mt-6 text-center text-[28px] font-extrabold text-black">
          {title}
        </h2>

        {/* google */}
        <button
          type="button"
          onClick={onGoogleSignIn}
          className={[
            "mt-8 w-full h-[46px]",
            "rounded-[10px] border border-black/40",
            "bg-white hover:bg-black/[0.02]",
            "text-[14px] font-semibold text-black/80",
          ].join(" ")}
        >
          {googleLabel}
        </button>

        {/* divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-black/20" />
          <div className="text-[12px] font-semibold text-black/40">or</div>
          <div className="h-px flex-1 bg-black/20" />
        </div>

        {/* inputs */}
        <div className="space-y-4">
          <input
            ref={firstInputRef}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="User Name"
            className={[
              "w-full h-[46px]",
              "rounded-[10px] border border-black/25",
              "px-4 text-[14px] text-black",
              "outline-none focus:border-black/55",
            ].join(" ")}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className={[
              "w-full h-[46px]",
              "rounded-[10px] border border-black/25",
              "px-4 text-[14px] text-black",
              "outline-none focus:border-black/55",
            ].join(" ")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmit) submit();
            }}
          />
        </div>

        {/* remember */}
        <label className="mt-4 flex items-center gap-3 text-[12px] font-semibold text-black/70">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4"
          />
          Remember me
        </label>

        {/* login */}
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className={[
            "mt-5 w-full h-[44px] rounded-[10px]",
            "bg-[#5B6BE8] hover:bg-[#4E5EE0]",
            "text-white text-[14px] font-semibold",
            "disabled:opacity-40 disabled:hover:bg-[#5B6BE8] disabled:cursor-not-allowed",
          ].join(" ")}
        >
          {loginLabel}
        </button>

        {/* links */}
        <div className="mt-4 text-[12px]">
          <button
            type="button"
            onClick={onForgotPassword}
            className="font-semibold text-[#5B6BE8] hover:opacity-80"
          >
            Forgot password?
          </button>
        </div>

        <div className="mt-6 text-[12px] text-black/70">
          <div className="font-semibold">New to LinkedSpaces?</div>
          <button
            type="button"
            onClick={onCreateAccount}
            className="mt-1 font-semibold text-[#5B6BE8] hover:opacity-80"
          >
            Count an account in our app
          </button>
        </div>
      </div>
    </div>
  );
}

function LogoMark() {
  return (
    <div className="relative h-10 w-10">
      <Image
        src="/images/LS_blue.svg"
        alt="LinkedSpaces"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
