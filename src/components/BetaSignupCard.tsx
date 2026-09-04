"use client";
import SignUpButton from "../views/Home/components/SignUpButton";
import { joinWaitlist } from "@/api/waitlist";
import { useRef, useState } from "react";

export default function BetaSignupSection() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const formStartedAtRef = useRef<number>(Date.now());

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [emailError, setEmailError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateEmail = () => {
    if (!email.trim()) return "Enter an email address like example@mysite.com.";
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) return "Enter an email address like example@mysite.com.";
    return "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validateEmail();
    setEmailError(msg);
    setSubmitError(null);

    if (msg) return;

    setSubmitting(true);
    try {
      await joinWaitlist(email.trim(), firstName.trim() || undefined, {
        website: honeypot,
        formStartedAt: formStartedAtRef.current,
      });
      setSubmitSuccess(true);
      setEmail("");
      setFirstName("");
      setHoneypot("");
    } catch (err) {
      const status = (err as { status?: number })?.status;
      const message =
        status === 429
          ? "Too many attempts. Please try again later."
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="beta-sign-up" className="scroll-mt-28 w-full py-4">
      {/* Outer container: center + max width similar to design */}
      <div className="mx-auto w-full max-w-[980px] px-6">
        {/* Card */}
        <div className="rounded-[32px] bg-white/85 backdrop-blur-xl p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/20 text-gray-900 transition-all duration-300 hover:shadow-[0_48px_80px_-20px_rgba(0,0,0,0.15)]">
          <form
            ref={formRef}
            noValidate
            onSubmit={onSubmit}
            className="relative flex flex-col gap-6"
          >
            {/* Title */}
            <h2 className="text-[35px] [font-family:var(--font-poppins)] font-bold">
              100 Spots, Join Beta Now!
            </h2>

            {/* Description */}
            <p className="text-xl font-medium leading-relaxed text-gray-600/90 max-w-2xl">
              We&apos;re almost ready... are you? Say goodbye to &quot;Where was
              that again?&quot; and hello to never forgetting a memory with
              LinkedSpaces! Start saving moments before they fade away.
            </p>

            {/* Fields */}
            <div className="flex flex-col gap-6">
              {/* Email */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-normal">
                  Apple ID Email <span>*</span>
                </span>
                <input
                  id="appleEmail"
                  name="appleEmail"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  aria-invalid={!!emailError}
                  className={`h-12 w-full rounded-xl border bg-white/50 px-4 py-2 text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
                    emailError ? "border-red-500" : "border-gray-200"
                  }`}
                />

                {emailError ? (
                  <div className="flex items-center text-sm text-[var(--color-warning)] leading-[20px] [font-family:'Wix_Madefor_Text']">
                    {/* warning icon */}
                    <span className="inline-flex h-[13px] w-[13px] mr-[5.5px] items-center justify-center rounded-full border border-[var(--color-warning)] text-xs leading-none">
                      !
                    </span>
                    <span>{emailError}</span>
                  </div>
                ) : null}
              </label>

              {/* First name */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-normal">First Name</span>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  type="text"
                  placeholder="Optional"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-2 text-base text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </label>

              {/* Honeypot: hidden from people, bots often fill it */}
              <label
                className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
                aria-hidden="true"
              >
                Website
                <input
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>

            {/* Helper text */}
            <div className="flex flex-col gap-7 text-[18px] leading-[21.6px] text-gray-500/80">
              <p>
                You will be able to invite one friend to access these premium
                services!
              </p>
              <p>Only available on IOS</p>
            </div>

            {/* Success / error feedback */}
            {submitSuccess && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                You&apos;re on the list! We&apos;ll be in touch.
              </div>
            )}
            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {/* CTA */}
            <SignUpButton type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Sign Up Now"}
            </SignUpButton>
          </form>
        </div>
      </div>
    </section>
  );
}
