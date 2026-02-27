"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/api/auth";
import Input from "@/bloggo/components/ui/Input";
import Button from "@/bloggo/components/ui/Button";
import Card from "@/bloggo/components/ui/Card";

export default function BloggoForgotPasswordSection() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = username.trim() !== "" || email.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setErrorMessage(null);
    setStatus("loading");
    const payload = {
      ...(username.trim() ? { username: username.trim() } : {}),
      ...(email.trim() ? { email: email.trim() } : {}),
    };
    try {
      const res = await requestPasswordReset(payload);
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(
          res.message || "Something went wrong. Please try again.",
        );
      }
    } catch (err: unknown) {
      setStatus("error");
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Request failed. Please try again or contact support.";
      setErrorMessage(msg);
    }
  };

  if (status === "success") {
    return (
      <div className="w-full max-w-[420px] mx-auto">
        <Card
          padding="lg"
          className="flex flex-col items-center text-center gap-4"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30">
            <svg
              className="w-7 h-7 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--bloggo-text-primary)]">
            Check your email
          </h2>
          <p className="text-sm text-[var(--bloggo-text-secondary)]">
            If we have an account matching what you entered, we&apos;ve sent you
            a link to reset your password. It may take a few minutes. Check your
            spam folder if you don&apos;t see it.
          </p>
          <Link href="/sign-in" className="mt-2">
            <Button variant="primary" size="md">
              Back to sign in
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <Card padding="lg">
        <h1 className="text-2xl font-bold text-[var(--bloggo-text-primary)] mb-1">
          Forgot password?
        </h1>
        <p className="text-sm text-[var(--bloggo-text-secondary)] mb-6">
          Enter your username and/or email and we&apos;ll send you a link to
          reset your password.
        </p>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <Input
            label="Username"
            id="forgot-username"
            type="text"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={status === "loading"}
            autoComplete="username"
          />
          <Input
            label="Email address"
            id="forgot-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            autoComplete="email"
          />
          {errorMessage && (
            <p
              role="alert"
              className="text-[13px] text-red-600 leading-snug rounded-lg bg-red-50 border border-red-200 px-4 py-3"
            >
              {errorMessage}
            </p>
          )}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={status === "loading"}
            disabled={!canSubmit || status === "loading"}
            className="w-full"
          >
            Send reset link
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/sign-in"
            className="text-[12px] text-[#4A69FF] hover:underline"
          >
            ← Back to sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
