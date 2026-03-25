"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { getGoogleOAuthWebClientId } from "@/config/googleOAuthWeb";

type Props = {
  open: boolean;
  onClose: () => void;

  onGoogleSignIn?: (credential: string) => void;
  onLogin?: (payload: {
    username: string;
    password: string;
    remember: boolean;
  }) => void;

  onForgotPassword?: () => void;
  onCreateAccount?: () => void;

  title?: string;
  className?: string;
};

export default function BloggoSignInModal({
  open,
  onClose,
  onGoogleSignIn,
  onLogin,
  onForgotPassword,
  onCreateAccount,
  title = "Bloggo",
  className = "",
}: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

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

  const handleGoogleSuccess = (response: {
    credential?: string;
    tokenId?: string;
  }) => {
    const token = response.credential || response.tokenId;
    if (token) {
      onGoogleSignIn?.(token);
    }
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
      aria-label="Bloggo Sign in modal"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className={[
          "absolute right-6 top-6 lg:right-10 lg:top-24",
          "h-12 w-12 rounded-full",
          "text-white/95 hover:text-white",
          "flex items-center justify-center z-50",
        ].join(" ")}
      >
        <span className="text-[44px] leading-none">×</span>
      </button>

      <div
        className={[
          "w-[420px] max-w-[92vw]",
          "rounded-[14px] bg-white",
          "shadow-[0_30px_90px_rgba(0,0,0,0.35)]",
          "px-8 py-10",
        ].join(" ")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-center text-[32px] font-semibold tracking-tight text-black">
          {title}
        </h2>

        <GoogleOAuthProvider clientId={getGoogleOAuthWebClientId("bloggo")}>
          <div className="mt-8 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              useOneTap
              text="signin_with"
              shape="circle"
              theme="outline"
              width="356"
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
            ref={firstInputRef}
            placeholder="User Name"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

        <label className="mt-4 flex items-center gap-3 text-[14px] text-black/80">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border border-black/30"
          />
          Remember me
        </label>

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className={[
            "mt-5 w-full h-[46px] rounded-xl",
            "bg-[#4A69FF] hover:opacity-90 active:opacity-80 transition sequence",
            "text-white text-[14px] font-semibold",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          Log in
        </button>

        <div className="mt-4">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[12px] text-[#4A69FF] hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <div className="mt-6 text-[12px] text-black/70">
          <div className="font-medium">New to Bloggo?</div>
          <button
            type="button"
            onClick={onCreateAccount}
            className="text-[#4A69FF] hover:underline"
          >
            Create an account in our app
          </button>
        </div>
      </div>
    </div>
  );
}
