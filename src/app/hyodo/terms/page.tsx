import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/hyodo/components/LegalPage";
import { COMPANY, SUPPORT_EMAIL } from "@/hyodo/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using Hyodo.",
  alternates: { canonical: "/terms" },
};

// Source: iOS repo, Store/terms-of-service.md
export default function HyodoTermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={
        <>
          Hyodo is provided by {COMPANY} (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
          By using Hyodo, you agree to these terms. If you don&rsquo;t agree,
          please don&rsquo;t use the app.
        </>
      }
    >
      <h2>What Hyodo is, and isn&rsquo;t</h2>
      <p>
        Hyodo is a <strong>peace-of-mind tool</strong>. It tells a family member
        when a phone has been quiet at home for longer than they chose, and it
        lets the two of you send knocks.
      </p>
      <p>
        <strong>Hyodo is not an emergency service or a medical device.</strong>
      </p>
      <ul>
        <li>It doesn&rsquo;t call 911 or emergency services.</li>
        <li>It doesn&rsquo;t detect falls or health problems.</li>
        <li>
          It can miss or delay alerts. That can happen if the phone is off, out
          of battery or offline, if location or notifications are turned off, or
          because of carrier, Apple, Google or server problems.
        </li>
      </ul>
      <div className="my-5 rounded-2xl border border-[#f3c9c7] bg-[#fdf1f0] px-4 py-3.5 text-[var(--hw-ink)]">
        If you think someone is in danger, call them or call your local
        emergency number.{" "}
        <strong className="text-[var(--hw-coral)]">
          Don&rsquo;t wait for Hyodo.
        </strong>
      </div>

      <h2>Consent</h2>
      <ul>
        <li>The person whose phone is watched must know about it and agree.</li>
        <li>
          Use Hyodo only with someone who chose to share their status with you.
        </li>
        <li>
          Don&rsquo;t install it on another person&rsquo;s phone without their
          permission.
        </li>
        <li>
          Either person can stop at any time with{" "}
          <strong>Settings → Delete my data</strong>.
        </li>
      </ul>

      <h2>Your responsibilities</h2>
      <ul>
        <li>
          Keep the app installed, location set to &ldquo;Always&rdquo;, and
          notifications on, so Hyodo can work.
        </li>
        <li>Share your family code only with people you trust.</li>
        <li>
          Don&rsquo;t misuse the service: no spamming knocks, no trying to
          access other families, no interfering with the servers.
        </li>
      </ul>

      <h2>The service</h2>
      <ul>
        <li>Hyodo 1.0 is free.</li>
        <li>
          We may change, pause or end features. If paid features come later,
          they&rsquo;ll be clearly marked, and we won&rsquo;t charge you without
          your agreement.
        </li>
        <li>We may suspend access that breaks these terms.</li>
      </ul>

      <h2>Your data</h2>
      <p>
        How we handle data is described in the{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>No warranty, and limits on liability</h2>
      <ul>
        <li>
          Hyodo is provided &ldquo;as is&rdquo;, without warranties of any kind.
        </li>
        <li>
          As far as the law allows, we aren&rsquo;t liable for harm or losses
          caused by missed, late or incorrect alerts, or by not being able to
          use the service.
        </li>
        <li>
          Nothing in these terms limits rights you have under consumer law that
          can&rsquo;t be waived.
        </li>
      </ul>

      <h2>Ownership and governing law</h2>
      <p>
        Hyodo, its content, and its features are owned by {COMPANY}. These terms
        are governed by the laws of the State of California, without regard to
        its conflict-of-law rules.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. If the changes are significant, we&rsquo;ll
        let you know in the app. Using Hyodo after an update means you accept
        the new terms.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </LegalPage>
  );
}
