import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/hyodo/components/LegalPage";
import { SUPPORT_EMAIL } from "@/hyodo/lib/site";

export const metadata: Metadata = {
  title: "Support",
  description: "How Hyodo works, common fixes, and how to reach us.",
  alternates: { canonical: "/support" },
};

// Source: iOS repo, Store/support.md
const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "How does it work?",
    a: (
      <>
        The person who lives alone installs Hyodo and sets their home. A family
        member installs it too and enters the 6-character code. If the phone
        sits unused at home longer than the limit you pick (8, 12 or 24 hours),
        the family member gets an alert.
      </>
    ),
  },
  {
    q: "Does it track my location?",
    a: (
      <>
        No. Hyodo only knows whether the phone is inside the home circle. Family
        members see &ldquo;home&rdquo; or &ldquo;away&rdquo;, never a place.
      </>
    ),
  },
  {
    q: "I'm not getting alerts.",
    a: (
      <>
        On the family member&rsquo;s phone, check Settings → Notifications →
        Hyodo. On the watched phone, location must be set to{" "}
        <strong>Always</strong> with <strong>Precise</strong> on.
      </>
    ),
  },
  {
    q: "It says “phone not reporting”.",
    a: (
      <>
        The watched phone may be off, out of battery, or offline. Hyodo tells
        you this so silence never looks like &ldquo;all fine&rdquo;.
      </>
    ),
  },
  {
    q: "What's a knock?",
    a: (
      <>
        One tap that says &ldquo;thinking of you.&rdquo; The other person sees
        it and can knock back. 💜
      </>
    ),
  },
  {
    q: "How do I delete my data?",
    a: (
      <>
        Settings → Delete my data. No longer have the app? See{" "}
        <Link href="/delete-account">Delete account</Link>.
      </>
    ),
  },
];

export default function HyodoSupportPage() {
  return (
    <LegalPage
      eyebrow="Help"
      title="Support"
      showLastUpdated={false}
      intro="Answers to common questions. Still stuck? Email us and we'll help."
    >
      <div className="flex flex-col gap-3">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="hw-card group px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-[var(--hw-ink)]">
              {item.q}
              <span
                aria-hidden="true"
                className="text-xl leading-none text-[var(--hw-brand-mid)] transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 mb-0">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="hw-card mt-8 p-6 text-center">
        <h2 className="!mt-0">Contact us</h2>
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Hyodo support")}`}
          className="hw-button !text-white !no-underline"
        >
          Email {SUPPORT_EMAIL}
        </a>
      </div>
    </LegalPage>
  );
}
