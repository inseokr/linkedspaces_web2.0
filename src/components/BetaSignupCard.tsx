"use client";
import SignUpButton from "../views/Home/components/SignUpButton";
import { useRef, useState } from "react";

export default function BetaSignupSection() {
  const formRef = useRef<HTMLFormElement | null>(null);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [emailError, setEmailError] = useState<string>("");

  const validateEmail = () => {
    if (!email.trim()) return "Enter an email address like example@mysite.com.";
    // check if it is validate email form
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) return "Enter an email address like example@mysite.com.";
    return "";
  };

  const onSubmit = (e: React.FormEvent) => {
    console.log("onSubmit fired");
    e.preventDefault();
    // TODO: API 연동
    const msg = validateEmail();
    setEmailError(msg);

    if (msg) return;

    // TODO: API 연동
    console.log({ email, firstName });
  };

  return (
    <section id="beta-sign-up" className="scroll-mt-28 w-full py-16">
      {/* Outer container: center + max width similar to design */}
      <div className="mx-auto w-full max-w-[980px] px-6">
        {/* Card */}
        <div className="rounded-[20px] bg-[var(--card-bg)] p-6 shadow-card border border-[var(--card-border)] text-[var(--card-text)]">
          <form
            ref={formRef}
            noValidate
            onSubmit={onSubmit}
            className="flex flex-col gap-6"
          >
            {/* Title */}
            <h2 className="text-[35px] [font-family:var(--font-poppins)] font-bold">
              100 Spots, Join Beta Now!
            </h2>

            {/* Description */}
            <p className="text-lg font-normal leading-[27px] text-[var(--card-text-muted)]">
              We&apos;re almost ready... are you? Say goodbye to “Where was that
              again?” and hello to never forgetting a memory with LinkedSpaces!
              Start saving moments before they fade away.
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
                  className={`h-[40px] w-full border bg-[var(--input-bg)] px-[8px] py-[2px] text-[var(--card-text)] placeholder:text-[var(--card-text-muted)] outline-none leading-[24px] focus:border-[var(--color-main)] ${
                    emailError
                      ? "border-red-500"
                      : "border-[var(--input-border)]"
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
                  className="h-[40px] w-full border border-[var(--input-border)] bg-[var(--input-bg)] px-[8px] py-[2px] text-base text-[var(--card-text)] placeholder:text-[var(--card-text-muted)] outline-none leading-[24px] focus:border-[var(--color-main)]"
                />
              </label>
            </div>

            {/* Helper text */}
            <div className="flex flex-col gap-7 text-[18px] leading-[21.6px] text-[var(--card-text-muted)]">
              <p>
                You will be able to invite one friend to access these premium
                services!
              </p>
              <p>Only available on IOS</p>
            </div>

            {/* CTA */}
            <SignUpButton type="submit">Sign Up Now</SignUpButton>
          </form>
        </div>
      </div>
    </section>
  );
}
